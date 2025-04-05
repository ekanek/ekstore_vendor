require 'sidekiq-unique-jobs'

Sidekiq.configure_server do |config|
  config.redis = { url: Rails.configuration.redis[:queue], id: nil }

  config.server_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Server
  end

  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end

  SidekiqUniqueJobs::Server.configure(config)
end

Sidekiq.configure_client do |config|
  config.redis = { url: Rails.configuration.redis[:queue], id: nil }

  config.client_middleware do |chain|
    chain.add SidekiqUniqueJobs::Middleware::Client
  end
end
