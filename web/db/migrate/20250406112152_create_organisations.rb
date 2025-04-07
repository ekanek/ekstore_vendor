class CreateOrganisations < ActiveRecord::Migration[7.1]
  def change
    create_table :organisations do |t|
      t.string :name
      t.string :pan
      t.string :tan
      t.string :cin
      t.string :msme_registration_number
      t.string :organisation_code
      t.string :msme_certificate
      t.string :pancard_copy
      t.datetime :deleted_at
      t.integer :roles
      t.integer :status
      t.string :po_prefix
      t.integer :po_starting_index
      t.string :invoice_prefix
      t.integer :invoice_starting_index
      t.decimal :grn_preshold
      t.integer :po_schedule_frequency
      t.decimal :otb
      t.date :po_creation_start_date
      t.decimal :minimum_order_value
      t.boolean :enable_shopify_einvoice
      t.string :api_token
      t.string :webhook_token
      t.string :buying_currency_code
      t.string :selling_currency_code
      t.string :ad_coring

      t.timestamps
    end
  end
end
