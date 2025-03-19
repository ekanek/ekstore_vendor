class CreateCatalogueSettings < ActiveRecord::Migration[6.1]
  def change
    create_table :catalogue_settings do |t|
      t.string :shop, null: false, index: { unique: true }
      t.text :tags
      t.text :products
      t.boolean :completed, default: false
      
      t.timestamps
    end
  end
end