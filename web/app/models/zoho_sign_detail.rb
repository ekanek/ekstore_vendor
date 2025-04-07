class ZohoSignDetail < ApplicationRecord
  belongs_to :organisation

  enum status: {
    sent: 0,
    signed: 1,
    failed: 2
  }

  after_commit :sync_vendor_sku_detials, if: -> { saved_change_to_status? && signed? }

  private

  def self.sync_vendor_sku_detials
    ImportEkstoreProductJob.perform_async(self.organisation&.shopify_account&.id)
  end
end
