class ImportEkstoreProductJob
  include Sidekiq::Worker
  sidekiq_options queue: :import_ekstore_product

  def perform(shopify_account_id)
    shopify_account = ShopifyAccount.find(shopify_account_id)

    if shopify_account.present? && shopify_account.long_lived_token.present?
      fetch_and_update_from_shopify(shopify_account, synced_via: :script)
    else
      Rails.logger.error("Shopify account #{shopify_account_id} is not present or long_lived_token is not present")
      return false
    end
  end

  def fetch_and_update_from_shopify(shopify_account, shopify_product_ids: [], synced_via: :manual)
    shopify_account.update_reachability
    unless shopify_account.reload.reachable
      # Mark all vendor sku details of this Shopify account as unavailable
      product_vsds = VendorSkuDetail.where(sku_type: :product, 
                                            organisation_id: shopify_account.organisation_id,
                                            warehouse_id: shopify_account.warehouse.id)
      mark_unavailable(product_vsds, synced_via: synced_via)
      return
    end

    request_options = { headers: shopify_account.admin_api_headers, verify: true }
    api_version = '2025-01'
    endpoint = "#{shopify_account.admin_rest_api_base_url}#{api_version}/products.json?limit=250"
    endpoint = endpoint + "&ids=#{shopify_product_ids.join(',')}" if shopify_product_ids.present?
    next_page_url = endpoint

    pvsd_ids_available_in_api = []
    loop do
      res = HTTParty.get(next_page_url, request_options)

      if res['products'].nil?
        ShopifyRequestLog.create(url: next_page_url, logs: res.parsed_response)
        raise "Shopify product fetch error: #{res.parsed_response}"
      end

      pvsd_ids_available_in_api += update_vsds_using_shopify_payload(shopify_account, res['products'], synced_via) if res['products'].present?

      # link_headers contain the URL for next page. Shopify uses cursor based paginantion.
      next_page_url = ShopifyAccount.next_page_url(res.headers['link'])
      break if next_page_url.nil?
    end

    # Update all VSDs that have been deleted in Shopify
    pvsds_not_available_in_api = VendorSkuDetail.where(sku_type: 0,
                                                        organisation_id: shopify_account.organisation_id, 
                                                        warehouse_id: shopify_account.warehouse.id,
                                                        available_in_api: true)
                                                .where.not(id: pvsd_ids_available_in_api)
    
    pvsds_not_available_in_api = pvsds_not_available_in_api.where(unique_identifier: shopify_product_ids) if shopify_product_ids.present?
    # mark_unavailable(pvsds_not_available_in_api, synced_via: synced_via) if pvsds_not_available_in_api.present?
  end

  def update_vsds_using_shopify_payload(shopify_account, payload, synced_via = :manual)
    return if shopify_account.blank? || payload.blank?

    product_vsds = []
    variant_vsds = []
    all_tags = []
    organisation_id = shopify_account.organisation_id
    warehouse_id = shopify_account.warehouse.id
    sca = shopify_account.shopify_custom_app
    parent_vsd_unique_identifiers = payload.map { |product| product['id'] }
    variant_vsd_unique_identifiers = payload.flat_map { |product| product['variants'].map { |variant| variant['id'] } }
    # Create hash of existing variant vendor_sku_details for looking up stock delta data later
    vsd_unique_identifier_vsd_hash = VendorSkuDetail.where(unique_identifier: variant_vsd_unique_identifiers,
                                                            sku_type: 10,
                                                            organisation_id: organisation_id,
                                                            warehouse_id: warehouse_id)
                                                    .each_with_object({}) { |vsd, hash| hash[vsd.unique_identifier] = vsd }
    payload.each do |product|
      
      product_tags = product['tags'].to_s.split(",").compact.map{ |tag| tag.strip }
      all_tags << product_tags
      product_image_urls = product['images'].map { |i| i['src'] }
      product_eligible_for_listing = product['status'] == 'active' &&
        (sca.listing_tags.blank? || (sca.listing_tags & product_tags).present?) &&
        (sca.non_listing_tags.blank? || (sca.non_listing_tags & product_tags).empty?) &&
        (sca.listing_vendors.blank? || sca.listing_vendors.include?(product['vendor'])) &&
        sca.non_listing_vendors.exclude?(product['vendor']) && product_image_urls.present?

      variants_listing_eligibility = []
      product['variants'].each do |variant|
        featured_image_url = product.dig('images').find { |image| image['id'] == variant['image_id'] }&.dig('src').presence || product.dig('image', 'src')
        variant_vsd_attributes = {
          sku_type: VendorSkuDetail.sku_types[:variant],
          unique_identifier: variant['id'],
          parent_unique_identifier: variant['product_id'],
          title: variant['title'],
          featured_image: featured_image_url,
          images: product_image_urls.rotate((product_image_urls.index(featured_image_url) || 0)),
          compare_at_price: variant['compare_at_price'],
          price: variant['price'],
          inventory_management: variant['inventory_management'],
          inventory_policy: variant['inventory_policy'],
          inventory_quantity: variant['inventory_quantity'],
          sku: variant['sku'],
          weight: variant['weight'],
          weight_unit: variant['weight_unit'],
          taxable: variant['taxable'],
          barcode: variant['barcode'],
          requires_shipping: variant['requires_shipping'],
          shopify_created_at: variant['created_at'],
          shopify_updated_at: variant['updated_at'],
          response_data: variant,
          organisation_id: organisation_id,
          warehouse_id: warehouse_id,
          synced_via: synced_via,
          available_in_api: true,
          deleted_in_shopify_at: nil,
          shopify_custom_app_id: shopify_account.shopify_custom_app_id,
        }

        # Record stock delta
        vsd = vsd_unique_identifier_vsd_hash[variant['id']]
        stock_delta = (variant['inventory_quantity'].presence || 0) - (vsd&.inventory_quantity.presence || 0)
        positive_stock_delta_last_detected_on = stock_delta > 0 ? Time.current : vsd&.positive_stock_delta_last_detected_on
        negative_stock_delta_last_detected_on = stock_delta.negative? ? Time.current : vsd&.negative_stock_delta_last_detected_on
        variant_vsd_attributes[:last_positive_stock_delta] = stock_delta >= 0 ? stock_delta : vsd&.last_positive_stock_delta
        variant_vsd_attributes[:positive_stock_delta_last_detected_on] = positive_stock_delta_last_detected_on
        variant_vsd_attributes[:last_negative_stock_delta] = stock_delta.negative? ? stock_delta : vsd&.last_negative_stock_delta
        variant_vsd_attributes[:negative_stock_delta_last_detected_on] = negative_stock_delta_last_detected_on

        last_stock_change_date = [positive_stock_delta_last_detected_on, negative_stock_delta_last_detected_on].compact.max
        variant_eligible_for_listing = product_eligible_for_listing &&
          variant['price'].to_f >= sca.listing_price_threshold && 
          last_stock_change_date.present? && last_stock_change_date > sca.unsold_days_listing_cutoff
        variant_vsd_attributes[:eligible_for_listing] = variant_eligible_for_listing
        variant_vsds << variant_vsd_attributes
        variants_listing_eligibility << variant_eligible_for_listing
      end
      product_eligible_for_listing = product_eligible_for_listing && variants_listing_eligibility.any?
      
      product_vsds << {
        sku_type: VendorSkuDetail.sku_types[:product],
        unique_identifier: product['id'],
        title: product['title'],
        handle: product['handle'],
        status: product['status'],
        vendor: product['vendor'],
        product_type: product['product_type'],
        featured_image: product.dig('image', 'src'),
        images: product_image_urls,
        body_html: product['body_html'],
        tags: product_tags,
        published_at: product['published_at'],
        shopify_created_at: product['created_at'],
        shopify_updated_at: product['updated_at'],
        response_data: product,
        organisation_id: organisation_id,
        warehouse_id: warehouse_id,
        synced_via: synced_via,
        available_in_api: true,
        deleted_in_shopify_at: nil,
        shopify_custom_app_id: shopify_account.shopify_custom_app_id,
        eligible_for_listing: product_eligible_for_listing,
      }
    end

    pvsd_ids = VendorSkuDetail.import(product_vsds, on_duplicate_key_update: {
      conflict_target: [:unique_identifier],
      index_predicate: 'deleted_at IS NULL',
      columns: product_vsds[0].keys },
      validate: false,
      batch_size: 100,
    ).ids

    VendorSkuDetail.import(variant_vsds, on_duplicate_key_update: {
      conflict_target: [:unique_identifier],
      index_predicate: 'deleted_at IS NULL',
      columns: variant_vsds[0].keys },
      validate: false,
      batch_size: 100,
    ).ids

    # Mark existing variant VSDs as unavailable if any
    VendorSkuDetail.where(parent_unique_identifier: parent_vsd_unique_identifiers, sku_type: 10)
                    .where.not(unique_identifier: variant_vsd_unique_identifiers)
                    .update_all(available_in_api: false, updated_at: Time.current)

    # Update tags
    ShopifyTag.import(
      all_tags.flatten.map(&:strip).uniq.map{|tag| { name: tag, shopify_account_id: shopify_account.id } },
      on_duplicate_key_ignore: true,
      validate: false,
    )

    # Return product vendor_sku_details' ids
    pvsd_ids
  end

end
