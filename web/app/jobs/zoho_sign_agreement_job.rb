require 'json'
require 'openssl'
require 'combine_pdf'
require 'httparty'
require 'wicked_pdf'

class ZohoSignAgreementJob
  include Sidekiq::Worker
  sidekiq_options queue: :mailers

  ZOHO_CLIENT_ID = ServiceCredential.zoho_sign.client_id
  ZOHO_CLIENT_SECRET = ServiceCredential.zoho_sign.client_secret
  ZOHO_REFRESH_TOKEN = ServiceCredential.zoho_sign.refresh_token

  def perform(vendor_id = nil, payload = nil, action = 'send_doc')
    if action == 'save_signed_doc'
      signed_doc_status_update(payload)
      return
    end
    vendor = Organisation.find_by(id: vendor_id)
    return unless vendor

    access_token = get_access_token

    if access_token.present?
      doc_creation_response = create_document_for_signing(access_token, vendor)
      doc_sent_response = send_document_for_signing(access_token, doc_creation_response)
      zoho_sign_detail = zoho_sign_detail = vendor.zoho_sign_detail || vendor.build_zoho_sign_detail
      zoho_sign_detail.assign_attributes(
        request_id: doc_creation_response["requests"]["request_id"],
        envelope_id: doc_creation_response['requests']['document_fields'].first['document_id'],
        status: 'sent'
      )
      zoho_sign_detail.save
    end
  rescue => e
    Rails.logger.error "Zoho Sign Job Failed for Vendor #{vendor_id}: #{e.message}"
  end

  private

  def get_access_token
    response = HTTParty.post(
      'https://accounts.zoho.in/oauth/v2/token',
      query: {
        refresh_token: ServiceCredential.zoho_sign.refresh_token,
        client_id: ServiceCredential.zoho_sign.client_id,
        client_secret: ServiceCredential.zoho_sign.client_secret,
        redirect_uri: ServiceCredential.zoho_sign.redirect_uri,
        grant_type: 'refresh_token'
      },
      headers: {
        'Content-Type' => 'application/x-www-form-urlencoded'
      }
    )
    JSON.parse(response.body)["access_token"]
  end

  def create_document_for_signing(access_token, vendor)
    agreement_pdf_path = generate_agreement_pdf(vendor)
    
    response = HTTParty.post("https://sign.zoho.in/api/v1/requests",
      body: {
        "data" => {
          "requests" => {
            "request_name" => "EKstore Vendor Agreement - #{vendor.name}",
            "actions" => [
              {
                "action_type" => "SIGN",
                "recipient_email" => vendor.contact_people.where(active: true).first.email,
                "recipient_name" => vendor.name,
                "signing_order" => 1,
                "private_notes" => "Please review and sign the agreement."
              }
            ],
            "expiration_days" => 10,
            "is_sequential" => true,
            "email_reminders" => true,
            "reminder_period" => 2
          }
        }.to_json,
        "file" => File.open(agreement_pdf_path, 'rb')
      },
      headers: {
        "Authorization" => "Zoho-oauthtoken #{access_token}",
        "Content-Type" => "multipart/form-data"
      }
    )
  
    File.delete(agreement_pdf_path) if File.exist?(agreement_pdf_path)
  
    JSON.parse(response.body)
  end

  def send_document_for_signing(access_token, response)
    request_id = response["requests"]["request_id"]
    total_pages = response['requests']['document_ids'].first['total_pages']

    data = {
      "requests" => {
        "actions" => response["requests"]["actions"].map do |action|
          {
            "verify_recipient" => action["verify_recipient"],
            "action_id" => action["action_id"],
            "action_type" => action["action_type"],
            "private_notes" => action["private_notes"],
            "signing_order" => action["signing_order"],
            "fields" => (0...total_pages).flat_map do |page_no|
            [
              {
                "field_type_name" => "Signature",
                "field_category" => "SIGNATURE",
                "field_label" => "Vendor Signature",
                "is_mandatory" => true,
                "page_no" => page_no,
                "document_id" => response['requests']['document_ids'].first['document_id'],
                "field_name" => "vendor_signature_#{page_no}",
                "y_coord" => 670,
                "action_id" => response['requests']['actions'].first["action_id"],
                "abs_width" => 200,
                "x_coord" => 100,
                "abs_height" => 50
              },
              {
                "field_type_name" => "Date",
                "field_category" => "TEXTBOX",
                "field_label" => "Date",
                "is_mandatory" => true,
                "page_no" => page_no,
                "document_id" => response['requests']['document_ids'].first['document_id'],
                "field_name" => "sign_date_#{page_no}",
                "y_coord" => 735,
                "action_id" => response['requests']['actions'].first["action_id"],
                "abs_width" => 100,
                "x_coord" => 120,
                "abs_height" => 30
              }
            ]
          end
          }
        end
      }
    }.to_json
      
    response = HTTParty.post(
      "https://sign.zoho.in/api/v1/requests/#{request_id}/submit",
      body: { data: data },
      headers: {
        "Authorization" => "Zoho-oauthtoken #{access_token}",
        "Content-Type" => "application/x-www-form-urlencoded"
      }
    )
  
    JSON.parse(response.body)
  end
  
  def generate_agreement_pdf(vendor)
    pdf_html = ApplicationController.render(
      template: "agreements/vendor_agreement",
      layout: "layouts/ekstore_agreement_pdf",
      locals: { vendor: vendor }
    )
    pdf = WickedPdf.new.pdf_from_string(pdf_html)
    temp_pdf_path = Rails.root.join("tmp", "vendor_#{vendor.id}_agreement.pdf")
    File.open(temp_pdf_path, "wb") { |file| file.write(pdf) }
    temp_pdf_path
  end  

  def signed_doc_status_update(webhook_data)
    request = webhook_data['requests']
    return unless request && request['request_status'] == 'completed'

    request_id = request['request_id']
    document_info = request['document_ids'].first
    document_id = document_info['document_id']
    document_name = document_info['document_name']
    zs_document_id = request['zsdocumentid']
    zoho_sign_detail = ZohoSignDetail.find_by(request_id: request_id)
    zoho_sign_detail.update(status: 'signed') if zoho_sign_detail.present?
    upload_signed_document(document_name, request_id)
  end

  def upload_signed_document(document_name, request_id)
    access_token = get_access_token
    response = HTTParty.get("https://sign.zoho.in/api/v1/requests/#{request_id}/pdf",
                            headers: {
                              'Authorization' => "Zoho-oauthtoken #{access_token}",
                              'Content-Type' => 'application/json'
                            })

    if response.success?
      temp_file = Tempfile.new([document_name, '.pdf'], binmode: true)
      temp_file.write(response.body)
      temp_file.rewind 

      zoho_sign_detail = ZohoSignDetail.find_by(request_id: request_id)
      if zoho_sign_detail.present?
        zoho_sign_detail.signed_document = temp_file
        zoho_sign_detail.save
      else
        Rails.logger.error "Vendor not found for request_id: #{request_id}"
      end

      temp_file.close
      temp_file.unlink
    else
      Rails.logger.error "Failed to fetch signed document: #{response.body}"
    end
  end
end
