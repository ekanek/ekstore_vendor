class ImageUploader < CarrierWave::Uploader::Base
  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick

  # Choose what kind of storage to use for this uploader:
  # storage :file
  storage :gcloud

  version :webp do
    process convert_to_webp: [{ quality: 80, method: 5 }]

    def full_filename(file)
      #return "#{version_name}_#{filename}" if filename.split('.').last == 'webp'

      #"#{version_name}_#{file}.webp"
      "#{File.basename(file, ".*")}.webp"
    end
  end

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "media/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url(*args)
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process scale: [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process resize_to_fit: [50, 50]
  # end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  #def extension_whitelist
  #  %w(jpg jpeg gif png webp)
  #end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

  def convert_to_webp(options = {})
    # Build path for new file
    webp_path = "#{path}.webp"

    # Encode (convert) image to webp format with passed options
    WebP.encode(path, webp_path, options)

    # HACK: Changing of this two instance variables is the only way
    #   I found to make CarrierWave save new file that was created
    #   by encoding original image.
    @filename = webp_path.split('/').pop

    @file = CarrierWave::SanitizedFile.new(
      tempfile: webp_path,
      filename: webp_path,
      content_type: 'image/webp'
    )
  end
  
end
