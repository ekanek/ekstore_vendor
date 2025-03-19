import {
    Box,
    Layout,
    TextField,
    Button,
    Form,
    FormLayout,
    Page,
    Select,
    DropZone,
    LegacyStack,
    Thumbnail,
    Text,
    LegacyCard,
    Modal,
    Toast,
  } from "@shopify/polaris";

  import { useState, useReducer, useCallback, useEffect } from "react";
  import { useSearchParams } from "react-router-dom";
  import {NoteIcon} from '@shopify/polaris-icons';
  import axios from "axios";
  import { useVendorStatus } from "../components/providers/VendorStatusProvider";
  

  const states = [
    { label: "Select state", value: "" },
    { label: "Delhi", value: "delhi" },
    { label: "Haryana", value: "haryana" },
    { label: "Maharashtra", value: "maharashtra" },
    { label: "Karnataka", value: "karnataka" },
  ];

  
  const initialState = {
    personalDetails: {
      email: '',
      legal_entity_name: '',
      contact_number: '',
      corporate_office_address: '',
    },
    businessDetails: {
      registered_office_address: '',
      place_of_supply_address: '',
      pan_number: '',
      pan_card_copy: null,
      gst_registration_number: '',
      gst_certificate_copy: null,
      msme_registration_number: '',
      msme_certificate_copy: null,
      brand_website: '',
      shopify_shop_name: '',
      shopify_spoc_email: '',
      vendor_state: '',
    },
    bankDetails: {
      bank_name: '',
      branch_name: '',
      bank_account_number: '',
      beneficiary_name: '',
      ifsc_code: '',
      contact_person_name: '',
      finance_email: '',
      cancelled_cheque: null,
    },
  };
  
  function formReducer(state, action) {
    if (!state[action.section]) {
      return state;
    }
    return {
      ...state,
      [action.section]: {
        ...state[action.section],
        [action.field]: action.value,
      },
    };
  }
  
  // Add validation helper functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : "Please enter a valid email address";
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone) ? null : "Phone number must be 10 digits";
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan) ? null : "Please enter a valid PAN number (format: AAAAA1234A)";
  };

  const validateGST = (gst) => {
    const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
    return gstRegex.test(gst) ? null : "Please enter a valid GST number";
  };

  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc) ? null : "Please enter a valid IFSC code";
  };

  const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  
  export default function Registration() {
    const [currentStep, setCurrentStep] = useState(0);
    const [state, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchParams] = useSearchParams();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const esignPending = searchParams.get('esignPending') === 'true';
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { vendorStatus } = useVendorStatus();
    const [toastProps, setToastProps] = useState({ active: false, content: '', error: false });
    const [documentSent, setDocumentSent] = useState(false);
  
    // Initialize state on component mount
    useEffect(() => {
      // Check if vendor is registered from vendorStatus
      if (vendorStatus.isRegistered || vendorStatus.esignStatus) {
        setIsSubmitted(true);
      }
    }, [vendorStatus.isRegistered, vendorStatus.esignStatus]);
  
    // Add this useEffect to debug shop parameter
    useEffect(() => {
      const shopParam = searchParams.get('shop');
      
      if (!shopParam) {
        console.warn('Shop parameter is missing from URL');
      }
    }, [searchParams]);
  
    const getShopParam = useCallback(() => {
      const shopFromParams = searchParams.get('shop');
      if (shopFromParams) return shopFromParams;
      
      const shopFromStorage = localStorage.getItem('shopify-shop-domain');
      if (shopFromStorage) return shopFromStorage;
      
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
      
      if (window.shopify && window.shopify.config) {
        return window.shopify.config.shop;
      }
      
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
      
      if (window.shopify) {
        console.log("- Shopify config:", window.shopify.config);
      }
      
      if (window.self !== window.top) {
        try {
          console.log("- Parent location:", window.parent.location.href);
        } catch (e) {
          console.log("- Cannot access parent frame due to CORS");
        }
      }
      
    }, [searchParams, getShopParam]);
  
    useEffect(() => {
      if (vendorStatus && !localStorage.getItem('shopify-shop-domain')) {
        const apiRequests = axios.interceptors.request.use(
          config => {
            if (config.headers && config.headers.shop) {
              localStorage.setItem('shopify-shop-domain', config.headers.shop);
            }
            return config;
          },
          error => Promise.reject(error)
        );
        
        return () => {
          axios.interceptors.request.eject(apiRequests);
        };
      }
    }, [vendorStatus]);
  
    const validateStep = () => {
      const currentFields = stepsConfig[currentStep].fields;
      const section = stepsConfig[currentStep].section;
      let newErrors = {};
  
      currentFields.forEach(({ field, type, required, validator }) => {
        if (required && (!state[section]?.[field] || state[section]?.[field] === "")) {
          newErrors[field] = "This field is required";
        } else if (type === "file" && required && !state[section]?.[field]) {
          newErrors[field] = "Please upload a file";
        } else if (validator && state[section]?.[field]) {
          // Run the validator function if provided and field has a value
          const validationError = validator(state[section][field]);
          if (validationError) {
            newErrors[field] = validationError;
          }
        }
      });
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleNext = async () => {
      if (validateStep()) {
        try {
          setLoading(true);
          
          const formData = new FormData();
          const currentSection = stepsConfig[currentStep].section;
          const sectionData = state[currentSection] || {};
          
          if (currentSection !== 'attachments') {
            Object.keys(sectionData).forEach(key => {
              formData.append(`ekstore_registered_vendor[${key}]`, sectionData[key] || '');
            });
          } else {
            Object.keys(sectionData).forEach(key => {
              if (sectionData[key]) {
                formData.append(`ekstore_registered_vendor[${key}]`, sectionData[key]);
              }
            });
          }
          
          formData.append('partial_save', 'true');
          formData.append('current_step', currentStep.toString());
          
          const response = await axios.post(
            "https://cfr-joshua-perspectives-cornell.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/create_vendor_record",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "shop": getShopParam(),
                "Accept": "application/json",
                "Origin": window.location.origin
              },
              withCredentials: false
            }
          );

          if (response.status === 200 || response.status === 201) {
            setToastProps({
              active: true,
              content: "Details saved successfully",
              error: false
            });
            
            // Wait a brief moment before moving to next step
            setTimeout(() => {
              setCurrentStep(currentStep + 1);
            }, 500);
          }
        } catch (error) {
          console.error("Error saving partial data:", error);
          setToastProps({
            active: true,
            content: "Failed to save details. Please try again or report the issue.",
            error: true
          });
        } finally {
          setLoading(false);
        }
      }
    };
  
    const handlePrevious = () => {
      setCurrentStep(currentStep - 1);
    };
  
    const handleChange = (section, field) => (value) => {
      dispatch({ section, field, value });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    };
  
    const handleFileUpload = useCallback((section, field, file) => {
      dispatch({ section, field, value: file });
    }, []);
  
    const handleSubmit = async () => {
      if (!validateStep()) return;
      setLoading(true);
      setErrors({});

      const formData = new FormData();
      const vendorData = {
        // Personal Details
        email: state.personalDetails?.email || '',
        legal_entity_name: state.personalDetails?.legal_entity_name || '',
        contact_number: state.personalDetails?.contact_number || '',
        corporate_office_address: state.personalDetails?.corporate_office_address || '',
        
        // Business Details
        registered_office_address: state.businessDetails?.registered_office_address || '',
        place_of_supply_address: state.businessDetails?.place_of_supply_address || '',
        pan_number: state.businessDetails?.pan_number || '',
        gst_registration_number: state.businessDetails?.gst_registration_number || '',
        brand_website: state.businessDetails?.brand_website || '',
        shopify_shop_name: state.businessDetails?.shopify_shop_name || '',
        shopify_spoc_email: state.businessDetails?.shopify_spoc_email || '',
        vendor_state: state.businessDetails?.vendor_state || '',
        
        // Bank Details
        bank_name: state.bankDetails?.bank_name || '',
        branch_name: state.bankDetails?.branch_name || '',
        bank_account_number: state.bankDetails?.bank_account_number || '',
        beneficiary_name: state.bankDetails?.beneficiary_name || '',
        ifsc_code: state.bankDetails?.ifsc_code || '',
        contact_person_name: state.bankDetails?.contact_person_name || '',
        finance_email: state.bankDetails?.finance_email || '',
      };

      // Append all vendor data to formData
      Object.keys(vendorData).forEach(key => {
        formData.append(`ekstore_registered_vendor[${key}]`, vendorData[key]);
      });

      // Append files
      if (state.businessDetails?.pan_card_copy) {
        formData.append('ekstore_registered_vendor[pan_card_copy]', state.businessDetails.pan_card_copy);
      }
      if (state.businessDetails?.gst_certificate_copy) {
        formData.append('ekstore_registered_vendor[gst_certificate_copy]', state.businessDetails.gst_certificate_copy);
      }
      if (state.businessDetails?.msme_certificate_copy) {
        formData.append('ekstore_registered_vendor[msme_certificate_copy]', state.businessDetails.msme_certificate_copy);
      }
      if (state.bankDetails?.cancelled_cheque) {
        formData.append('ekstore_registered_vendor[cancelled_cheque]', state.bankDetails.cancelled_cheque);
      }

      try {
        const response = await axios.post(
          "https://cfr-joshua-perspectives-cornell.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/create_vendor_record",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "shop": getShopParam(),
              "Accept": "application/json",
              "Origin": window.location.origin
            },
            withCredentials: false
          }
        );

        if (response.status === 200 || response.status === 201) {
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrors({ submit: "Failed to submit form. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    // Update handleDocumentCheck to use the working getShopParam function
    const handleDocumentCheck = async () => {
      const shopParam = getShopParam();
      
      if (!shopParam) {
        console.error("Shop parameter could not be determined");
        setShowErrorModal(true);
        return;
      }
      
      localStorage.setItem('shopify-shop-domain', shopParam);
      
      try {
        const response = await axios.get(
          "https://cfr-joshua-perspectives-cornell.trycloudflare.com/shopify_sales_channel/zoho_esign_status",
          {
            headers: {
              "shop": shopParam,
              "Accept": "application/json",
              "Origin": window.location.origin
            }
          }
        );
        
        console.log("API response:", response.data);
        
        if (response.status === 200 && response.data.status === true) {
          // Update vendor status first
          if (vendorStatus && typeof vendorStatus.setVendorStatus === 'function') {
            vendorStatus.setVendorStatus(prev => ({
              ...prev,
              isRegistered: true,
              esignStatus: 'completed',
              isCatalogueSettingsCompleted: false
            }));
          }
          setShowSuccessModal(true);
        } else {
          setShowErrorModal(true);
        }
      } catch (error) {
        console.error("Error checking e-sign status:", error);
        setShowErrorModal(true);
      }
    };

    // Add this new function
    const handleSkipBankDetails = (e) => {
      // Prevent any default form submission
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Immediately set submitted state
      setIsSubmitted(true);
    };

    // Update the button click handler
    const handleSendDocument = async () => {
      const shopParam = getShopParam();
      if (shopParam) {
        setLoading(true);
        try {
          const response = await axios.post(
            "https://cfr-joshua-perspectives-cornell.trycloudflare.com/shopify_sales_channel/send_document_for_esign",
            {},
            {
              headers: {
                "Content-Type": "application/json",
                "shop": shopParam,
                "Accept": "application/json",
                "Origin": window.location.origin
              },
              withCredentials: false
            }
          );

          if (response.status === 200) {
            setToastProps({
              active: true,
              content: "Document sent for eSignature successfully!",
              error: false
            });
            // Set document sent status to true
            setDocumentSent(true);
          }
        } catch (error) {
          console.error("Error sending document:", error);
          setToastProps({
            active: true,
            content: "Failed to send document. Please try again.",
            error: true
          });
        } finally {
          setLoading(false);
        }
      }
    };

    // Update the Modal component
    const handleSuccessModalAction = useCallback(() => {
      const shopParam = getShopParam();
      if (shopParam) {
        // First update the vendor status
        if (vendorStatus && typeof vendorStatus.setVendorStatus === 'function') {
          vendorStatus.setVendorStatus(prev => ({
            ...prev,
            isRegistered: true,
            esignStatus: 'completed',
            isCatalogueSettingsCompleted: false
          }));
        }

        // Close the modal
        setShowSuccessModal(false);

        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          // Use replace instead of href to prevent back navigation
          window.location.replace(`/catalogue-settings?shop=${shopParam}`);
        }, 100);
      } else {
        console.error("Shop parameter could not be determined");
        setShowErrorModal(true);
      }
    }, [vendorStatus, getShopParam]);

    if (isSubmitted || vendorStatus.isRegistered) {
        return (
            <Page>
                <Layout>
                    <Layout.Section>
                        <LegacyCard sectioned>
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <h2 style={{ 
                                    fontSize: '24px', 
                                    marginBottom: '20px',
                                    color: '#202223' 
                                }}>
                                    Thank you for completing the Onboarding 🎉
                                </h2>
                                <div style={{ 
                                    marginBottom: '24px',
                                    fontSize: '16px',
                                    lineHeight: '1.5',
                                    color: '#6D7175'
                                }}>
                                    <p style={{ marginBottom: '16px' }}>
                                        <strong>In the next step, you will receive a document which you need to eSign to become a part of the Nexus. The process is simple:</strong>
                                    </p>
                                    <ul style={{ textAlign: 'left', marginBottom: '16px' }}>
                                        <li>Review the document thoroughly at your convenience</li>
                                        <li>Complete the eSignature process</li>
                                        <li>Submit the signed document within 10 days</li>
                                    </ul>
                                    <p>
                                        Please note that your onboarding process will only be complete once we receive your signed document. If you have any questions or need clarification, our support team is here to assist you.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                    {/* Show "Send Document" button if status is pending or null */}
                                    {(!vendorStatus.esignStatus || vendorStatus.esignStatus === 'pending') && !documentSent && (
                                        <Button
                                            primary
                                            onClick={handleSendDocument}
                                            loading={loading}
                                        >
                                            Send Document for eSignature
                                        </Button>
                                    )}
                                    
                                    {/* Show "Already Signed" button if status is sent */}
                                    {(vendorStatus.esignStatus === 'sent' || documentSent) && (
                                        <Button
                                            primary
                                            onClick={handleDocumentCheck}
                                            loading={loading}
                                        >
                                            I have already Signed the Document
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </LegacyCard>
                    </Layout.Section>
                </Layout>
                <Modal
                    open={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
                    title="Document Signing Issue"
                    primaryAction={{
                        content: "Close",
                        onAction: () => setShowErrorModal(false),
                    }}
                >
                    <Modal.Section>
                        <p>
                          {!getShopParam() 
                            ? "Unable to determine shop information. Please try refreshing the page or contact support."
                            : "Your document signing is not yet complete. Please complete the signing process and try again."}
                        </p>
                    </Modal.Section>
                </Modal>
                <Modal
                    open={showSuccessModal}
                    onClose={() => setShowSuccessModal(false)}
                    title="Congratulations! 🎉"
                    primaryAction={{
                        content: "Move to Next Step",
                        onAction: handleSuccessModalAction
                    }}
                >
                    <Modal.Section>
                        <p>Your document signing is complete! You can now proceed to the next step.</p>
                    </Modal.Section>
                </Modal>
                
                {toastProps.active && (
                    <Toast
                        content={toastProps.content}
                        error={toastProps.error}
                        onDismiss={() => setToastProps({ active: false, content: '', error: false })}
                        duration={3000}
                    />
                )}
            </Page>
        );
    }
  


  const stepsConfig = [
    {
      title: "Personal Details",
      section: "personalDetails",
      fields: [
        { label: "Email *", field: "email", type: "email", required: true, validator: validateEmail },
        { label: "Legal Entity Name *", field: "legal_entity_name", required: true },
        { label: "Contact Number *", field: "contact_number", required: true, validator: validatePhone },
        { label: "Corporate Office Address *", field: "corporate_office_address", required: true },
      ],
    },
    {
      title: "Business Details",
      section: "businessDetails",
      fields: [
        { label: "Registered Office Address *", field: "registered_office_address", required: true },
        { label: "Place of Supply Address *", field: "place_of_supply_address", required: true },
        { label: "PAN Number *", field: "pan_number", required: true, validator: validatePAN },
        { label: "PAN Card Copy *", field: "pan_card_copy", type: "file", required: true },
        { label: "GST Registration Number *", field: "gst_registration_number", required: true, validator: validateGST },
        { label: "GST Certificate Copy *", field: "gst_certificate_copy", type: "file", required: true },
        { label: "MSME Registration Number", field: "msme_registration_number", required: false },
        { label: "MSME Certificate Copy", field: "msme_certificate_copy", type: "file", required: false },
        { label: "Brand Website *", field: "brand_website", required: true },
        { label: "Shopify Shop Name *", field: "shopify_shop_name", required: true },
        { label: "Shopify SPOC Email *", field: "shopify_spoc_email", required: true, validator: validateEmail },
        { label: "State *", field: "vendor_state", type: "select", required: true },
      ],
    },
    {
      title: "Bank Details (Optional)",
      section: "bankDetails",
      fields: [
        { label: "Bank Name", field: "bank_name", required: false },
        { label: "Branch Name", field: "branch_name", required: false },
        { label: "Bank Account Number", field: "bank_account_number", required: false },
        { label: "Beneficiary Name", field: "beneficiary_name", required: false },
        { label: "IFSC Code", field: "ifsc_code", required: false, validator: validateIFSC },
        { label: "Contact Person Name", field: "contact_person_name", required: false },
        { label: "Finance Email", field: "finance_email", required: false, validator: validateEmail },
        { label: "Cancelled Cheque", field: "cancelled_cheque", type: "file", required: false },
      ],
    },
  ];
  
    const currentStepConfig = stepsConfig[currentStep];
  
    return (
      <Page>
        <Layout>
          <Layout.Section fullWidth>
            <div style={{
              marginLeft: "20px",
              marginRight: "20px",
              padding: "20px",
              background: "white",
              borderRadius: "8px",
            }}>
              <h1 style={{
                textAlign: "left",
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: "600",
                color: "#202223",
              }}>
                {currentStepConfig.title}
              </h1>
              
              {/* Only render the form if not on the bank details step or if we're not skipping */}
              {currentStep !== 2 ? (
                <Form>
                  <FormLayout>
                    {currentStepConfig.fields.map(({ label, field, type }) =>
                      type === "select" ? (
                        <Select
                          key={field}
                          label={label}
                          options={states}
                          value={state[currentStepConfig.section]?.[field] || ""}
                          onChange={handleChange(currentStepConfig.section, field)}
                          error={errors[field]}
                        />
                      ) : type === "file" ? (
                        <div key={field} style={{ marginBottom: "10px" }}>
                          <DropZone
                            allowMultiple={false}
                            label={label}
                            onDrop={(_dropFiles, acceptedFiles, _rejectedFiles) => {
                              if (acceptedFiles.length > 0) {
                                handleFileUpload(
                                  currentStepConfig.section,
                                  field,
                                  acceptedFiles[0]
                                );
                              }
                            }}
                          >
                            {state?.[currentStepConfig.section]?.[field] ? (
                              <LegacyStack>
                                <Thumbnail
                                  size="small"
                                  alt={state[currentStepConfig.section][field]?.name || ''}
                                  source={
                                    state[currentStepConfig.section][field] && 
                                    validImageTypes.includes(state[currentStepConfig.section][field].type)
                                      ? window.URL.createObjectURL(state[currentStepConfig.section][field])
                                      : NoteIcon
                                  }
                                />
                                <div>
                                  {state[currentStepConfig.section][field]?.name || ''}{" "}
                                  <Text variant="bodySm" as="p">
                                    {state[currentStepConfig.section][field]?.size 
                                      ? `${Math.round(state[currentStepConfig.section][field].size / 1024)} KB`
                                      : '0 KB'}
                                  </Text>
                                </div>
                              </LegacyStack>
                            ) : (
                              <DropZone.FileUpload 
                                actionTitle="Add File"
                                actionHint="or drop files to upload"
                              />
                            )}
                          </DropZone>
                          {errors[field] && (
                            <div style={{ color: '#bf0711', fontSize: '14px', marginTop: '4px' }}>
                              {errors[field]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <TextField
                          key={field}
                          label={label}
                          value={state[currentStepConfig.section]?.[field] || ""}
                          onChange={handleChange(currentStepConfig.section, field)}
                          type={type || "text"}
                          fullWidth
                          error={errors[field]}
                        />
                      )
                    )}
                    {errors.submit && (
                      <div style={{ color: '#bf0711', fontSize: '14px', marginTop: '4px', marginBottom: '16px' }}>
                        {errors.submit}
                      </div>
                    )}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}>
                      {currentStep > 0 && (
                        <Button onClick={handlePrevious}>Previous</Button>
                      )}
                      <Button 
                        primary 
                        onClick={handleNext} 
                        loading={loading}
                        size="large"
                        style={{
                          background: "#008060",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          borderRadius: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Save and Continue
                      </Button>
                    </div>
                  </FormLayout>
                </Form>
              ) : (
                // Special case for bank details step
                <div>
                  <p style={{ marginBottom: "20px" }}>
                    Bank details are optional. You can either fill them now or skip this step.
                  </p>
                  
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}>
                    <Button onClick={handlePrevious}>Previous</Button>
                    <div>
                      <Button 
                        onClick={handleSkipBankDetails}
                        style={{ marginRight: "10px" }}
                      >
                        Skip Bank Details
                      </Button>
                      <Button 
                        primary 
                        onClick={() => {
                          // Show form for bank details
                          setCurrentStep(2.5); // Use a special step number
                        }}
                        size="large"
                        style={{
                          background: "#008060",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          borderRadius: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Fill Bank Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Special bank details form that appears only when user clicks "Fill Bank Details" */}
              {currentStep === 2.5 && (
                <Form>
                  <FormLayout>
                    {stepsConfig[2].fields.map(({ label, field, type }) =>
                      type === "file" ? (
                        <div key={field} style={{ marginBottom: "10px" }}>
                          <DropZone
                            allowMultiple={false}
                            label={label}
                            onDrop={(_dropFiles, acceptedFiles, _rejectedFiles) => {
                              if (acceptedFiles.length > 0) {
                                handleFileUpload(
                                  "bankDetails",
                                  field,
                                  acceptedFiles[0]
                                );
                              }
                            }}
                          >
                            {state?.bankDetails?.[field] ? (
                              <LegacyStack>
                                <Thumbnail
                                  size="small"
                                  alt={state.bankDetails[field]?.name || ''}
                                  source={
                                    state.bankDetails[field] && 
                                    validImageTypes.includes(state.bankDetails[field].type)
                                      ? window.URL.createObjectURL(state.bankDetails[field])
                                      : NoteIcon
                                  }
                                />
                                <div>
                                  {state.bankDetails[field]?.name || ''}{" "}
                                  <Text variant="bodySm" as="p">
                                    {state.bankDetails[field]?.size 
                                      ? `${Math.round(state.bankDetails[field].size / 1024)} KB`
                                      : '0 KB'}
                                  </Text>
                                </div>
                              </LegacyStack>
                            ) : (
                              <DropZone.FileUpload 
                                actionTitle="Add File"
                                actionHint="or drop files to upload"
                              />
                            )}
                          </DropZone>
                          {errors[field] && (
                            <div style={{ color: '#bf0711', fontSize: '14px', marginTop: '4px' }}>
                              {errors[field]}
                            </div>
                          )}
                        </div>
                      ) : (
                        <TextField
                          key={field}
                          label={label}
                          value={state.bankDetails?.[field] || ""}
                          onChange={handleChange("bankDetails", field)}
                          type={type || "text"}
                          fullWidth
                          error={errors[field]}
                        />
                      )
                    )}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "20px",
                    }}>
                      <Button onClick={() => setCurrentStep(2)}>Back</Button>
                      <Button 
                        primary 
                        onClick={handleSubmit} 
                        loading={loading}
                        size="large"
                        style={{
                          background: "#008060",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          borderRadius: "4px",
                          fontWeight: "500"
                        }}
                      >
                        Submit
                      </Button>
                    </div>
                  </FormLayout>
                </Form>
              )}
            </div>
          </Layout.Section>
        </Layout>
        
        {toastProps.active && (
          <Toast
            content={toastProps.content}
            error={toastProps.error}
            onDismiss={() => setToastProps({ active: false, content: '', error: false })}
            duration={3000}
          />
        )}
      </Page>
    );
  }