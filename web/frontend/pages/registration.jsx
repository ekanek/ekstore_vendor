import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page, Layout } from '@shopify/polaris';
import PersonalDetailsForm from './PersonalDetailsForm';
import BusinessDetailsForm from './BusinessDetailsForm';
import BankDetailsForm from './BankDetailsForm';
import DocumentSigning from './DocumentSigning';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';

const steps = [
  { component: PersonalDetailsForm, title: 'Personal Details' },
  { component: BusinessDetailsForm, title: 'Business Details' },
  { component: BankDetailsForm, title: 'Bank Details' },
  { component: DocumentSigning, title: 'Document Signing' },
];

export default function Registration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const { vendorStatus } = useVendorStatus();
  console.log('---registration js--', vendorStatus);
  const {
    personal_details_complete = false,
    business_details_complete = false,
    bank_details_complete = false,
    document_upload_status = false,
    esign_status = 'pending',
    success = false,
  } = vendorStatus?.data;

  const CurrentComponent = steps[currentStep].component;

  useEffect(() => {
    if (success && esign_status === 'signed') {
      if (vendorStatus.shop) {
        navigate(`/vendor-dashboard?shop=${vendorStatus.shop}`);
      }
    } else if (bank_details_complete || document_upload_status) {
      setCurrentStep(3);
    } else if (business_details_complete) {
      setCurrentStep(2);
    } else if (personal_details_complete) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
  }, [
    personal_details_complete,
    business_details_complete,
    bank_details_complete,
    esign_status,
    success,
    navigate,
    vendorStatus.shop,
  ]);

  const handleNext = useCallback(
    (data) => {
      console.log('handleNext called with data:', data);
      setFormData((prev) => ({ ...prev, ...data }));
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => {
          const newStep = prev + 1;
          console.log('Moving to step:', newStep);
          return newStep;
        });
      }
    },
    [currentStep],
  );

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => {
        const newStep = prev - 1;
        return newStep;
      });
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    console.log('handleComplete called');
    if (vendorStatus.shop) {
      navigate(`/vendor-dashboard?shop=${vendorStatus.shop}`);
    }
  }, [navigate, vendorStatus.shop]);

  return (
    <Page title={steps[currentStep].title}>
      <Layout>
        <Layout.Section>
          <CurrentComponent
            onNext={handleNext}
            onPrevious={handlePrevious}
            initialData={formData}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            onComplete={handleComplete}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
