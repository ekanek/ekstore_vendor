class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :name
      t.string :slug
      t.references :brand, foreign_key: true
      t.string :nimage_url
      t.decimal :rating
      t.decimal :sp
      t.decimal :mrp
      t.integer :nid
      t.references :product_category, foreign_key: { to_table: :categories }
      t.json :images
      t.text :ndescription
      t.boolean :top
      t.string :sku
      t.boolean :out_of_stock
      t.integer :old_product_category_id
      t.integer :variants_count
      t.string :priority
      t.integer :image_status
      t.string :approved_images
      t.string :rejected_images
      t.string :images_needing_review
      t.integer :media_count
      t.integer :list_items_count
      t.string :how_to
      t.string :ingredients
      t.string :description
      t.datetime :deleted_at
      t.string :brand_sku
      t.string :brand_ean
      t.boolean :flag_for_assortment
      t.boolean :is_bestseller
      t.boolean :flag_for_video
      t.string :hsn_code
      t.string :pack_size
      t.string :dimensions
      t.decimal :net_weight
      t.integer :moq
      t.date :launch_date
      t.boolean :flag_for_downgrade
      t.datetime :flagged_for_downgrade_at
      t.datetime :flagged_for_assortment_at
      t.datetime :priority_reviewed_at
      t.integer :priority_change_reason
      t.boolean :gwp
      t.integer :product_type
      t.integer :status
      t.integer :launch_date_range
      t.integer :replacement_id
      t.integer :pack_size_unit
      t.integer :gender
      t.integer :children
      t.integer :google_merchant_action
      t.string :new_approved_images
      t.string :google_merchant_center_image
      t.string :gmc_category
      t.integer :case_size
      t.string :origin
      t.integer :hero_video_id,index: true
      t.string :custom_name
      t.string :mid
      t.string :puid
      t.string :aid
      t.string :aid_status
      t.string :mid_status
      t.string :puid_status
      t.string :hero_description
      t.integer :likes_count
      t.boolean :trusted
      t.string :vibrant_color
      t.string :muted_color
      t.string :short_name
      t.string :transparent_image
      t.string :transparent_image_status
      t.string :size_chart
      t.boolean :searchable
      t.decimal :net_margin
      t.integer :slob_category
      t.decimal :best_seller_score
      t.decimal :conversion_rate
      t.boolean :is_new_listing
      t.jsonb :rich_content
      t.datetime :rich_content_updated_at
      t.string :label
      t.string :label_background_image_url
      t.string :highlights
      t.references :vendor_sku_detail, foreign_key: true
      t.string :shopify_image_urls
      t.integer :position

      t.timestamps
    end
  end
end
