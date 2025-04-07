class CreateShopifyAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :shopify_accounts do |t|
      t.string :state
      t.string :code
      t.string :hmac
      t.string :shop
      t.string :long_lived_token
      t.references :organisation, null: false, foreign_key: true
      t.boolean :tnc_accepted
      t.text :host
      t.boolean :cod_disabled
      t.boolean :track_inventory
      t.boolean :accepting_orders
      t.text :cod_text
      t.text :prepaid_text
      t.boolean :automated_offers
      t.boolean :tax_lines
      t.boolean :reachable

      t.timestamps
    end
  end
end
