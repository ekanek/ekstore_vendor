class CreateEkstoreVendorPlatforms < ActiveRecord::Migration[7.1 ]
  def change
    create_table :ekstore_vendor_platforms do |t|
      t.references :organisation, null: false, foreign_key: true
      t.integer :platform, null: false
      t.integer :status, null: false
      t.timestamps  
      t.timestamp :deleted_at, index: true
    end
    add_index :ekstore_vendor_platforms, [:organisation_id, :platform], unique: true
  end
end
