class EkstoreRegisteredVendorsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :set_organisation, only: [:get_vendor_status, :create_vendor_record, :check_esign_status, :update_vendor_catalogue_settings, :send_document_for_esign, :vendor_dashboard_details, :update_vendor_sales_channels],unless: -> { params[:current_step].to_i.zero? && action_name == 'create_vendor_record' }

  def options
    head :ok
  end

  def get_vendor_status
    if !@organisation.present?
      return render json: { status: false }, status: :ok
    end
    basic_info_complete = @organisation.contact_people.exists? && 
                          @organisation.organisation_addresses.corporate.exists?
    
    document_upload_complete = basic_info_complete && 
                              @organisation.try(:gst_details).last.try(:gstin).present? && 
                              @organisation.try(:pan).present?

    form_completion_status = document_upload_complete
    esign_status = @organisation.try(:zoho_sign_detail)
    esign_status = esign_status.present? ? esign_status.status : "pending"

    
    render json: {
      success: true,
      form_completion_status: form_completion_status,
      esign_status: esign_status,
    }, status: :ok
  end

  def create_vendor_record
    ActiveRecord::Base.transaction do
      current_step = params[:current_step].to_i
      is_partial = params[:partial_save] == 'true'
      shop_name = request.headers['HTTP_SHOP'] || request.headers['shop']
      access_token = request.headers['HTTP_SHOPIFY_TOKEN'] || request.headers['shopify_token']
      case current_step
      when 0
        handle_personal_details(shop_name, access_token)
      when 1
        handle_business_details
      when 2
        if params[:skip_bank_details] == 'false'
          handle_bank_details
        else
          render json: {
            status: 'success',
            message: 'Vendor registration successful',
            data: @organisation,
            current_step: current_step
          }, status: :created
        end
      end

      render json: {
        status: 'success',
        message: is_partial ? 'Progress saved successfully' : 'Vendor registration successful',
        data: @organisation,
        current_step: current_step
      }, status: is_partial ? :ok : :created
    end
  rescue StandardError => e
    render json: {
      status: 'error',
      message: 'An unexpected error occurred',
      error: e.message
    }, status: :internal_server_error
  end

  def check_esign_status
    if !@organisation.present?
      return render json: { status: false }, status: :failed
    end
    if @organisation.try(:zoho_sign_detail).try(:status) == "signed"
      return render json: { status: true }, status: :ok
    end
    return render json: { status: false }, status: :ok
  end

  def update_vendor_catalogue_settings
    if !@organisation.present?
      return render json: { status: false }, status: :failed
    end
    if @organisation.update(catalogue_setting_completed: true)
      render json: { status: true }, status: :ok
    else
      render json: { status: false }, status: :failed
    end
  end

  def send_document_for_esign
    if !@organisation.present?
      return render json: { status: false }, status: :failed
    end
    ZohoSignAgreementJob.new.perform(@organisation.id, nil, 'send_doc')
    render json: { status: true }, status: :ok
  rescue StandardError => e
    render json: { status: false, error: e.message }, status: :internal_server_error
  end

  def vendor_dashboard_details
    if !@organisation.present?
      return render json: { status: false }, status: :failed
    end
    vendor_platforms = @organisation.ekstore_vendor_platforms
    render json: { status: true, available_platforms: EkstoreVendorPlatform.platforms.keys, vendor_platforms: vendor_platforms.active_platforms.pluck(:platform) }, status: :ok
  end

  def update_vendor_sales_channels
    if !@organisation.present?
      return render json: { status: false }, status: :failed
    end
    @organisation.ekstore_vendor_platforms.update_all(status: :inactive)
    if params[:platforms].present?
      params[:platforms].each do |platform|
        EkstoreVendorPlatform.find_or_initialize_by(organisation: @organisation, platform: platform).update(status: :active)
      end
    end
    render json: { status: true }, status: :ok
  end

  private

  def set_organisation
    if params[:current_step] != "0"
      @organisation = ShopifyAccount.find_by(shop: request.headers['shop'])&.organisation
    else
      @organisation = nil
      return true
    end
  end

  def handle_personal_details(shop_name, access_token)
    @organisation = Organisation.find_or_initialize_by(name: personal_details_params[:legal_entity_name])
    @organisation.save!

    contact_person = @organisation.contact_people.find_or_initialize_by(email: personal_details_params[:email])
    contact_person.assign_attributes(
      name: @organisation.name, 
      phone_number: personal_details_params[:contact_number],
      active: true
    )
    contact_person.save

    corporate_address = @organisation.organisation_addresses.find_or_initialize_by(address_type: [:corporate])
    corporate_address.assign_attributes(
      line1: personal_details_params[:corporate_office_address],
      phone_number: personal_details_params[:contact_number],
      disabled: false
    )
    corporate_address.save

    shopify_account = ShopifyAccount.find_or_initialize_by(shop: shop_name)
    shopify_account.assign_attributes(

      organisation: @organisation,
      track_inventory: true,
      long_lived_token: access_token
    )
    shopify_account.save
  end

  def handle_business_details
    return unless @organisation.present?

    @organisation.update!(
      pan: business_details_params[:pan_number],
      pancard_copy: business_details_params[:pan_card_copy],
      msme_certificate: business_details_params[:msme_certificate_copy],
      website: business_details_params[:brand_website]
    )
    registered_address = @organisation.organisation_addresses.find_or_initialize_by(address_type: [:registered])
    registered_address.assign_attributes(
      line1: business_details_params[:registered_office_address],
      phone_number: @organisation.contact_people.first&.phone_number,
      disabled: false
    )
    registered_address.save!
    gst_detail = @organisation.gst_details.find_or_initialize_by(gstin: business_details_params[:gst_registration_number])
    gst_detail.assign_attributes(
      state: business_details_params[:vendor_state],
      certificate_file: business_details_params[:gst_certificate_copy]
    )
    gst_detail.save!

  end

  def handle_bank_details
    return unless @organisation.present?

    bank_detail = @organisation.bank_detail || @organisation.build_bank_detail
    bank_detail.assign_attributes(
      bank_name: bank_details_params[:bank_name],
      branch_name: bank_details_params[:branch_name],
      account_number: bank_details_params[:bank_account_number],
      beneficiary_name: bank_details_params[:beneficiary_name],
      ifsc_code: bank_details_params[:ifsc_code],
      contact_person: bank_details_params[:contact_person_name],
      finance_email: bank_details_params[:finance_email],
      cancelled_cheque: bank_details_params[:cancelled_cheque]
    )
    bank_detail.save!
  end

  def personal_details_params
    params.require(:ekstore_registered_vendor).permit(
      :email, :legal_entity_name, :contact_number, :corporate_office_address
    )
  end

  def business_details_params
    params.require(:ekstore_registered_vendor).permit(
      :registered_office_address, :msme_registration_number, :place_of_supply_address, :pan_number,
      :pan_card_copy, :gst_registration_number, :gst_certificate_copy,
      :msme_certificate_copy, :brand_website, :shopify_shop_name,
      :shopify_spoc_email, :vendor_state
    )
  end

  def bank_details_params
    params.require(:bankDetails).permit(
      :bank_name, :branch_name, :bank_account_number, :beneficiary_name,
      :ifsc_code, :contact_person_name, :finance_email, :cancelled_cheque
    )
  end
end

