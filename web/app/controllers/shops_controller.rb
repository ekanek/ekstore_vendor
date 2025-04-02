class ShopsController < AuthenticatedController
    before_action :set_shop
    def get_access_token
        shop_record = Shop.find_by(shopify_domain: @shop)
        if shop_record&.shopify_token.present?
            return render json: { success: true, access_token: shop_record.shopify_token }
        end
    
        render json: { success: false }, status: :not_found
    end    

    private

    def set_shop
        @shop = request.headers['shop'] || params[:shop]
        puts "head : #{request.headers['shop']}  params : #{params[:shop]}"
        unless @shop.present?
            render json: { success: false, message: "Shop parameter is required" }, status: :bad_request
            return
        end
    end
    
end