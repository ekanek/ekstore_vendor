class Brand < ApplicationRecord
  # mount_uploader :card_image, ImageUploader
  # mount_uploader :banner_image, ImageUploader
  # mount_uploader :certificate_image, ImageUploader
  has_many :products
end
