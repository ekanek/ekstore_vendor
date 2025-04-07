class ServiceCredential < ApplicationRecord
  validates :name, presence: 
  
  def self.method_missing(m, *args, &block)
    service_credential = ServiceCredential.find_by(name: m.to_s)
    return OpenStruct.new() if service_credential.blank?
    service_credential  # Return the found credential
  end
end
