# frozen_string_literal: true

class ProductFetcher < ApplicationService
  include ShopifyApp::AdminAPI::WithTokenRefetch

  GET_PRODUCTS_AND_TAGS_QUERY = <<~QUERY
    query getProductsAndTags {
      products(first: 250) {
        edges {
          node {
            id
            title
            tags
          }
        }
      }
    }
  QUERY

  def initialize(session:, id_token:)
    super()
    @session = session
    @id_token = id_token
  end

  def call
    response = with_token_refetch(@session, @id_token) do
      client = ShopifyAPI::Clients::Graphql::Admin.new(session: @session)
      client.query(query: GET_PRODUCTS_AND_TAGS_QUERY)
    end

    raise StandardError, response.body["errors"].to_s if response.body["errors"]
    puts response.body
    products = response.body.dig("data", "products", "edges").map do |edge|
      {
        label: edge["node"]["title"],
        value: edge["node"]["id"].split("/").last
      }
    end

    all_tags = []
    response.body.dig("data", "products", "edges").each do |edge|
      all_tags.concat(edge["node"]["tags"]) if edge["node"]["tags"].is_a?(Array)
    end
    
    tags = all_tags.uniq.map do |tag|
      {
        label: tag,
        value: tag
      }
    end

    { products: products, tags: tags }
  end
end
