class CreateGstDetails < ActiveRecord::Migration[7.1]
  def change
    create_table :gst_details do |t|
      t.references :party, polymorphic: true
      t.string :state
      t.string :line1
      t.string :line2
      t.integer :organisation_type
      t.string :gstin
      t.string :certificate_file
      t.datetime :deleted_at
      t.boolean :default_for_invoicing
      t.string :csb_v_account_number
      t.jsonb :aramex_credentials

      t.timestamps
    end
  end
end
