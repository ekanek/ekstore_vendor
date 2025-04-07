class CreateVendorSkuDetails < ActiveRecord::Migration[7.1]
  def change
    create_table :vendor_sku_details do |t|
      t.integer :sku_type, default: 0 
      t.references :sku, null: true
      t.references :organisation, null: false, foreign_key: true
      t.string :guid
      t.string :title
      t.text :description
      t.text :html_description
      t.integer :unique_identifier
      t.boolean :available_for_sale
      t.string :handle
      t.decimal :compare_at_price
      t.decimal :price_range
      t.string :vendor
      t.text :description_summary
      t.string :featured_image
      t.string :online_store_preview_url
      t.string :status
      t.integer :total_inventory
      t.integer :total_variants
      t.boolean :has_only_default_variant
      t.string :harmonized_system_code
      t.float :price
      t.string :tax_code
      t.string :images
      t.string :body_html
      t.string :inventory_management
      t.boolean :taxable
      t.string :barcode
      t.integer :inventory_quantity
      t.integer :old_inventory_quantity
      t.boolean :requires_shipping
      t.datetime :deleted_at
      t.json :response_data
      t.datetime :deleted_in_shopify_at
      t.string :tags
      t.string :inventory_policy
      t.boolean :available_in_api, default: false
      t.boolean :skip_mapping, default: false
      t.datetime :last_ordered_at
      t.integer :auto_mapping_status, default: 0
      t.datetime :last_lta_last_detected_on
      t.datetime :shopify_created_at
      t.datetime :shopify_updated_at
      t.datetime :published_at
      t.string :product_type
      t.integer :synced_via
      t.boolean :ekanek_entities_need_update
      t.boolean :eligible_for_listing

      t.timestamps
    end
  end
end
