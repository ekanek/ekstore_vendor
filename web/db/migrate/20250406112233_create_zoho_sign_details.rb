class CreateZohoSignDetails < ActiveRecord::Migration[7.1]
  def change
    create_table :zoho_sign_details do |t|
      t.references :organisation, foreign_key: true, null: false  
      t.integer :status, null: false, default: 0
      t.string :envelope_id, null: false
      t.datetime :signing_completed_at
      t.string :request_id, null: false
      t.string :signed_document  

      t.timestamps
      t.timestamp :deleted_at, index: true
    end

    add_index :zoho_sign_details, :envelope_id, unique: true
    add_index :zoho_sign_details, :request_id, unique: true
  end
end
