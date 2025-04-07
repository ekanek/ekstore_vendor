import {
  Card,
  Page,
  Layout,
  TextContainer,
  Text,
  Button,
  SkeletonBodyText,
} from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';
import { useEffect } from 'react';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); // Add this to check the current route
  const [searchParams] = useSearchParams();
  const { vendorStatus } = useVendorStatus();
  const { isLoading, isRegistered, shop } = vendorStatus;
  console.log('---pages index', vendorStatus);
  // Redirect to /vendor-dashboard if registered and on the home page
  useEffect(() => {
    if (isRegistered && location.pathname === '/') {
      navigate(`/vendor-dashboard?shop=${shop}`, { replace: true });
    }
  }, [isRegistered, location.pathname, navigate, shop]);

  if (isLoading) {
    return (
      <Page narrowWidth>
        <TitleBar title='Loading...' />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <SkeletonBodyText lines={5} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // If registered, we don’t render anything here (navigation happens in useEffect)
  if (isRegistered) {
    return null; // or a fallback UI if needed
  }

  // If not registered, show the welcome page
  const handleOnboardingClick = () => {
    navigate(`/registration?shop=${shop}`);
  };

  return (
    <Page narrowWidth>
      <TitleBar title='Welcome to Ekstore Nexus' />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextContainer spacing='loose'>
              <div style={{ textAlign: 'center' }}>
                <Text as='h2' variant='headingLg'>
                  Thank you for becoming a part of Ekanek Family 🎉
                </Text>

                <div style={{ margin: '20px 0' }}>
                  <Text as='p' variant='bodyMd'>
                    Ekstore Nexus empowers your business growth by providing a
                    unified platform to showcase your products across multiple
                    sales channels. Our integrated solution streamlines your
                    product listing process while offering exclusive
                    opportunities to participate in targeted campaigns,
                    ultimately driving increased visibility and sales
                    performance. By leveraging our comprehensive marketplace
                    integration, you can efficiently expand your market reach
                    and optimize your business operations.
                  </Text>
                </div>

                <div style={{ margin: '20px 0' }}>
                  <Text as='p' variant='bodyMd'>
                    To proceed further, we require you to complete a mandatory
                    onboarding form that will help us better understand your
                    business requirements and provide you with tailored
                    solutions.
                  </Text>
                </div>

                <div style={{ marginTop: '32px' }}>
                  <Button primary size='large' onClick={handleOnboardingClick}>
                    Complete Merchant Onboarding
                  </Button>
                </div>
              </div>
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
