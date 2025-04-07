class CreateSkus < ActiveRecord::Migration[7.1]
  def change
    create_table :skus do |t|
      t.string :sku_code
      t.references :item, polymorphic: true
      t.integer :sku_requests_count
      t.integer :list_items_count
      t.datetime :deleted_at
      t.references :organisation, foreign_key: true
      t.integer :target_stock
      t.decimal :foxy_discount
      t.decimal :brand_discount
      t.integer :discount_offer_id
      t.integer :case_size
      t.integer :moq
      t.integer :sku_score
      t.integer :target_stock_upper_limit
      t.integer :target_stock_lower_limit
      t.references :country, foreign_key: true
      t.boolean :cod_disabled
      t.decimal :buying_mrp
      t.integer :length
      t.integer :width
      t.integer :height
      t.integer :weight
      t.boolean :cold_storage
      t.boolean :expirable
      t.integer :additional_discount
      t.string :custom_label_2
      t.string :custom_label_3
      t.string :custom_label_4
      t.integer :buying_status
      t.integer :popularity_id
      t.boolean :recyclable
      t.string :manufacturer
      t.string :mfg_address
      t.integer :esp
      t.string :best_before
      t.date :expiry_date
      t.integer :offer_id
      t.integer :rule_set_id
      t.integer :reward_id
      t.integer :group_buying_price
      t.integer :required_group_size
      t.boolean :show_group_deal
      t.decimal :flash_deal_discount_percentage
      t.boolean :ship_from_store
      t.boolean :forced_in_stock
      t.boolean :disable_cod
      t.boolean :needs_customization
      t.boolean :available_on_inventory
      t.boolean :available_on_shopify
      t.decimal :net_margin
      t.boolean :is_net_margin_default
      t.integer :slob_category
      t.decimal :best_seller_score
      t.decimal :conversion_rate
      t.boolean :is_new_listing
      t.string :shipping_text
      t.string :shipping_text_bg_color
      t.string :shipping_text_icon
      t.datetime :first_inwarded_at
      t.integer :previous_target_stock
      t.integer :ratings_count
      t.string :importer_name
      t.string :importer_address
      t.datetime :popularity_changed_at
      t.integer :cod_esp_reward_id
      t.integer :cod_esp_offer_id

      t.timestamps
    end
  end
end
