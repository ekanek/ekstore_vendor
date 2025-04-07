# frozen_string_literal: true

class VendorSkuDetail < ApplicationRecord # :nodoc:
  belongs_to :ekanek_sku, class_name: 'Sku', foreign_key: 'sku_id', optional: true
  belongs_to :organisation
  belongs_to :product, optional: true
  belongs_to :warehouse, optional: true
  belongs_to :vendor_sku_detail, foreign_key: :parent_unique_identifier, primary_key: :unique_identifier, optional: true
  belongs_to :shopify_custom_app
  has_one :shopify_account, through: :warehouse

  has_many :metafield_values

  def readonly?
    true
  end

  def mapped_field_value(ekanek_field)
    Rails.cache.fetch(["mapped_field_value", ekanek_field, id, SERVER_START_TIME]) do
      shopify_custom_app = shopify_account&.shopify_custom_app
  
      shopify_field_mapping = ShopifyFieldMapping.find_by(shopify_custom_app_id: shopify_custom_app&.id, ekanek_field: ekanek_field)
      return if shopify_field_mapping.nil?
  
      shopify_field = shopify_field_mapping.shopify_field
      if shopify_field.present?
        return (self.send(shopify_field) rescue nil)
      else
        metafield_namespace = shopify_field_mapping&.namespace
        metafield_key = shopify_field_mapping&.key
        return if metafield_namespace.nil? || metafield_key.nil?
  
        metafield = Metafield.find_by(shopify_account_id: shopify_account&.id, namespace: metafield_namespace, key: metafield_key)
        return if metafield.nil?
  
        metafield_values.find_by(metafield_id: metafield.id)&.value
      end
    end
  end  

  def self.update_inventory_from_shopify(sku_ids, synced_at_max = Time.now)
    skus = Sku.joins("LEFT JOIN products on products.id = skus.item_id AND skus.item_type = 'Product' AND products.product_type = 2 ")
              .joins('LEFT JOIN skus child_sku on child_sku.id = ANY(products.children)')
              .joins('LEFT JOIN vendor_sku_details vsd ON vsd.sku_id = COALESCE(child_sku.id, skus.id)')
              .joins('LEFT JOIN shopify_custom_apps sca ON sca.warehouse_id = vsd.warehouse_id')
              .joins('LEFT JOIN shopify_accounts sa ON sa.shopify_custom_app_id = sca.id')
              .joins('LEFT JOIN inventories ON inventories.warehouse_id = vsd.warehouse_id 
                      AND inventories.sku_id = skus.id')
              .where('inventories.synced_at < ? OR inventories.synced_at IS NULL', synced_at_max)
              .where('vsd.unique_identifier is NOT NULL')
              .where(id: sku_ids)
              .select('COALESCE(child_sku.id, skus.id) as sku_id, vsd.warehouse_id, vsd.unique_identifier, sa.shop, sa.long_lived_token')
    
    shopify_skus_map = skus.group_by { |sku| [sku.shop, sku.long_lived_token] }
    
    shopify_skus_map.each do |shopify, skus|
      query_string = skus.reduce("query {") do |acc, sku|
        acc + %Q( v#{sku.sku_id}: productVariant(id: "gid://shopify/ProductVariant/#{sku.unique_identifier}") { id inventoryQuantity inventoryPolicy inventoryManagement product {status}})
      end
      query_string += " }"
      body = {
        "query": query_string
      }.to_json
      shop = shopify[0]
      url = "https://#{shop}/admin/api/2024-01/graphql.json"
      long_lived_token = shopify[1]
      headers = {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': long_lived_token,
      }
      response = HTTParty.post(url, {
        headers: headers,
        body: body,
        timeout: 2,
      })
      raise StandardError.new response.parsed_response unless response.success?
      
      # Response format:
      # {"v2"=>{"id"=>"gid://shopify/ProductVariant/39913584984110", "inventoryQuantity"=>91, "inventoryPolicy"=>"DENY"}, 
      # "v3"=>{"id"=>"gid://shopify/ProductVariant/39729657020462", "inventoryQuantity"=>958, "inventoryPolicy"=>"CONTINUE"}}
      response['data'].each do |key, value|
        product_status = value&.dig('product', 'status')&.downcase
        if value.blank? || product_status != 'active'
          quantity = 0
        else
          inventory_management = value['inventoryManagement'].downcase
          inventory_policy = value['inventoryPolicy'].downcase
          inventory_quantity = value['inventoryQuantity']
          quantity = (inventory_management.blank? || (inventory_management == 'shopify' && inventory_policy == 'continue')) ? 10000 : [inventory_quantity, 0].max  
        end
        sku_id = key.delete("^0-9").to_i
        sku = skus.find { |s| s.sku_id == sku_id }
        Inventory.find_or_initialize_by(warehouse_id: sku.warehouse_id, sku_id: sku.sku_id).update(available: quantity, synced_at: Time.now)
      end
    end
  rescue StandardError => e
    Rails.logger.info "Error raised while updating inventory from Shopify: #{e.inspect}"
  end

  def self.shopify_id_to_sku_id(ui)
    VendorSkuDetail.find_by(unique_identifier: ui)&.sku_id
  end

  def shopify_recommended_products
    @shopify_recommended_products ||= begin  
      shopify_product_id = parent_unique_identifier.presence || unique_identifier
      shopify_shop = shopify_custom_app&.shop
      return [] if shopify_product_id.blank? || shopify_shop.blank?

      url = "https://#{shopify_shop}/recommendations/products.json"
      response = HTTParty.get(url, query: { product_id: shopify_product_id, limit: 6 }, timeout: 5)
      recommended_shopify_product_ids = response['products'].map { |product| product['id'] }
      return [] if recommended_shopify_product_ids.blank?

      Product.joins(:vendor_sku_detail)
             .where(vendor_sku_details: { unique_identifier: recommended_shopify_product_ids })
             .order(Arel.sql("POSITION(vendor_sku_details.unique_identifier::text in '#{recommended_shopify_product_ids.join(',')}')"))
    rescue StandardError
      []
    end
  end
end
