import { useEffect, useState } from 'react';
import { Form, FormLayout, TextField, Button, Select } from '@shopify/polaris';
import axios from 'axios';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';

const states = [
  { label: 'Select state', value: '' },
  { label: 'Delhi', value: 'delhi' },
  { label: 'Haryana', value: 'haryana' },
  { label: 'Maharashtra', value: 'maharashtra' },
  { label: 'Karnataka', value: 'karnataka' },
];

export default function BusinessDetailsForm({
  onNext,
  onPrevious,
  initialData,
}) {
  const [data, setData] = useState({
    registered_office_address: '',
    place_of_supply_address: '',
    pan_number: '',
    gst_registration_number: '',
    msme_registration_number: '',
    website: '',
    state: '',
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const { vendorStatus } = useVendorStatus();
  const { business_details_complete = false, business_details = {} } =
    vendorStatus?.data;

  useEffect(() => {
    if (business_details_complete) {
      setData(business_details);
    }
  });
  const validate = () => {
    const newErrors = {};
    if (!data.registered_office_address)
      newErrors.registered_office_address = 'This field is required';
    if (!data.place_of_supply_address)
      newErrors.place_of_supply_address = 'This field is required';
    if (!data.pan_number || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.pan_number))
      newErrors.pan_number = 'Valid PAN required (e.g., ABCDE1234F)';
    if (
      !data.gst_registration_number ||
      !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(
        data.gst_registration_number,
      )
    )
      newErrors.gst_registration_number =
        'Valid GST required (e.g., 22ABCDE1234F1Z5)';
    if (!data.website) newErrors.website = 'This field is required';
    if (!data.state) newErrors.state = 'Please select a state';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('----handle submit business');
    if (!validate()) return;
    const currentStep = 1;
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(`ekstore_registered_vendor[${key}]`, value);
    });
    formData.append('current_step', currentStep.toString());
    try {
      await axios.post(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/create_vendor_record',
        formData,
        { headers: { shop: vendorStatus.shop } },
      );
      onNext(data);
    } catch (error) {
      console.error('Error submitting business details:', error);
      setErrors({ submit: 'Failed to save. Please try again.' });
    }
  };

  const handleChange = (field) => (value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormLayout>
        <TextField
          label='Registered office Address'
          value={data.registered_office_address}
          onChange={handleChange('registered_office_address')}
          error={errors.registered_office_address}
        />
        <Select
          label='State *'
          options={states}
          value={data.state}
          onChange={handleChange('state')}
          error={errors.state}
        />
        <TextField
          label='Place of Supply Address *'
          value={data.place_of_supply_address}
          onChange={handleChange('place_of_supply_address')}
          error={errors.place_of_supply_address}
        />
        <TextField
          label='PAN Number *'
          value={data.pan_number}
          onChange={handleChange('pan_number')}
          error={errors.pan_number}
        />
        <TextField
          label='GST Registration Number *'
          value={data.gst_registration_number}
          onChange={handleChange('gst_registration_number')}
          error={errors.gst_registration_number}
        />
        <TextField
          label='MSME Registration Number'
          value={data.msme_registration_number}
          onChange={handleChange('msme_registration_number')}
          error={errors.msme_registration_number}
        />
        <TextField
          label='Brand Website *'
          value={data.website}
          onChange={handleChange('website')}
          error={errors.website}
        />
        {errors.submit && (
          <div style={{ color: '#bf0711' }}>{errors.submit}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant='primary' onClick={onPrevious}>
            Previous
          </Button>
          <Button variant='primary' primary submit>
            Save and Continue
          </Button>
        </div>
      </FormLayout>
    </Form>
  );
}
