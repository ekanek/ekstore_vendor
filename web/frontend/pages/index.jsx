import {
  Card,
  Page,
  Layout,
  TextContainer,
  Text,
  Button,
  SkeletonBodyText,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shop = searchParams.get('shop');

  const handleOnboardingClick = () => {
    navigate(`/registration?shop=${shop}`);
  };

  return (
    <Page narrowWidth>
      <TitleBar title="Welcome to Ekstore Nexus" />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextContainer spacing="loose">
              <div style={{ textAlign: "center" }}>
                <Text as="h2" variant="headingLg">
                  Thank you for becoming a part of Ekanek Family 🎉
                </Text>
                
                <div style={{ margin: "20px 0" }}>
                  <Text as="p" variant="bodyMd">
                    Ekstore Nexus empowers your business growth by providing a unified platform
                    to showcase your products across multiple sales channels. Our integrated
                    solution streamlines your product listing process while offering exclusive
                    opportunities to participate in targeted campaigns, ultimately driving
                    increased visibility and sales performance. By leveraging our comprehensive
                    marketplace integration, you can efficiently expand your market reach and
                    optimize your business operations.
                  </Text>
                </div>

                <div style={{ margin: "20px 0" }}>
                  <Text as="p" variant="bodyMd">
                    To proceed further, we require you to complete a mandatory onboarding form
                    that will help us better understand your business requirements and provide
                    you with tailored solutions.
                  </Text>
                </div>

                <div style={{ marginTop: "32px" }}>
                  <Button primary size="large" onClick={handleOnboardingClick}>
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
