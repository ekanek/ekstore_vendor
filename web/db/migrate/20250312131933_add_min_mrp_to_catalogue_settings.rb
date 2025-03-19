class AddMinMrpToCatalogueSettings < ActiveRecord::Migration[6.1]
  def change
    add_column :catalogue_settings, :min_mrp, :decimal, precision: 10, scale: 2
  end
end