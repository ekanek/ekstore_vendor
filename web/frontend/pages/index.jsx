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
import { useNavigate, useLocation } from 'react-router-dom';
import { useVendorStatus } from '../components/providers/VendorStatusProvider';
import { useEffect } from 'react';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendorStatus } = useVendorStatus();
  const { isLoading, esignStatus, shop } = vendorStatus;
  useEffect(() => {
    if (esignStatus === 'signed' && location.pathname === '/') {
      navigate(`/vendor-dashboard?shop=${shop}`, { replace: true });
    }
  }, [esignStatus, location.pathname, navigate, shop]);

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
  if (esignStatus) {
    return null;
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
                  Welcome to the EkStore Family!
                </Text>

                <div style={{ margin: '20px 0' }}>
                  <Text as='p' variant='bodyMd'>
                    EkStore is a unified ecommerce ecosystem that helps you grow
                    your business by:
                  </Text>
                </div>

                <div style={{ margin: '20px 0', textAlign: 'left' }}>
                  <ul style={{ paddingLeft: '20px' }}>
                    <li>
                      <Text as='p' variant='bodyMd'>
                        Connecting your Shopify store to multiple sales channels
                        in one click
                      </Text>
                    </li>
                    <li>
                      <Text as='p' variant='bodyMd'>
                        Expanding your reach through app, marketplaces, ONDC
                        integrations and more
                      </Text>
                    </li>
                    <li>
                      <Text as='p' variant='bodyMd'>
                        Simplifying product listings and manage everything from
                        one place
                      </Text>
                    </li>
                    <li>
                      <Text as='p' variant='bodyMd'>
                        Accessing exclusive campaigns to boost visibility and
                        sales
                      </Text>
                    </li>
                  </ul>
                </div>

                <div style={{ margin: '20px 0' }}>
                  <Text as='p' variant='bodyMd'>
                    To set up your store, please complete the onboarding form.
                    This will help us understand your business better and
                    provide you with tailored solutions.
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
