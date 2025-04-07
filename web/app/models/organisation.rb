class Organisation < ApplicationRecord
  extend ArrayEnum
  mount_uploader :pancard_copy, ImageUploader
  mount_uploader :msme_certificate, ImageUploader

  enum status: { draft: 0, published: 1, deactivated: 2}
  array_enum roles: { buyer: 0, seller: 1, marketplace: 2, dtc_brand: 3, importer: 4, exporter: 5, ekstore_seller: 6 }

  has_one :zoho_sign_detail, dependent: :destroy
  has_many :warehouses, dependent: :destroy
  has_many :bank_accounts, as: :entity, dependent: :destroy
  has_many :gst_details, as: :party, dependent: :destroy
  has_one :shopify_account, dependent: :destroy
  has_many :contact_people, as: :entity, dependent: :destroy
  has_many :ekstore_vendor_platforms, dependent: :destroy
  validates :name, presence: true, uniqueness: {case_sensitive: false}
  has_many :organisation_addresses, as: :party, inverse_of: :party, dependent: :destroy

  def self.ekanek_org
    Rails.cache.fetch(["ekanek_org", SERVER_START_TIME]) do
      Organisation.find_by(name: 'Ekanek Networks Private Limited')
    end
  end

  def self.a3m_org
    Rails.cache.fetch(["a3m_org", SERVER_START_TIME]) do
      Organisation.find_by(name: 'A3M Direct Brand Purchase Pvt Ltd.')
    end
  end
end
