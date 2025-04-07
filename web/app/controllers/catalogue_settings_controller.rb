class CatalogueSettingsController < AuthenticatedController
  before_action :set_shop
  
  # GET /api/catalogue_settings
  def index
    catalogue_setting = CatalogueSetting.find_by(shop: @shop)
    
    if catalogue_setting
      render json: {
        success: true,
        tags: catalogue_setting.tags,
        products: catalogue_setting.products,
        completed: catalogue_setting.completed,
        min_mrp: catalogue_setting.min_mrp
      }
    else
      render json: {
        success: false,
        message: "No catalogue settings found for this shop"
      }
    end
  end
  
  # POST /api/catalogue_settings
  def create
    catalogue_setting = CatalogueSetting.find_or_initialize_by(shop: @shop)
    
    # Update tags and products
    catalogue_setting.tags = params[:tags] if params[:tags].present?
    catalogue_setting.products = params[:products] if params[:products].present?
    catalogue_setting.min_mrp = params[:min_mrp] if params[:min_mrp].present?
    # Mark as completed if specified
    catalogue_setting.setting_completed = params[:completed] if params[:completed].present?
    
    if catalogue_setting.save
      # If this is marked as completed, update the vendor status
      catalogue_setting.update(completed: true)
      render json: {
        success: true,
        message: "Catalogue settings updated successfully"
      }
    else
      render json: {
        success: false,
        message: "Failed to update catalogue settings",
        errors: catalogue_setting.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_shop
    @shop = request.headers['shop'] || params[:shop]
    
    unless @shop.present?
      render json: { success: false, message: "Shop parameter is required" }, status: :bad_request
      return
    end
  end
  
end 