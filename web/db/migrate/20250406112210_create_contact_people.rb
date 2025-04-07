class CreateContactPeople < ActiveRecord::Migration[7.1]
  def change
    create_table :contact_people do |t|
      t.string :name, null: false
      t.string :designation
      t.string :email, null: false
      t.string :phone_number, null: false
      t.integer :contact_type
      t.references :entity, polymorphic: true, null: false
      t.datetime :deleted_at
      t.boolean :active, default: true

      t.timestamps
    end

    # Add indexes
    add_index :contact_people, :phone_number, unique: true
    add_index :contact_people, [:email, :entity_id, :entity_type], unique: true, name: "index_contact_people_on_email_and_entity"
  end
end
