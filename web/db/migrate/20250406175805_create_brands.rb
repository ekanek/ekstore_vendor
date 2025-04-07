class CreateBrands < ActiveRecord::Migration[7.1]
  def change
    create_table :brands do |t|
      t.string :name
      t.string :slug
      t.integer :nid
      t.string :card_image
      t.string :homonyms
      t.integer :display_order
      t.integer :phase
      t.integer :artist_type
      t.string :banner_image
      t.integer :employee_id
      t.string :parent_company
      t.string :certificate_image
      t.integer :list_items_count
      t.integer :status
      t.integer :competitors
      t.references :organisation, foreign_key: true
      t.string :freshchat_url
      t.string :whatsapp_url
      t.string :freshchat_support_url
      t.boolean :live_calls_enabled
      t.string :live_display_image
      t.string :live_call_timings
      t.string :foxy_live_plugin_image
      t.string :short_description
      t.integer :likes_count
      t.decimal :otb
      t.string :description
      t.string :offer_text
      t.integer :youtube_offer_id
      t.boolean :show_personalised_details
      t.boolean :show_top_categories
      t.boolean :show_artists
      t.integer :brand_cohort_id
      t.boolean :case_size_restriction
      t.integer :days_between_po
      t.integer :correction_factor
      t.boolean :auto_po_generation
      t.string :other_names

      t.timestamps
    end
  end
end
