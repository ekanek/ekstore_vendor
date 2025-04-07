class AddWebsiteToOrganisations < ActiveRecord::Migration[7.1]
  def change
    add_column :organisations, :website, :string
  end
end
