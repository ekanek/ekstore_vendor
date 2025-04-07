class CreateServiceCredentials < ActiveRecord::Migration[7.1]
  def change
    create_table :service_credentials do |t|
      t.string :name
      t.jsonb :arguments

      t.timestamps
    end
  end
end
