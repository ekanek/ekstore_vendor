class ShopifyAccount < ApplicationRecord
  belongs_to :organisation
  belongs_to :shopify_custom_app

  def shop_name
    return unless shop.present?
    shop.split('.myshopify')[0]
  end
end
