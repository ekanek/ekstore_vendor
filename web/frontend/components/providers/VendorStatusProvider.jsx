import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const VendorStatusContext = createContext(null);

export const useVendorStatus = () => useContext(VendorStatusContext);

export function VendorStatusProvider({ children }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [vendorStatus, setVendorStatus] = useState({
    isLoading: true,
    isRegistered: false,
    esignStatus: null,
    isCatalogueSettingsCompleted: false,
    organisationExists: false,
    shop: '',
  });

  const hasFetchedStatus = useRef(false);

  useEffect(() => {
    const checkVendorStatus = async () => {
      const shop = searchParams.get('shop') || '';
      try {
        if (!shop || (hasFetchedStatus.current && location.pathname !== '/'))
          return;

        const response = await axios.get(
          `/api/ekstore_registered_vendors/get_vendor_status`,
          {
            headers: {
              shop: shop,
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            withCredentials: false,
          },
        );

        if (response.status === 200) {
          const { success, form_completion_status, esign_status } =
            response.data;

          const newStatus = {
            isLoading: false,
            isRegistered: success ? form_completion_status : false,
            esignStatus: success ? esign_status : null,
            organisationExists: success,
            shop: shop,
          };

          setVendorStatus(newStatus);
          hasFetchedStatus.current = true;

          // Only navigate if we're not already on the correct page
          if (!success && location.pathname !== '/') {
            navigate('/');
          } else if (
            form_completion_status &&
            esign_status === 'pending' &&
            location.pathname !== '/registration'
          ) {
            navigate(`/registration?esignPending=true&shop=${shop}`);
          } else if (
            form_completion_status &&
            esign_status === 'signed' &&
            location.pathname !== '/vendor-dashboard'
          ) {
            navigate(`/vendor-dashboard?shop=${shop}`);
          } else if (
            !form_completion_status &&
            location.pathname !== '/registration'
          ) {
            navigate(`/registration?shop=${shop}`);
          }
        }
      } catch (error) {
        console.error('Error checking vendor status:', error);
        setVendorStatus({
          isLoading: false,
          isRegistered: false,
          esignStatus: null,
          isCatalogueSettingsCompleted: false,
          organisationExists: false,
          shop: shop,
        });
        if (location.pathname !== '/') {
          navigate('/');
        }
      }
    };

    checkVendorStatus();
  }, [searchParams, location.pathname, navigate]);

  return (
    <VendorStatusContext.Provider value={{ vendorStatus, setVendorStatus }}>
      {children}
    </VendorStatusContext.Provider>
  );
}