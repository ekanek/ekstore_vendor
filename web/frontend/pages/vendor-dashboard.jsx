import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Page,
  Layout,
  Tabs,
  Text,
  Button,
  Icon,
  Spinner,
  Tag,
  BlockStack,
  Card,
  InlineGrid,
  EmptyState,
  Popover,
  ChoiceList,
  ActionList,
} from '@shopify/polaris';
import {
  SettingsIcon,
  ProductIcon,
  ArchiveIcon,
  StarIcon,
  ProductListIcon,
  TransactionIcon,
  MoneyIcon,
  InfoIcon,
} from '@shopify/polaris-icons';
import { useVendorDashboardDetails } from '../components/providers/VendorDashboardDetailsProvider';

// Constants
const STATS_CONFIG = [
  {
    title: 'Total Products',
    value: null,
    icon: ProductIcon,
    color: '#4B45FF',
    gradient: 'linear-gradient(135deg, #4B45FF 0%, #6F69FF 100%)',
  },
  {
    title: 'Active Campaigns',
    value: '0',
    icon: StarIcon,
    color: '#00A3B1',
    gradient: 'linear-gradient(135deg, #00A3B1 0%, #1AC7D6 100%)',
  },
  {
    title: 'Total Revenue',
    value: '₹0',
    icon: TransactionIcon,
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
  },
];

const SETTINGS_CONFIG = [
  {
    title: 'Excluded Tags',
    icon: ProductListIcon,
    key: 'tags',
    color: '#4B45FF',
    gradient: 'linear-gradient(135deg, #4B45FF15 0%, #6F69FF15 100%)',
    borderColor: '#4B45FF',
  },
  {
    title: 'Excluded Products',
    icon: ProductIcon,
    key: 'products',
    color: '#00A3B1',
    gradient: 'linear-gradient(135deg, #00A3B115 0%, #1AC7D615 100%)',
    borderColor: '#00A3B1',
  },
  {
    title: 'Minimum MRP',
    icon: MoneyIcon,
    key: 'min_mrp',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B15 0%, #FF8E8E15 100%)',
    borderColor: '#FF6B6B',
  },
];

// Tab Content Component
const TabContent = ({ icon, label, color }) => (
  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <Icon source={icon} tone={color} />
    {label}
  </span>
);

// Tabs Configuration
const TAB_CONFIG = [
  {
    id: 'active-campaigns',
    content: (
      <TabContent icon={StarIcon} label='Active Campaigns' color='success' />
    ),
    panelContent: (
      <EmptyState
        image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
        heading='No active campaigns available'
      >
        <Text as='p' variant='bodyMd' tone='subdued'>
          Check back later for new campaign opportunities
        </Text>
      </EmptyState>
    ),
  },
  {
    id: 'archived-campaigns',
    content: (
      <TabContent icon={ArchiveIcon} label='Past Campaigns' color='subdued' />
    ),
    panelContent: (
      <EmptyState
        image='https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png'
        heading='No past campaigns'
      >
        <Text as='p' variant='bodyMd' tone='subdued'>
          Your completed campaigns will appear here
        </Text>
      </EmptyState>
    ),
  },
];

