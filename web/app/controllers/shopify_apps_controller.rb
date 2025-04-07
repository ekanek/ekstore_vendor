class ShopifyAppsController < ApplicationController
  before_action :set_tenant, except: [:auto_login]
  before_action :verify_tenant, except: [:tenant_name, :auto_login]
  skip_before_action :verify_authenticity_token
  before_action :auto_login_if_shopify_store, only: [:auto_login]

  def dashboard
    cms_url = @domain % {project: 'cms'}
    oms_url = @domain % {project: 'oms'}

    start_date, end_date, current_date = get_dates(Date.new.today_in_ist, 1)
    yesterday_active_orders = Order.where.not(aasm_state: ['created', 'awaiting_confirmation', 'cancelled']).where("created_at > ? AND created_at < ?", start_date, end_date)
    yesterday_active_orders_count = yesterday_active_orders.size
    repeat_user_ids = Order.where(aasm_state: ['created', 'awaiting_confirmation', 'cancelled'], user_id: yesterday_active_orders.pluck(:user_id)).where("created_at < ?", start_date).pluck(:user_id).uniq
    repeat_order_count = yesterday_active_orders.where(user_id: repeat_user_ids).count
    new_order_count = yesterday_active_orders_count.to_i - repeat_order_count.to_i
    hourly_data = yesterday_active_orders.group("EXTRACT( HOUR FROM (created_at::TIMESTAMP WITH TIME ZONE  AT TIME ZONE 'Asia/Kolkata') )").count
    yesterday_hourly_trend = (0..(end_date < Time.now ? 24 : Time.now.in_time_zone('New Delhi').hour+1)).map{ |n| {time: "#{n} hour", sales: (hourly_data[(n-1).to_f ] || 0) } }

    yesterday_active_orders_amount = yesterday_active_orders.sum(:total_amount).to_i
    aov = yesterday_active_orders_count != 0 ? (yesterday_active_orders_amount.to_f/yesterday_active_orders_count).to_i : 0
    
    cod_orders = yesterday_active_orders.where(cod: true)
    cod_order_count = cod_orders.size
    cod_orders_amount = cod_orders.sum(:total_amount).to_i
    cod_aov = cod_order_count != 0 ? (cod_orders_amount.to_f/cod_order_count).to_i : 0

    prepaid_orders = yesterday_active_orders.where.not(cod: true)
    prepaid_order_count = prepaid_orders.size
    prepaid_orders_amount = prepaid_orders.sum(:total_amount).to_i
    prepaid_aov = prepaid_order_count != 0 ? (prepaid_orders_amount.to_f/prepaid_order_count).to_i : 0

    render json: {
      total_app_sales: {
        amount: yesterday_active_orders_amount,
        hourly_data: yesterday_hourly_trend, 
      },
      orders_count: {
        total: yesterday_active_orders_count,
        new: new_order_count,
        repeat: repeat_order_count,
      },
      prepaid_share: {
        total: yesterday_active_orders_count,
        cod: cod_order_count,
        prepaid: prepaid_order_count,
        prepaid_percentage: ((prepaid_order_count.to_f/yesterday_active_orders_count)*100).round(1).to_f || 0,
      },
      other_info: [
        {
          title: 'Average Order Value',
          value: aov,
        },
        {
          title: 'Prepaid (AOV )',
          value: prepaid_aov,
        },
        {
          title: 'COD ( AOV )',
          value: cod_aov,
        },
      ],
      settings_detail: [
        {
          title: 'Delivery Fees',
          subtitle: 'Edit the COD and prepaid delivery fees and its threshold',
          cta_text: 'Customize',
          cta_url: "https://#{cms_url}/shopify_apps/auto_login" + "?tenant_info=#{@encrypted_data_for_url}" + '&type=Delivery',
        },
        {
          title: ' Delivery Time',
          subtitle: 'Update delivery time from your warehouse to destination pincodes',
          cta_text: 'Customize',
          cta_url: "https://#{cms_url}/shopify_apps/auto_login" + "?tenant_info=#{@encrypted_data_for_url}" + '&type=Delivery',
        },
        {
          title: 'Alerts',
          subtitle: 'Add email IDs and enable alert emails about product, collection, and order errors',
          cta_text: 'Customize',
          cta_url: "https://#{oms_url}/shopify_apps/auto_login" + "?tenant_info=#{@encrypted_data_for_url}",
        },
      ]
    }, status: :ok
  end

  def auto_login
    redirect_to report_schedules_path
  end
  
  private 
  def set_tenant
    encrypted_data = request.headers['tenant-info']
    @encrypted_data_for_url = Base64.urlsafe_encode64(encrypted_data)
    decrypted_data = CryptoHelper.new.decrypt_aes(encrypted_data)
    decrypted_data = JSON.parse(decrypted_data)
    decrypted_data = decrypted_data.with_indifferent_access
    @tenant_name = decrypted_data[:name]
    @domain = "#{@tenant_name}.%{project}.ekanek.app"
  end

  def verify_tenant
    if @tenant_name != Apartment::Tenant.current
      render json: {}, status: :unauthorized
      return
    end
  end

  def auto_login_if_shopify_store
    employee = Employee.find_by(email: 'shopify.default@ekanek.io')
    return if current_employee&.id == employee.id

    if params[:tenant_info].present?
      tenant_info = Base64.urlsafe_decode64(params[:tenant_info])
      decrypted_data = CryptoHelper.new.decrypt_aes(tenant_info)
      parsed_data = JSON.parse(decrypted_data)
      if parsed_data['name'] == Apartment::Tenant.current
        if employee
          reset_session
          sign_in(employee)
        else
          redirect_to root_path
          Rails.logger.warn "Employee not found"
        end
      else
        redirect_to root_path
        Rails.logger.warn "Tenant name not matched"
      end
    end
  end

  def get_dates(start_date, i)
    end_time = start_date.days_ago(i).in_time_zone('New Delhi').end_of_day.in_time_zone('UTC')

    [
      start_date.days_ago(i).in_time_zone('New Delhi').beginning_of_day.in_time_zone('UTC'), 
      end_time,
      start_date.days_ago(i).in_time_zone('New Delhi').to_date.strftime('%d %b')
    ]
  end
end
