class AddProductAndWarehouseToVendorSkuDetails < ActiveRecord::Migration[7.1]
  def change
    add_reference :vendor_sku_details, :product, foreign_key: true
    add_reference :vendor_sku_details, :warehouse,  foreign_key: true
  end
end
