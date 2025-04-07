class CreateWarehouses < ActiveRecord::Migration[7.1]
  def change
    create_table :warehouses do |t|
      t.string :name
      t.string :location_code
      t.string :warehouse_provider
      t.datetime :deleted_at
      t.string :warehouse_code
      t.references :organisation, foreign_key: true
      t.string :channel_code
      t.string :invoice_series
      t.string :po_prefix
      t.integer :po_starting_index
      t.string :invoice_prefix
      t.integer :invoice_starting_index
      t.string :grn_prefix
      t.integer :grn_starting_index
      t.string :challan_prefix
      t.integer :challan_starting_index
      t.integer :facility_id
      t.boolean :ignore_gatepass
      t.string :gatepass_prefix
      t.integer :gatepass_starting_index
      t.integer :warehouse_processor_id
      t.integer :lead_time
      t.boolean :fulfilment_center

      t.timestamps
    end
  end
end
