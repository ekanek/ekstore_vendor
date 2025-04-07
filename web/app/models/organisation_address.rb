class OrganisationAddress < ApplicationRecord
  extend ArrayEnum

  array_enum address_type: {corporate: 0, registered: 1, shipping: 2, billing: 3, gst: 4}

  belongs_to :party, polymorphic: true
  belongs_to :warehouse, optional: true

  validates :phone_number, format: {with: /\A\d{10}\z/}
  validates :line1, presence: true

  scope :corporate, -> { where("address_type @> ?", "{0}") }
  scope :registered, -> { where("address_type @> ?", "{1}") }
  scope :shipping, -> { where("address_type @> ?", "{2}") }
  scope :active, -> { where(disabled: false) }

  def ekanek_or_a3m_shipping_address?
    address_type.include?('shipping') && (party_id == Organisation.a3m_org&.id or party_id == Organisation.ekanek_org&.id)
  end

  def to_s
    "#{line1}, #{line2}"
  end
end
