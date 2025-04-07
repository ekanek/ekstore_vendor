CarrierWave.configure do |config|
  #config.storage    = :aws
  #config.aws_bucket = 'ekanek-foxy-assets' # for AWS-side bucket access permissions config, see section below
  #config.aws_acl    = 'private'

  config.storage                 = :gcloud
  config.gcloud_bucket           = proc do |file|
  'ekanek-foxy-assets'
  end
  config.gcloud_bucket_is_public = false

  config.gcloud_credentials = {
    gcloud_project: 'azeroth-301508',
    gcloud_keyfile: Rails.root.join('config', 'azeroth-301508-7b96a09d657c.json')
  }

  # Optionally define an asset host for configurations that are fronted by a
  # content host, such as CloudFront.

  config.asset_host = proc do |file|
    'https://cdn3.foxy.in'
  end

  # The maximum period for authenticated_urls is only 7 days.
  config.aws_authenticated_url_expiration = 60 * 60 * 24 * 7

  # Set custom options such as cache control to leverage browser caching
  config.aws_attributes = {
    expires: 1.week.from_now.httpdate,
    cache_control: 'max-age=604800'
  }

  config.aws_credentials = {
    access_key_id:     ENV.fetch("AWS_API_KEY", "").presence,
    secret_access_key: ENV.fetch("AWS_SECRET", "").presence,
    region:            'ap-south-1', # Required
    stub_responses:    Rails.env.test? # Optional, avoid hitting S3 actual during tests
  }

  # Google Cloud Platform Settings
  # https://github.com/fog/fog-google/blob/master/README.md
  config.fog_provider = 'fog/google'
  config.fog_credentials = {
    provider: 'Google',
    google_storage_access_key_id: ENV.fetch("GOOGLE_STORAGE_ACCESS_KEY_ID", "").presence,
    google_storage_secret_access_key: ENV.fetch("GOOGLE_STORAGE_SECRET_ACCESS_KEY", "").presence
  }
  # fog_directory is the GCP bucket
  config.fog_directory = 'automl-prod-2'
  config.fog_public = false

  # Optional: Signing of download urls, e.g. for serving private content through
  # CloudFront. Be sure you have the `cloudfront-signer` gem installed and
  # configured:
  # config.aws_signer = -> (unsigned_url, options) do
  #   Aws::CF::Signer.sign_url(unsigned_url, options)
  # end
end
