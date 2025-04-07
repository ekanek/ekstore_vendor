class CreateCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :categories do |t|
      t.string :type
      t.string :name
      t.string :slug
      t.integer :parent_id
      t.integer :display_order
      t.text :description
      t.integer :nid
      t.string :ancestry
      t.integer :ancestry_depth
      t.datetime :deleted_at
      t.string :card_image
      t.string :l3_dash
      t.integer :list_items_count
      t.string :display_name
      t.string :google_product_category
      t.boolean :ignore_for_recycling
      t.decimal :otb
      t.string :transparent_image
      t.string :card_background_color
      t.string :text_color
      t.string :short_description
      t.integer :status
      t.integer :product_image_aspect_shape
      t.string :size_chart
      t.integer :product_page_type
      t.boolean :show_personalised_details
      t.boolean :show_top_brands
      t.boolean :show_artists

      t.timestamps
    end
  end
end
