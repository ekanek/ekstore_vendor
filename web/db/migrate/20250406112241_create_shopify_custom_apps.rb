class CreateShopifyCustomApps < ActiveRecord::Migration[7.1]
  def change
    create_table :shopify_custom_apps do |t|
      t.string :shop
      t.references :organisation, null: false, foreign_key: true
      t.references :warehouse, foreign_key: true
      t.references :brand, foreign_key: true
      t.datetime :deleted_at
      t.boolean :auto_update_catalog, default: false
      t.boolean :is_multi_brand, default: false
      t.integer :unsold_days_listing_cutoff, default: 30
      t.integer :listing_price_threshold, default: 0
      t.string :listing_tags
      t.string :non_listing_tags
      t.string :listing_vendors
      t.string :non_listing_vendors

      t.timestamps
    end
  end
end
