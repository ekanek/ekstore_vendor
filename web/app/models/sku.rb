class Sku < ApplicationRecord
  belongs_to :item, polymorphic: true
  belongs_to :country, optional: true
  validates :sku_code, presence: true, uniqueness: true
  delegate :name, :formatted_name, :brand_name, :sp, :mrp, :discount, :gwp, :description, :approved_image_url, :approved_images_urls, :slug,
           :image_url, :out_of_stock, :product_category, :brand, :margin_percent, :gst_rate, :display_sp, :display_mrp, :hsn_code, :brand_ean, :pack_size, to: :item, allow_nil: true
end
