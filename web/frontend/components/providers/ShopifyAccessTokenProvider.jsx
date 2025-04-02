// ShopifyTokenProvider.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { useSearchParams } from 'react-router-dom';

// Create the context
const ShopifyTokenContext = createContext(null);

// Custom hook to use the context
export const useShopifyToken = () => {
  const context = useContext(ShopifyTokenContext);
  if (!context) {
    throw new Error(
      'useShopifyToken must be used within a ShopifyTokenProvider',
    );
  }
  return context;
};

// Define the provider
export function ShopifyTokenProvider({ children }) {
  const [searchParams] = useSearchParams();
  const [tokenDetails, setTokenDetails] = useState({
    isLoading: true,
    data: null,
    error: null,
  });
  const hasFetchedToken = useRef(false);

  useEffect(() => {
    const fetchShopifyToken = async () => {
      const shop = searchParams.get('shop') || '';
      if (!shop || hasFetchedToken.current) return;

      try {
        setTokenDetails({ isLoading: true, data: null, error: null });

        const response = await fetch('/api/shops/get_access_token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            shop: shop,
          },
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        const data = await response.json();
        setTokenDetails({
          isLoading: false,
          data: data,
          error: null,
          shop: shop,
        });
        hasFetchedToken.current = true;
      } catch (error) {
        console.log('Error fetching token details:', error);
        setTokenDetails({
          isLoading: false,
          data: null,
          shop: shop,
          error:
            error.message || 'An error occurred while fetching token details',
        });
      }
    };

    fetchShopifyToken();
  }, [searchParams]);

  return (
    <ShopifyTokenContext.Provider value={{ tokenDetails, setTokenDetails }}>
      {children}
    </ShopifyTokenContext.Provider>
  );
}
