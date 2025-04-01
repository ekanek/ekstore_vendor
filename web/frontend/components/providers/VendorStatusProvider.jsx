import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

// Create the context outside of the component
const VendorStatusContext = createContext(null);

export const useVendorStatus = () => useContext(VendorStatusContext);

// Define your API base URL - consider moving this to an environment variable
const API_BASE_URL = "https://facing-ball-apollo-relative.trycloudflare.com";

// Export the provider as a named export (not default)
export function VendorStatusProvider({ children }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vendorStatus, setVendorStatus] = useState({
    isLoading: true,
    isRegistered: false,
    esignStatus: null,
    isCatalogueSettingsCompleted: false,
    organisationExists: false,
  });

  const hasFetchedStatus = useRef(false);

  useEffect(() => {
    const checkVendorStatus = async () => {
      const shop = searchParams.get('shop') || '';
      try {
        if (!shop || hasFetchedStatus.current) return;

        const response = await axios.get(
          `${API_BASE_URL}/shopify_sales_channel/ekstore_registered_vendors/get_vendor_status`,
          {
            headers: {
              "shop": shop,
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            withCredentials: false
          }
        );

        if (response.status === 200) {
          const { success, form_completion_status, esign_status } = response.data;
          
          setVendorStatus({
            isLoading: false,
            isRegistered: success ? form_completion_status : false,
            esignStatus: success ? esign_status : null,
            organisationExists: success,
            shop: shop
          });

          // Handle routing based on response
          if (!success) {
            navigate('/');
          } else if (form_completion_status && esign_status === 'pending') {
            navigate(`/registration?esignPending=true&shop=${shop}`);
          } else if (form_completion_status && esign_status === 'signed') {
            navigate(`/vendor-dashboard?shop=${shop}`);
          } else {
            navigate(`/registration?shop=${shop}`);
          }

          hasFetchedStatus.current = true;
        }
      } catch (error) {
        console.error("Error checking vendor status:", error);
        setVendorStatus({
          isLoading: false,
          isRegistered: false,
          esignStatus: null,
          isCatalogueSettingsCompleted: false,
          organisationExists: false,
          shop: shop
        });
        navigate('/');
      }
    };

    checkVendorStatus();
  }, [searchParams, navigate]);

  return (
    <VendorStatusContext.Provider value={{ vendorStatus, setVendorStatus }}>
      {children}
    </VendorStatusContext.Provider>
  );
} 