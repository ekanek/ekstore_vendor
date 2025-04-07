class AddOrganisationAddressToWarehouses < ActiveRecord::Migration[7.1]
  def change
    add_reference :warehouses, :organisation_address, foreign_key: true
  end
end
