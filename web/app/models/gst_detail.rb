class GstDetail < ApplicationRecord

  belongs_to :party, polymorphic: true

  validates :gstin, presence: true, length: {is: 15}

  mount_uploader :certificate_file, ImageUploader

end