// Stats Section Component
const StatsSection = ({ stats, isLoading }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      padding: '24px',
    }}
  >
    {stats.map((stat, index) => (
      <div
        key={index}
        style={{
          background: stat.gradient,
          borderRadius: '16px',
          padding: '1px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '15px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant='bodyMd' as='p' tone='subdued'>
              {stat.title}
            </Text>
            <div
              style={{
                background: `${stat.color}15`,
                padding: '8px',
                borderRadius: '8px',
              }}
            >
              <Icon source={stat.icon} style={{ color: stat.color }} />
            </div>
          </div>
          {stat.title === 'Total Products' && isLoading ? (
            <Spinner accessibilityLabel='Loading' size='small' />
          ) : (
            <Text variant='heading2xl' as='p' fontWeight='bold'>
              {stat.value}
            </Text>
          )}
          <div
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              opacity: '0.05',
              transform: 'rotate(-15deg)',
            }}
          >
            <Icon
              source={stat.icon}
              style={{ width: '80px', height: '80px' }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Import Settings Card Component
const ImportSettingsCard = ({
  isLoadingSettings,
  catalogueSettings,
  navigate,
}) => {
  const handleEditSettings = () => {
    const shop = new URLSearchParams(window.location.search).get('shop');
    navigate(`/catalogue-settings${shop ? `?shop=${shop}` : ''}`);
  };

  return (
    <Card roundedAbove='sm'>
      <BlockStack gap='400'>
        <BlockStack gap='200'>
          <InlineGrid columns='1fr auto'>
            <Text as='h2' variant='headingLg'>
              Import Settings
            </Text>
            <Button
              variant='primary'
              icon={SettingsIcon}
              onClick={handleEditSettings}
            >
              Edit Settings
            </Button>
          </InlineGrid>
          <Text as='p' variant='bodySm' tone='subdued'>
            Configure your product import preferences
          </Text>
        </BlockStack>

        {isLoadingSettings ? (
          <div
            style={{
              padding: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'var(--p-surface-subdued)',
              borderRadius: '8px',
            }}
          >
            <Spinner accessibilityLabel='Loading settings' size='large' />
          </div>
        ) : (
          <InlineGrid columns={{ xs: 1, sm: 2, md: 3 }} gap='400'>
            {SETTINGS_CONFIG.map((card, index) => (
              <div
                key={index}
                style={{
                  background: card.gradient,
                  borderRadius: '12px',
                  padding: '16px',
                  border: `1px solid ${card.borderColor}20`,
                }}
              >
                <BlockStack gap='200'>
                  <InlineGrid columns='auto 1fr' gap='200'>
                    <div
                      style={{
                        background: `${card.color}20`,
                        padding: '8px',
                        borderRadius: '8px',
                      }}
                    >
                      <Icon source={card.icon} tone='base' />
                    </div>
                    <Text variant='headingSm' as='h3' tone='subdued'>
                      {card.title}
                    </Text>
                  </InlineGrid>
                  {card.key !== 'min_mrp' ? (
                    <BlockStack gap='200'>
                      {catalogueSettings[card.key].length > 0 ? (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                          }}
                        >
                          {catalogueSettings[card.key].map((item, i) => (
                            <Tag key={i}>{item}</Tag>
                          ))}
                        </div>
                      ) : (
                        <Text variant='bodySm' tone='subdued'>
                          No {card.title.toLowerCase()} configured
                        </Text>
                      )}
                    </BlockStack>
                  ) : (
                    <Text variant='headingMd' fontWeight='bold' tone='success'>
                      ₹{Number(catalogueSettings[card.key]).toFixed(0)}
                    </Text>
                  )}
                </BlockStack>
              </div>
            ))}
          </InlineGrid>
        )}
      </BlockStack>
    </Card>
  );
};

// Quick Actions Component
const QuickActions = ({ isOpen, onToggle, navigate }) => {
  const actions = [
    {
      icon: StarIcon,
      label: 'View Available Campaigns',
      path: '/campaigns',
      color: 'success',
    },
    {
      icon: TransactionIcon,
      label: 'Campaign Analytics',
      path: '/analytics',
      color: 'info',
    },
    { icon: InfoIcon, label: 'Support', path: '/support', color: 'warning' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1000 }}>
      <Button onClick={onToggle} variant='primary'>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon source={SettingsIcon} tone='base' />
          Quick Actions
        </span>
      </Button>
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={onToggle}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              padding: '8px',
              width: '280px',
              border: '1px solid var(--p-border-subdued)',
            }}
          >
            {actions.map((action, index) => (
              <button
                key={index}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => {
                  navigate(action.path);
                  onToggle();
                }}
              >
                <Icon source={action.icon} tone={action.color} />
                <Text variant='bodyMd' as='span'>
                  {action.label}
                </Text>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
export default function VendorDashboard() {
  const navigate = useNavigate();
  const { dashboardDetails } = useVendorDashboardDetails();
  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [productCount, setProductCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogueSettings, setCatalogueSettings] = useState({
    tags: [],
    products: [],
    min_mrp: '0',
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [popoverActive, setPopoverActive] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  useEffect(() => {
    if (dashboardDetails.data?.vendor_platforms) {
      setSelectedPlatforms(dashboardDetails.data.vendor_platforms);
    }
  }, [dashboardDetails.data?.vendor_platforms]);

  // const togglePopoverActive = useCallback(
  //   () => setPopoverActive((popoverActive) => !popoverActive),
  //   [],
  // );

  // const handlePlatformChange = useCallback((value) => {
  //   setSelectedPlatforms(value);
  // }, []);

  // const platformOptions = [
  //   { label: 'Foxy', value: 'Foxy' },
  //   { label: 'Tata Neu', value: 'Tata Neu' },
  //   { label: 'ViShop', value: 'ViShop' },
  // ];

  // const activator = (
  //   <Button onClick={togglePopoverActive} disclosure>
  //     {selectedPlatforms.length > 0
  //       ? `${selectedPlatforms.join(', ')}`
  //       : 'Select sales platforms'}
  //   </Button>
  // );

  const platformOptions =
    dashboardDetails.data?.available_platforms.map((platform) => ({
      label: platform
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      value: platform,
    })) || [];

  const togglePopoverActive = useCallback(() => {
    setPopoverActive((prev) => !prev);
  }, []);

  const handlePlatformChange = useCallback(
    async (value) => {
      setSelectedPlatforms(value);
      console.log('Selected platforms for API call:', value);

      try {
        const API_BASE_URL =
          'https://orientation-destiny-gs-four.trycloudflare.com';
        const response = await fetch(
          `${API_BASE_URL}/shopify_sales_channel/ekstore_registered_vendors/update_vendor_sales_channels`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              shop: dashboardDetails?.shop,
            },
            body: JSON.stringify({
              platforms: value,
            }),
          },
        );

        if (response.ok) {
          console.log('Platforms successfully updated');
        }
      } catch (error) {
        console.log('Error making platform selection API call:', error);
      }
    },
    [dashboardDetails?.shop],
  );

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      {selectedPlatforms.length > 0
        ? `${selectedPlatforms
            .map((platform) =>
              platform
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
            )
            .join(', ')}`
        : 'Select sales platforms'}
    </Button>
  );

  const getShopParam = useCallback(() => {
    const sources = [
      searchParams.get('shop'),
      localStorage.getItem('shopify-shop-domain'),
      document.referrer ? new URL(document.referrer).hostname : null,
      window.shopify?.config?.shop,
      window.self !== window.top ? window.parent.location.hostname : null,
    ];
    return (
      sources.find((source) => source && source.includes('myshopify.com')) ||
      null
    );
  }, [searchParams]);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await fetch('/api/products/count');
        if (!response.ok) throw new Error('Failed to fetch product count');
        const { count } = await response.json();
        setProductCount(count);
      } catch (error) {
        console.error('Error fetching product count:', error);
        setProductCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductCount();
  }, []);

  useEffect(() => {
    const loadCatalogueSettings = async () => {
      try {
        const shopParam = getShopParam();
        if (!shopParam)
          throw new Error('Shop parameter could not be determined');
        const response = await fetch('/api/catalogue_settings', {
          headers: { shop: shopParam, Accept: 'application/json' },
        });
        if (!response.ok)
          throw new Error(`Server responded with ${response.status}`);
        const { success, tags, products, min_mrp } = await response.json();
        if (success) {
          setCatalogueSettings({
            tags: tags || [],
            products: products || [],
            min_mrp: parseFloat(min_mrp) || 0,
          });
        }
      } catch (error) {
        console.error('Error loading catalogue settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadCatalogueSettings();
  }, [getShopParam]);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTab(selectedTabIndex),
    [],
  );

  const stats = STATS_CONFIG.map((stat) => ({
    ...stat,
    value: stat.title === 'Total Products' ? productCount : stat.value,
  }));

  return (
    <Page backgroundColor='surface-secondary'>
      <Card roundedAbove='sm'>
        <BlockStack gap='200'>
          <InlineGrid columns='1fr auto'>
            <BlockStack gap='200'>
              <Text as='h1' variant='heading2xl'>
                Ekstore Vendor Dashboard
              </Text>
              <Text as='p' variant='bodyMd'>
                Manage your products, track campaigns, and grow your business
                with Ekstore
              </Text>
            </BlockStack>
            <BlockStack gap='200'>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Text as='p' variant='bodyMd' fontWeight='medium'>
                  Select sales platforms
                </Text>
                <Popover
                  active={popoverActive}
                  activator={activator}
                  onClose={togglePopoverActive}
                  preferredAlignment='right'
                >
                  <div style={{ padding: '16px', width: '200px' }}>
                    <ChoiceList
                      allowMultiple
                      choices={platformOptions}
                      selected={selectedPlatforms}
                      onChange={handlePlatformChange}
                    />
                  </div>
                </Popover>
              </div>
              <QuickActions
                isOpen={showQuickActions}
                onToggle={() => setShowQuickActions(!showQuickActions)}
                navigate={navigate}
              />
            </BlockStack>
          </InlineGrid>
        </BlockStack>
      </Card>

      <Layout>
        <Layout.Section>
          <BlockStack gap='400'>
            <StatsSection stats={stats} isLoading={isLoading} />
            <ImportSettingsCard
              isLoadingSettings={isLoadingSettings}
              catalogueSettings={catalogueSettings}
              navigate={navigate}
            />
            <Card roundedAbove='sm'>
              <BlockStack gap='400'>
                <Text as='h2' variant='headingLg'>
                  Available Campaigns
                </Text>
                <Tabs
                  tabs={TAB_CONFIG}
                  selected={selectedTab}
                  onSelect={handleTabChange}
                  fitted
                >
                  <BlockStack gap='200'>
                    {TAB_CONFIG[selectedTab].panelContent}
                  </BlockStack>
                </Tabs>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
