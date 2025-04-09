import { useEffect, useState, useRef } from 'react';
import { Form, FormLayout, TextField, Button, Toast } from '@shopify/polaris';
import axios from 'axios';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';
import { useSearchParams } from 'react-router-dom'; // Added for searchParams

export default function PersonalDetailsForm({ onNext, isFirstStep }) {
  const [data, setData] = useState({
    email: '',
    name: '',
    phone_number: '',
    corporate_office_address: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({
    active: false,
    content: '',
    error: false,
  });
  const [tokenDetails, setTokenDetails] = useState({
    isLoading: false,
    data: null,
    error: null,
    shop: null,
  });
  const hasFetchedToken = useRef(false); // Ref to prevent multiple fetches
  const { vendorStatus } = useVendorStatus();

  // Fetch Shopify token
  useEffect(() => {
    const fetchShopifyToken = async () => {
      const shop = vendorStatus.shop || '';
      if (!shop) return;

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
        console.log('---data---token--registration', data);
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
  }, [vendorStatus.shop]);

  const validate = () => {
    const newErrors = {};
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      newErrors.email = 'Valid email required';
    if (!data.name) newErrors.name = 'This field is required';
    if (!data.phone_number || !/^\d{10}$/.test(data.phone_number))
      newErrors.phone_number = 'Valid 10-digit number required';
    if (!data.corporate_office_address)
      newErrors.corporate_office_address = 'This field is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { personal_details_complete = false, personal_details = {} } =
    vendorStatus?.data || {};

  useEffect(() => {
    if (personal_details_complete) {
      setData(personal_details);
    }
  }, [personal_details_complete, personal_details]);

  const handleSubmit = async () => {
    if (!validate()) return;

    if (tokenDetails.isLoading) {
      setToast({
        active: true,
        content: 'Please wait, fetching token...',
        error: false,
      });
      return;
    }

    if (tokenDetails.error || !tokenDetails.data) {
      setToast({
        active: true,
        content: 'Token unavailable. Please try again later.',
        error: true,
      });
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(`ekstore_registered_vendor[${key}]`, value);
      });

      const response = await axios.post(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/create_vendor_record',
        formData,
        {
          headers: {
            shop: vendorStatus.shop,
            shopify_token: `${tokenDetails.data.access_token}`,
          },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setToast({
          active: true,
          content: 'Personal details saved successfully!',
          error: false,
        });
        setTimeout(() => {
          onNext(data);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting personal details:', error);
      setToast({
        active: true,
        content: 'Failed to save personal details. Please try again.',
        error: true,
      });
    }
  };

  const handleChange = (field) => (value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const toggleToast = () => {
    setToast((prev) => ({ ...prev, active: false }));
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <TextField
            label='Email *'
            value={data.email}
            onChange={handleChange('email')}
            error={errors.email}
          />
          <TextField
            label='Legal Entity Name *'
            value={data.name}
            onChange={handleChange('name')}
            error={errors.name}
          />
          <TextField
            label='Contact Number *'
            value={data.phone_number}
            onChange={handleChange('phone_number')}
            error={errors.phone_number}
          />
          <TextField
            label='Corporate Office Address *'
            value={data.corporate_office_address}
            onChange={handleChange('corporate_office_address')}
            error={errors.corporate_office_address}
          />
          {errors.submit && (
            <div style={{ color: '#bf0711' }}>{errors.submit}</div>
          )}
          <Button variant='primary' submit disabled={tokenDetails.isLoading}>
            Save and Continue
          </Button>
        </FormLayout>
      </Form>
      {toast.active && (
        <Toast
          content={toast.content}
          error={toast.error}
          onDismiss={toggleToast}
          duration={3000}
        />
      )}
    </>
  );
}
