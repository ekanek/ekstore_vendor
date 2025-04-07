class EkstoreVendorPlatform < ApplicationRecord
  belongs_to :organisation
  enum platform: {
    vi_shop: 0,
    tata_neu: 1,
    foxy: 2
  }
  enum status: {
    active: 0,
    inactive: 1
  }

  validates :platform, uniqueness: { scope: :organisation_id }
  validates :platform, :status, presence: true

  def self.active_platforms
    where(status: :active)
  end
end