class ServiceCredential < ApplicationRecord
  validates :name, presence: 
  
  def self.method_missing(m, *args, &block)
    service_credential = ServiceCredential.find_by(name: m.to_s)
    return OpenStruct.new() if service_credential.blank?
    OpenStruct.new(service_credential.arguments)
  end
end
