import {
    Page,
    Layout,
    LegacyCard,
    FormLayout,
    TextField,
    Button,
    Form,
    Text,
    Autocomplete,
    Tag,
    Toast,
    ButtonGroup,
  } from "@shopify/polaris";
  import { useState, useCallback, useMemo, useEffect } from "react";
  import { useSearchParams, useNavigate } from "react-router-dom";
  import axios from "axios";
  
  export default function CatalogueSettings() {
    const [searchParams] = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formValues, setFormValues] = useState({
      blacklist_tags: "",
      blacklisted_products: "",
      min_mrp: "0",
    });
    
    // For tags autocomplete
    const [selectedTags, setSelectedTags] = useState([]);
    const [inputValueTags, setInputValueTags] = useState('');
    const [tagOptions, setTagOptions] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    
    // For products autocomplete
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [inputValueProducts, setInputValueProducts] = useState('');
    const [productOptions, setProductOptions] = useState([]);
  
    // Add a state for storing all data
    const [data, setData] = useState({
      tags: [],
      products: []
    });
  
    // Update the toast state management
    const [toastProps, setToastProps] = useState({
      active: false,
      content: '',
      error: false
    });
  
    const navigate = useNavigate();
  
    // Add the getShopParam function
    const getShopParam = useCallback(() => {
      // Try to get from URL params first
      const shopFromParams = searchParams.get('shop');
      if (shopFromParams) return shopFromParams;
      
      // Try to get from localStorage
      const shopFromStorage = localStorage.getItem('shopify-shop-domain');
      if (shopFromStorage) return shopFromStorage;
      
      // Try to extract from the referrer if available
      if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          if (referrerUrl.hostname.includes('myshopify.com')) {
            return referrerUrl.hostname;
          }
        } catch (e) {
          console.error("Error parsing referrer URL:", e);
        }
      }
      
      // Try to get from the embedded app context
      if (window.shopify && window.shopify.config) {
        return window.shopify.config.shop;
      }
      
      // As a last resort, check if we're in an iframe and try to get from parent
      if (window.self !== window.top) {
        try {
          return window.parent.location.hostname;
        } catch (e) {
          console.error("Error accessing parent frame:", e);
        }
      }
      
      return null;
    }, [searchParams]);
  
    useEffect(() => {
      const loadAllData = async () => {
        setIsLoadingTags(true);
        try {
          const response = await fetch('/api/products/all_data', {
            headers: {
              "Accept": "application/json"
            }
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          
          const responseData = await response.json();
          
          // Store all data in state
          setData({
            tags: responseData.tags || [],
            products: responseData.products || []
          });
          
          // Set tags
          setAllTags(responseData.tags || []);
          setTagOptions(responseData.tags || []);
          
          // Set products
          setProductOptions(responseData.products || []);
          
          // Load saved settings
          await loadCatalogueSettings();
          
          setIsLoadingTags(false);
        } catch (error) {
          console.error("Error loading data:", error);
          setIsLoadingTags(false);
        }
      };
      
      loadAllData();
    }, []);
  
    useEffect(() => {
      // Load existing settings when component mounts
      const loadExistingSettings = async () => {
        try {
          const shopParam = getShopParam();
          if (!shopParam) return;

          const response = await fetch(`/api/catalogue_settings?shop=${shopParam}`);
          const data = await response.json();

          if (data.success) {
            setSelectedTags(data.tags || []);
            setSelectedProducts(data.products || []);
            setFormValues(prev => ({
              ...prev,
              min_mrp: data.min_mrp ? data.min_mrp.toString() : "0"
            }));
          }
        } catch (error) {
          console.error("Error loading catalogue settings:", error);
        }
      };

      loadExistingSettings();
    }, [getShopParam]);
  
    // Update the tag filtering function
    const updateTagText = useCallback(
      (value) => {
        setInputValueTags(value);
        
        if (value === '') {
          setTagOptions(allTags);
          return;
        }
        
        // Filter tags on the client side
        const filterRegex = new RegExp(value, 'i');
        const resultOptions = allTags.filter((option) =>
          option.label.match(filterRegex)
        );
        setTagOptions(resultOptions);
      },
      [allTags]
    );
  
    const removeTag = useCallback(
      (tag) => () => {
        const options = [...tagOptions];
        options.push({label: tag, value: tag});
        setTagOptions(options);
        setSelectedTags((previous) => previous.filter((item) => item !== tag));
      },
      [tagOptions],
    );
  
    const tagsText = selectedTags.length > 0 ? '' : 'Select tags to deny import';
  
    const tagMarkup = selectedTags.map((option) => {
      const tagValue = typeof option === 'object' ? option.label : option;
      return (
        <Tag key={`option-${tagValue}`} onRemove={removeTag(tagValue)}>
          {tagValue}
        </Tag>
      );
    });
  
    const handleTagSelect = useCallback(
      (selected) => {
        const selectedValue = selected.map((selectedItem) => {
          const matchedOption = tagOptions.find((option) => {
            return option.value.match(selectedItem);
          });
          return matchedOption ? matchedOption.label : selectedItem;
        });
  
        setSelectedTags(selectedValue);
        setInputValueTags('');
        
        const newOptions = tagOptions.filter(
          option => !selectedValue.includes(option.label)
        );
        setTagOptions(newOptions);
      },
      [tagOptions],
    );
  
    // Update the updateProductText function
    const updateProductText = useCallback(
      (value) => {
        setInputValueProducts(value);
        
        if (value === '') {
          // This should use product options, not allTags
          setProductOptions(data.products || []);
          return;
        }
        
        const filterRegex = new RegExp(value, 'i');
        // This should filter products, not allTags
        const resultOptions = (data.products || []).filter((option) =>
          option.label.match(filterRegex)
        );
        setProductOptions(resultOptions);
      },
      [data.products] // Change dependency from allTags to data.products
    );
  
    const removeProduct = useCallback(
      (product) => () => {
        const options = [...productOptions];
        options.push({label: product, value: product.toLowerCase().replace(/\s+/g, '-')});
        setProductOptions(options);
        setSelectedProducts((previous) => previous.filter((item) => item !== product));
      },
      [productOptions],
    );
  
    const productsText = selectedProducts.length > 0 ? '' : 'Select products to deny import';
  
    const productMarkup = selectedProducts.map((option) => {
      const productValue = typeof option === 'object' ? option.label : option;
      return (
        <Tag key={`option-${productValue}`} onRemove={removeProduct(productValue)}>
          {productValue}
        </Tag>
      );
    });
  
    const handleProductSelect = useCallback(
      (selected) => {
        const selectedValue = selected.map((selectedItem) => {
          const matchedOption = productOptions.find((option) => {
            return option.value.match(selectedItem);
          });
          return matchedOption ? matchedOption.label : selectedItem;
        });
  
        setSelectedProducts(selectedValue);
        setInputValueProducts('');
        
        const newOptions = productOptions.filter(
          option => !selectedValue.includes(option.label)
        );
        setProductOptions(newOptions);
      },
      [productOptions],
    );
  
    // Update the loadCatalogueSettings function
    const loadCatalogueSettings = async () => {
      try {
        const shopParam = getShopParam();
        if (!shopParam) {
          console.error("Shop parameter could not be determined");
          return;
        }
        
        const response = await fetch('/api/catalogue_settings', {
          headers: {
            "shop": shopParam,
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Load saved tags and products
          if (data.tags && data.tags.length > 0) {
            setSelectedTags(data.tags);
          }
          
          if (data.products && data.products.length > 0) {
            setSelectedProducts(data.products);
          }
        }
      } catch (error) {
        console.error("Error loading catalogue settings:", error);
      }
    };
  
    // Update the toast handling functions
    const showToast = (content, isError = false) => {
      setToastProps({
        active: true,
        content,
        error: isError
      });
    };
  
    const dismissToast = () => {
      setToastProps(prev => ({
        ...prev,
        active: false
      }));
    };
  
    // Update the saveCatalogueSettings function to use the new toast handling
    const saveCatalogueSettings = async (completed = false) => {
      setIsSaving(true);
      
      try {
        const shopParam = getShopParam();
        
        if (!shopParam) {
          showToast("Unable to determine shop information", true);
          setIsSaving(false);
          return;
        }
        
        const response = await fetch('/api/catalogue_settings', {
          method: 'POST',
          headers: {
            "shop": shopParam,
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            shop: shopParam,
            tags: selectedTags.map(tag => typeof tag === 'object' ? tag.label : tag),
            products: selectedProducts.map(product => typeof product === 'object' ? product.label : product),
            min_mrp: formValues.min_mrp,
            completed: completed
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          showToast(completed ? "Settings saved and completed!" : "Settings saved successfully!");
          
          // Redirect to dashboard after a short delay if completed
          if (completed) {
            setTimeout(() => {
              window.location.href = `/vendor-dashboard?shop=${shopParam}`;
            }, 1500);
          }
        } else {
          showToast(data.message || "Failed to save settings", true);
        }
      } catch (error) {
        console.error("Error saving catalogue settings:", error);
        showToast("An error occurred while saving settings", true);
      } finally {
        setIsSaving(false);
      }
    };
  
    // Update the save button handlers
    const handleSave = async (completed = false) => {
      await saveCatalogueSettings(completed);

      // If in edit mode, redirect back to dashboard after saving
      if (isEditMode && completed) {
        const shopParam = getShopParam();
        setTimeout(() => {
          window.location.href = `/vendor-dashboard?shop=${shopParam}`;
        }, 1500);
      }
    };
  
    // Add this function to handle navigation
    const handleGoToDashboard = () => {
      const shopParam = getShopParam();
      navigate(`/vendor-dashboard${shopParam ? `?shop=${shopParam}` : ''}`);
    };
  
    return (
      <Page>
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Text variant="headingLg" as="h1">
                  {isEditMode ? 'Edit Import Settings' : 'Configure Import Settings'}
                </Text>
                <Button onClick={handleGoToDashboard}>
                  Go to Dashboard
                </Button>
              </div>
              <Form>
                <FormLayout>
                  <div style={{ marginBottom: "20px" }}>
                    <Autocomplete
                      allowMultiple
                      options={tagOptions}
                      selected={selectedTags}
                      textField={
                        <Autocomplete.TextField
                          onChange={updateTagText}
                          label="Excluded Tags"
                          value={inputValueTags}
                          placeholder="Search or enter tags"
                          helpText="Products with these tags will not be imported"
                        />
                      }
                      onSelect={handleTagSelect}
                    />
                    <div style={{ marginTop: "5px" }}>
                      {tagsText}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {tagMarkup}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: "20px" }}>
                    <Autocomplete
                      allowMultiple
                      options={productOptions}
                      selected={selectedProducts}
                      textField={
                        <Autocomplete.TextField
                          onChange={updateProductText}
                          label="Excluded Products"
                          value={inputValueProducts}
                          placeholder="Search or enter product names"
                          helpText="These specific products will not be imported"
                        />
                      }
                      onSelect={handleProductSelect}
                    />
                    <div style={{ marginTop: "5px" }}>
                      {productsText}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                        {productMarkup}
                      </div>
                    </div>
                  </div>
                  
                  <TextField
                    label="Exclude all products with MRP less than"
                    type="number"
                    value={formValues.min_mrp}
                    onChange={(value) => setFormValues({...formValues, min_mrp: value})}
                    helpText="Products with MRP below this value will not be imported"
                    suffix="INR"
                  />
                  
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <ButtonGroup>
                      <Button onClick={() => handleSave(false)}>
                        Save Draft
                      </Button>
                      <Button 
                        primary 
                        onClick={() => handleSave(true)}
                      >
                        {isEditMode ? 'Save Changes' : 'Complete Setup'}
                      </Button>
                    </ButtonGroup>
                  </div>
                </FormLayout>
              </Form>
            </LegacyCard>
          </Layout.Section>
        </Layout>
        {toastProps.active && (
          <Toast
            content={toastProps.content}
            error={toastProps.error}
            onDismiss={dismissToast}
            duration={4500}
          />
        )}
      </Page>
    );
  }