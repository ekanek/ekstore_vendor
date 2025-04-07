# frozen_string_literal: true

Rails.application.routes.draw do
  root to: "home#index"

  require 'sidekiq/web'
  mount Sidekiq::Web => '/sidekiq'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  scope path: :api, format: :json do
    resources :catalogue_settings, only: [:index, :create]
    # POST /api/products and GET /api/products/count
    resources :products, only: :create do
      collection do
        get :count
        get :all_data
      end
    end

    namespace :webhooks do
      post "/app_uninstalled", to: "app_uninstalled#receive"
      post "/app_scopes_update", to: "app_scopes_update#receive"
      post "/customers_data_request", to: "customers_data_request#receive"
      post "/customers_redact", to: "customers_redact#receive"
      post "/shop_redact", to: "shop_redact#receive"
    end

    post "/ekstore_registered_vendors/create_vendor_record", to: "ekstore_registered_vendors#create_vendor_record"
    post "/ekstore_registered_vendors/update_vendor_catalogue_settings", to: "ekstore_registered_vendors#update_vendor_catalogue_settings"
    get "/ekstore_registered_vendors/get_vendor_status", to: "ekstore_registered_vendors#get_vendor_status"
    get "/ekstore_registered_vendors/vendor_dashboard_details", to: "ekstore_registered_vendors#vendor_dashboard_details"
    post "/ekstore_registered_vendors/update_vendor_sales_channels", to: "ekstore_registered_vendors#update_vendor_sales_channels"
    get "/zoho_esign_status", to: "ekstore_registered_vendors#check_esign_status"
    post "/send_document_for_esign", to: "ekstore_registered_vendors#send_document_for_esign"
    post "/zoho_sign/signed_doc", to: "zoho_webhooks#signed_doc"
  
    match ["/ekstore_registered_vendors/create_vendor_record", 
           "/ekstore_registered_vendors/update_vendor_catalogue_settings", 
           "/ekstore_registered_vendors/get_vendor_status", 
           "/zoho_esign_status", 
           "/ekstore_registered_vendors/vendor_dashboard_details", 
           "/ekstore_registered_vendors/update_vendor_sales_channels"], 
          to: "ekstore_registered_vendors#options", via: :options
  end

  resources :shopify_apps, only: [] do
    collection do
      get :dashboard
      get :auto_login
    end
  end

  mount ShopifyApp::Engine, at: "/api"
  get "/api", to: redirect(path: "/") # Needed because our engine root is /api but that breaks frontend routing
  # Add this to your existing routes
  resources :catalogue_settings, only: [:show, :update]
  # If you are adding routes outside of the /api path, remember to also add a proxy rule for
  # them in web/frontend/vite.config.js

  # Any other routes will just render the react app
  match "*path" => "home#index", via: [:get, :post]
end
