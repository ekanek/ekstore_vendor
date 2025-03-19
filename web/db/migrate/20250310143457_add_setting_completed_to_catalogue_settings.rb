class AddSettingCompletedToCatalogueSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :catalogue_settings, :setting_completed, :boolean
  end
end
