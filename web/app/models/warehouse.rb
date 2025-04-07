class Warehouse < ApplicationRecord

  belongs_to :organisation

  has_one :warehouse_address, dependent: :destroy
  has_one :organisation_address
  has_one :shopify_custom_app
  has_one :shopify_account, through: :shopify_custom_app


end
