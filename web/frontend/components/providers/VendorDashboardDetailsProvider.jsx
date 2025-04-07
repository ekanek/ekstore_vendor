// VendorDashboardDetailsProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Define the API base URL (consider moving to an environment variable)

// Create the context
const VendorDashboardDetailsContext = createContext(null);

// Custom hook to use the context
export const useVendorDashboardDetails = () => {
  const context = useContext(VendorDashboardDetailsContext);
  if (!context) {
    throw new Error(
      'useVendorDashboardDetails must be used within a VendorDashboardDetailsProvider',
    );
  }
  return context;
};

// Define the provider
export function VendorDashboardDetailsProvider({ children }) {
  const [searchParams] = useSearchParams();
  const [dashboardDetails, setDashboardDetails] = useState({
    isLoading: true,
    data: null,
    error: null,
  });
  const hasFetchedDetails = useRef(false);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      const shop = searchParams.get('shop') || '';
      if (!shop || hasFetchedDetails.current) return;

      try {
        setDashboardDetails({ isLoading: true, data: null, error: null });

        const response = await axios.get(
          `/ekstore_registered_vendors/vendor_dashboard_details`,
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
          setDashboardDetails({
            isLoading: false,
            data: response.data,
            error: null,
            shop: shop
          });
          hasFetchedDetails.current = true;
        } else {
          throw new Error('Failed to fetch dashboard details');
        }
      } catch (error) {
        console.log('Error fetching dashboard details:', error);
        setDashboardDetails({
          isLoading: false,
          data: null,
          shop: shop,
          error:
            error.message ||
            'An error occurred while fetching dashboard details',
        });
      }
    };

    fetchDashboardDetails();
  }, [searchParams]);

  return (
    <VendorDashboardDetailsContext.Provider
      value={{ dashboardDetails, setDashboardDetails }}
    >
      {children}
    </VendorDashboardDetailsContext.Provider>
  );
}
