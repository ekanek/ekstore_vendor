class ZohoWebhooksController < ApplicationController

  def signed_doc
    webhook_data = JSON.parse(request.body.read)
    ZohoSignAgreementJob.new.perform(nil, webhook_data, 'save_signed_doc')
    render json: { message: "Webhook received" }, status: :ok
  end
end