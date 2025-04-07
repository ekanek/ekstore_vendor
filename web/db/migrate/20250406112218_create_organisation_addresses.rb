class CreateOrganisationAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :organisation_addresses do |t|
      t.references :party, polymorphic: true
      t.string :line1
      t.string :line2
      t.integer :address_type
      t.string :phone_number
      t.datetime :deleted_at
      t.references :warehouse, foreign_key: true
      t.boolean :disabled
      t.boolean :primary

      t.timestamps
    end
  end
end
