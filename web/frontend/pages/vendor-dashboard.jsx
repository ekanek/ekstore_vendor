import {
  Page,
  Layout,
  LegacyCard,
  Text,
  Button,
  Tabs,
  LegacyStack,
  Icon,
  ButtonGroup,
  Spinner,
  Tag,
} from "@shopify/polaris";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
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

const ImportSettingsCard = ({ isLoadingSettings, catalogueSettings, navigate }) => {
  const settingCards = [
    {
      title: "Excluded Tags",
      icon: ProductListIcon,
      items: catalogueSettings.tags,
      color: "#4B45FF",
      gradient: "linear-gradient(135deg, #4B45FF15 0%, #6F69FF15 100%)",
      borderColor: "#4B45FF",
    },
    {
      title: "Excluded Products",
      icon: ProductIcon,
      items: catalogueSettings.products,
      color: "#00A3B1",
      gradient: "linear-gradient(135deg, #00A3B115 0%, #1AC7D615 100%)",
      borderColor: "#00A3B1",
    },
    {
      title: "Minimum MRP",
      icon: MoneyIcon,
      value: `₹${Number(catalogueSettings.min_mrp).toFixed(0)}`,
      color: "#FF6B6B",
      gradient: "linear-gradient(135deg, #FF6B6B15 0%, #FF8E8E15 100%)",
      borderColor: "#FF6B6B",
    }
  ];

  const handleEditSettings = () => {
    const shop = new URLSearchParams(window.location.search).get('shop');
    navigate(`/catalogue-settings${shop ? `?shop=${shop}` : ''}`);
  };

  return (
    <div style={{ 
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <Text variant="headingLg" as="h3">
            Import Settings
          </Text>
          <Text variant="bodySm" color="subdued">
            Configure your product import preferences
          </Text>
        </div>
        <Button 
          primary
          icon={SettingsIcon}
          onClick={handleEditSettings}
        >
          Edit Settings
        </Button>
      </div>

      {isLoadingSettings ? (
        <div style={{ 
          padding: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--p-surface-subdued)',
          borderRadius: '8px'
        }}>
          <Spinner accessibilityLabel="Loading settings" size="large" />
        </div>
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {settingCards.map((card, index) => (
            <div
              key={index}
              style={{
                background: card.gradient,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${card.borderColor}20`,
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                ':hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: `${card.color}20`,
                  padding: '8px',
                  borderRadius: '8px',
                }}>
                  <Icon
                    source={card.icon}
                    color="base"
                    style={{ color: card.color }}
                  />
                </div>
                <Text variant="headingSm" as="h4" color="subdued">
                  {card.title}
                </Text>
              </div>

              {card.items ? (
                <div style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {card.items.length > 0 ? (
                    card.items.map((item, i) => (
                      <Tag key={i} color="info">
                        {item}
                      </Tag>
                    ))
                  ) : (
                    <Text variant="bodySm" color="subdued">
                      No {card.title.toLowerCase()} configured
                    </Text>
                  )}
                </div>
              ) : (
                <Text variant="headingMd" fontWeight="bold" color="success">
                  {card.value}
                </Text>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [productCount, setProductCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogueSettings, setCatalogueSettings] = useState({
    tags: [],
    products: [],
    min_mrp: '0'
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [searchParams] = useSearchParams();
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getShopParam = useCallback(() => {
    // Try to get from URL params first
    const shopFromParams = searchParams.get('shop');
    if (shopFromParams) return shopFromParams;
    
    // Try to get from localStorage
    const shopFromStorage = localStorage.getItem('shopify-shop-domain');
    if (shopFromStorage) return shopFromStorage;
    
    // Try to extract from the referrer if available
    if (document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.hostname.includes('myshopify.com')) {
          return referrerUrl.hostname;
        }
      } catch (e) {
        console.error("Error parsing referrer URL:", e);
      }
    }
    
    // Try to get from the embedded app context
    if (window.shopify && window.shopify.config) {
      return window.shopify.config.shop;
    }
    
    // As a last resort, check if we're in an iframe and try to get from parent
    if (window.self !== window.top) {
      try {
        return window.parent.location.hostname;
      } catch (e) {
        console.error("Error accessing parent frame:", e);
      }
    }
    
    return null;
  }, [searchParams]);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        const response = await fetch('/api/products/count');
        if (!response.ok) throw new Error('Failed to fetch product count');
        const data = await response.json();
        setProductCount(data.count);
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
        if (!shopParam) {
          console.error("Shop parameter could not be determined");
          return;
        }
        
        const response = await fetch('/api/catalogue_settings', {
          headers: {
            "shop": shopParam,
            "Accept": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCatalogueSettings(prev => ({
            ...prev,
            tags: data.tags || [],
            products: data.products || [],
            min_mrp: parseFloat(data.min_mrp) || 0
          }));
        }
      } catch (error) {
        console.error("Error loading catalogue settings:", error);
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

  const tabs = [
    {
      id: 'active-campaigns',
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon source={StarIcon} color="success" />
          Active Campaigns
        </span>
      ),
      panelContent: (
        <div style={{ 
          padding: '32px',
          background: 'linear-gradient(135deg, #4B45FF08 0%, #6F69FF08 100%)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <img 
            src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            alt="No campaigns"
            style={{ 
              width: '120px',
              marginBottom: '16px'
            }}
          />
          <Text variant="headingSm" as="h3" color="subdued">
            No active campaigns available
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Text variant="bodyMd" color="subdued">
              Check back later for new campaign opportunities
            </Text>
          </div>
        </div>
      ),
    },
    {
      id: 'archived-campaigns',
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon source={ArchiveIcon} color="subdued" />
          Past Campaigns
        </span>
      ),
      panelContent: (
        <div style={{ 
          padding: '32px',
          background: 'linear-gradient(135deg, #4B45FF08 0%, #6F69FF08 100%)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <img 
            src="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            alt="No past campaigns"
            style={{ 
              width: '120px',
              marginBottom: '16px'
            }}
          />
          <Text variant="headingSm" as="h3" color="subdued">
            No past campaigns
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Text variant="bodyMd" color="subdued">
              Your completed campaigns will appear here
            </Text>
          </div>
        </div>
      ),
    },
  ];

  const cardStyles = {
    statsCard: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      padding: '24px',
    },
    statItem: {
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      },
    },
    settingsCard: {
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    quickActionsCard: {
      background: 'linear-gradient(135deg, #f5f6fd, #ffffff)',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    }
  };

  const stats = [
    {
      title: "Total Products",
      value: productCount,
      icon: ProductIcon,
      color: "#4B45FF",
      gradient: "linear-gradient(135deg, #4B45FF 0%, #6F69FF 100%)",
    },
    {
      title: "Active Campaigns",
      value: "0",
      icon: StarIcon,
      color: "#00A3B1",
      gradient: "linear-gradient(135deg, #00A3B1 0%, #1AC7D6 100%)",
    },
    {
      title: "Total Revenue",
      value: "₹0",
      icon: TransactionIcon,
      color: "#FF6B6B",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    }
  ];

  const quickActionStyles = {
    trigger: {
      position: 'relative',
      zIndex: 50
    },
    dropdown: {
      position: 'absolute',
      right: 0,
      top: 'calc(100% + 8px)',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '8px',
      width: '280px',
      zIndex: 49,
      animation: 'dropdownFade 0.2s ease-out',
      border: '1px solid var(--p-border-subdued)'
    },
    actionButton: {
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      color: 'var(--p-text)',
      '&:hover': {
        background: 'var(--p-surface-selected)',
      }
    }
  };

  return (
    <Page backgroundColor="surface-secondary">
      <div style={{ 
        marginBottom: '32px',
        background: 'white',
        margin: '1rem -2rem 2rem -2rem',
        padding: '2rem',
        position: 'relative',
        borderBottom: '1px solid var(--p-border-subdued)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        borderRadius: '16px',
        borderLeft: '1px solid var(--p-border-subdued)',
        borderRight: '1px solid var(--p-border-subdued)',
        borderTop: '1px solid var(--p-border-subdued)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <Text variant="heading3xl" as="h1" fontWeight="bold" style={{
                fontSize: '2.5rem',
                letterSpacing: '-0.02em',
                color: '#202223'
              }}>
                Ekstore Vendor Dashboard
              </Text>
              <span style={{
                background: '#F4F6F8',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.875rem',
                color: '#687176',
                fontWeight: '500'
              }}>
                Beta
              </span>
            </div>
            <Text variant="bodySm" as="p" style={{
              color: '#6D7175',
              maxWidth: '600px'
            }}>
              Manage your products, track campaigns, and grow your business with Ekstore
            </Text>
          </div>

          <div style={{
            position: 'relative',
            zIndex: 1000 // Ensure dropdown is always on top
          }}>
            <Button 
              onClick={() => setShowQuickActions(!showQuickActions)}
              primary
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon source={SettingsIcon} color="base" />
                Quick Actions
              </span>
            </Button>
            {showQuickActions && (
              <>
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                  onClick={() => setShowQuickActions(false)}
                />
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  padding: '8px',
                  width: '280px',
                  zIndex: 1000,
                  border: '1px solid var(--p-border-subdued)'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <button 
                      onClick={() => {
                        navigate('/campaigns');
                        setShowQuickActions(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s ease',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        ':hover': {
                          backgroundColor: 'var(--p-surface-selected)'
                        }
                      }}
                    >
                      <Icon source={StarIcon} color="success" />
                      <Text variant="bodyMd" as="span">
                        View Available Campaigns
                      </Text>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/analytics');
                        setShowQuickActions(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s ease',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        ':hover': {
                          backgroundColor: 'var(--p-surface-selected)'
                        }
                      }}
                    >
                      <Icon source={TransactionIcon} color="info" />
                      <Text variant="bodyMd" as="span">
                        Campaign Analytics
                      </Text>
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/support');
                        setShowQuickActions(false);
                      }}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        borderRadius: '8px',
                        transition: 'background-color 0.2s ease',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        ':hover': {
                          backgroundColor: 'var(--p-surface-selected)'
                        }
                      }}
                    >
                      <Icon source={InfoIcon} color="warning" />
                      <Text variant="bodyMd" as="span">
                        Support
                      </Text>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Layout>
        <Layout.Section>
          <div style={cardStyles.statsCard}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  background: stat.gradient,
                  borderRadius: '16px',
                  padding: '1px', // Creates border effect with gradient
                }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <Text variant="bodyMd" as="p" color="subdued">
                      {stat.title}
                    </Text>
                    <div style={{
                      background: `${stat.color}15`,
                      padding: '8px',
                      borderRadius: '8px',
                    }}>
                      <Icon
                        source={stat.icon}
                        color="base"
                        style={{ color: stat.color }}
                      />
                    </div>
                  </div>
                  
                  {stat.title === "Total Products" && isLoading ? (
                    <Spinner accessibilityLabel="Loading" size="small" />
                  ) : (
                    <Text variant="heading2xl" as="p" fontWeight="bold">
                      {stat.value}
                    </Text>
                  )}
                  
                  <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    opacity: '0.05',
                    transform: 'rotate(-15deg)',
                  }}>
                    <Icon
                      source={stat.icon}
                      color="base"
                      style={{ width: '80px', height: '80px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ImportSettingsCard 
            isLoadingSettings={isLoadingSettings}
            catalogueSettings={catalogueSettings}
            navigate={navigate}
          />

          <div style={{ 
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            marginTop: '24px'
          }}>
            <div style={{ 
              borderBottom: '1px solid var(--p-border-subdued)',
              paddingBottom: '16px',
              marginBottom: '16px'
            }}>
              <Text variant="headingLg" as="h2">
                Available Campaigns
              </Text>
            </div>
            <Tabs
              tabs={tabs}
              selected={selectedTab}
              onSelect={handleTabChange}
              fitted
            >
              <div style={{ padding: '16px 0' }}>
                {tabs[selectedTab].panelContent}
              </div>
            </Tabs>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
