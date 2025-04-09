import { useEffect, useState } from 'react';
import {
  Form,
  FormLayout,
  TextField,
  Button,
  DropZone,
  LegacyStack,
  Thumbnail,
} from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';
import axios from 'axios';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';

export default function BankDetailsForm({ onNext, onPrevious, initialData }) {
  const [data, setData] = useState({
    bank_name: '',
    account_number: '',
    beneficiary_name: '',
    ifsc_code: '',
    micr: '',
    account_type: '',
    cancelled_check: null,
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const { vendorStatus } = useVendorStatus();
  const { bank_details = {}, bank_details_complete = false } =
    vendorStatus?.data;

  useEffect(() => {
    if (bank_details_complete) {
      setData(bank_details);
    }
  });

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(`ekstore_registered_vendor[${key}]`, value);
    });

    try {
      await axios.post(
        'https://toddler-egypt-qualified-australia.trycloudflare.com/shopify_sales_channel/ekstore_registered_vendors/create_bank_details',
        formData,
        { headers: { shop: vendorStatus.shop } },
      );
      onNext(data);
    } catch (error) {
      console.error('Error submitting bank details:', error);
      setErrors({ submit: 'Failed to save. Please try again.' });
    }
  };

  const handleSkip = () => {
    onNext(data);
  };

  const handleChange = (field) => (value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <p>Bank details are optional. You can skip this step if you prefer.</p>
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          <TextField
            label='Bank Name'
            value={data.bank_name}
            onChange={handleChange('bank_name')}
          />
          <TextField
            label='Bank Account Number'
            value={data.account_number}
            onChange={handleChange('account_number')}
          />
          <TextField
            label='Beneficiary Name'
            value={data.beneficiary_name}
            onChange={handleChange('beneficiary_name')}
          />
          <TextField
            label='IFSC Code'
            value={data.ifsc_code}
            onChange={handleChange('ifsc_code')}
          />
          <TextField
            label='MICR'
            value={data.micr}
            onChange={handleChange('micr')}
          />
          <TextField
            label='Account Type'
            value={data.account_type}
            onChange={handleChange('account_type')}
          />
          <DropZone
            label='Cancelled Cheque'
            onDrop={(_, acceptedFiles) =>
              handleChange('cancelled_check')(acceptedFiles[0])
            }
          >
            {data.cancelled_check ? (
              <LegacyStack>
                <Thumbnail
                  source={window.URL.createObjectURL(data.cancelled_check)}
                  alt='Cheque'
                />
                <div>{data.cancelled_check.name}</div>
              </LegacyStack>
            ) : (
              <DropZone.FileUpload />
            )}
          </DropZone>
          {errors.submit && (
            <div style={{ color: '#bf0711' }}>{errors.submit}</div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant='primary' onClick={onPrevious}>
              Previous
            </Button>
            <div>
              <Button
                variant='primary'
                onClick={handleSkip}
                style={{ marginRight: '10px' }}
              >
                Skip
              </Button>
              <Button variant='primary' primary submit>
                Save and Continue
              </Button>
            </div>
          </div>
        </FormLayout>
      </Form>
    </div>
  );
}
