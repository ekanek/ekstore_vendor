class CatalogueSetting < ApplicationRecord
  validates :shop, presence: true, uniqueness: true
  
  # Store tags and products as arrays in JSON format
  serialize :tags, Array, coder: JSON
  serialize :products, Array, coder: JSON
  
  # Default values
  after_initialize :set_defaults, if: :new_record?
  
  private
  
  def set_defaults
    self.tags ||= []
    self.products ||= []
  end
end 