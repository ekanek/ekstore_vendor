import React from 'react';
import {
  Box,
  Page,
  Grid,
  LegacyCard,
  Card,
  Divider,
  Text,
  BlockStack,
  Button,
  InlineGrid,
  Icon,
} from '@shopify/polaris';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  Tooltip,
} from 'recharts';
import { DeliveryIcon } from '@shopify/polaris-icons';

// Hardcoded data
const dashBoardData = {
  total_app_sales: {
    amount: '150000',
    hourly_data: [
      { time: '00:00', sales: 5000 },
      { time: '04:00', sales: 7000 },
      { time: '08:00', sales: 10000 },
      { time: '12:00', sales: 12000 },
      { time: '16:00', sales: 9000 },
      { time: '20:00', sales: 6000 },
    ],
  },
  orders_count: {
    total: 120,
    repeat: 80,
    comparison: 15, // Percentage change
    new: 40, // New users
  },
  prepaid_share: {
    cod: 48,
    prepaid: 72,
    prepaid_percentage: 60,
    comparison: 5, // Percentage change
  },
  other_info: [
    { title: 'Average Order Value', value: '₹1250', comparison: 10 },
    { title: 'Conversion Rate', value: '3.5%', comparison: -2 },
    { title: 'Cart Abandonment', value: '25%', comparison: 8 },
  ],
  settings_detail: [
    {
      title: 'Manage Products',
      subtitle: 'Add or update your product listings',
      cta_text: 'Go to Products',
      cta_url: 'https://example.com/products',
    },
    {
      title: 'View Orders',
      subtitle: 'Check and manage your customer orders',
      cta_text: 'Go to Orders',
      cta_url: 'https://example.com/orders',
    },
    {
      title: 'Update Settings',
      subtitle: 'Configure your store settings',
      cta_text: 'Go to Settings',
      cta_url: 'https://example.com/settings',
    },
  ],
};

const RenderLineChart = ({ data }) => {
  return (
    <LineChart
      width={200}
      height={150}
      data={data}
      margin={{ top: 10, right: 0, bottom: 0, left: 0 }}
    >
      <Line type='monotone' dataKey='sales' stroke='#8884d8' />
      <CartesianGrid stroke='#ccc' strokeDasharray='5 5' />
      <XAxis dataKey='time' />
      <YAxis width={30} />
      <Tooltip />
    </LineChart>
  );
};

const COLORS = ['#0088FE', '#00C49F'];

const RenderPieChart = ({ data }) => {
  return (
    <PieChart width={150} height={150}>
      <Pie
        data={data}
        cx='60%'
        cy='60%'
        outerRadius={60}
        fill='#8884d8'
        dataKey='value'
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
};

const RenderBarChart = ({ data }) => {
  return (
    <BarChart width={162} height={162} data={data}>
      <CartesianGrid strokeDasharray='3 3' />
      <XAxis dataKey='name' />
      <YAxis
        width={40}
        label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
        domain={[0, 'dataMax + 10']}
      />
      <Legend height={16} align='right' />
      <Bar
        dataKey='COD'
        fill='#8884d8'
        name='COD'
        label={{ position: 'top' }}
      />
      <Bar
        dataKey='Prepaid'
        fill='#82ca9d'
        name='Prepaid'
        label={{ position: 'top' }}
      />
    </BarChart>
  );
};

export default function AdditionalPage() {
  const { amount, hourly_data } = dashBoardData.total_app_sales;

  const {
    total,
    repeat,
    comparison,
    new: newUsers,
  } = dashBoardData.orders_count;

  const {
    cod,
    prepaid,
    prepaid_percentage,
    comparison: prePaid,
  } = dashBoardData.prepaid_share;

  const dataPieChart = [
    { name: 'New ', value: newUsers },
    { name: 'Old ', value: repeat },
  ];

  const dataBarChart = [
    {
      COD: cod,
      Prepaid: prepaid,
    },
  ];

  return (
    <Page>
      <Text variant='headingXl' as='h4'>
        Welcome to Ekstore
      </Text>
      <p
        style={{
          fontSize: 12,
          fontWeight: 450,
          color: 'grey',
          marginLeft: 2,
          marginBottom: 24,
        }}
      >
        Ekstore enables you to seamlessly create and manage your e-commerce
        apps. It integrates with Shopify, offering solutions for payments,
        customer relationship management (CRM), and supply chain management.
        Ekstore helps you streamline your operations and scale your e-commerce
        presence with ease.
      </p>
      <Text variant='headingLg' as='h5'>
        Analytics Dashboard
      </Text>
      <Box paddingBlockEnd='500' paddingBlockStart='500'>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
            <LegacyCard title='Total App sales' sectioned>
              <div style={{ display: 'flex' }}>
                <p style={{ fontWeight: 'bold', marginBottom: 22 }}>
                  ₹{amount}
                </p>
                {comparison != null && comparison !== '' && (
                  <p
                    style={{
                      fontSize: 10,
                      marginLeft: 12,
                      fontWeight: 'bold',
                      color: comparison < 0 ? 'red' : '#009951',
                    }}
                  >
                    {comparison < 0 ? '↘' : '↗'} {comparison}%
                  </p>
                )}
              </div>
              <div>
                <RenderLineChart data={hourly_data} />
              </div>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
            <LegacyCard title='Total Orders' sectioned>
              <div style={{ display: 'flex' }}>
                <Text fontWeight='semibold'>{total}</Text>
                {comparison != null && comparison !== '' && (
                  <p
                    style={{
                      fontSize: 10,
                      marginLeft: 12,
                      fontWeight: 'bold',
                      color: comparison < 0 ? 'red' : '#009951',
                    }}
                  >
                    {comparison < 0 ? '↘' : '↗'} {comparison}%
                  </p>
                )}
              </div>
              <div style={{ height: 195, marginTop: -24 }}>
                <RenderPieChart data={dataPieChart} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 24,
                  }}
                >
                  <Text>
                    <span style={{ color: '#0088FE' }}>■</span> New Users
                  </Text>
                  <Text style={{ marginLeft: '20px' }}>
                    <span style={{ color: '#00C49F' }}>■</span> Repeat Users
                  </Text>
                </div>
              </div>
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
            <LegacyCard title='Prepaid share' sectioned>
              <div style={{ display: 'flex' }}>
                <p style={{ fontWeight: '700', marginBottom: 8 }}>
                  {prepaid_percentage}%
                </p>
                {prePaid != null && prePaid !== '' && (
                  <p
                    style={{
                      fontSize: 10,
                      marginLeft: 12,
                      fontWeight: 'bold',
                      color: prePaid < 0 ? 'red' : '#009951',
                    }}
                  >
                    {prePaid < 0 ? '↘' : '↗'} {prePaid}%
                  </p>
                )}
              </div>
              <RenderBarChart data={dataBarChart} />
            </LegacyCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
            <LegacyCard sectioned>
              <div style={{ height: 217, marginTop: -12 }}>
                {dashBoardData.other_info.map(
                  ({ title, value, comparison }, index) => (
                    <div key={index}>
                      <p style={{ fontWeight: 'bold', marginTop: 12 }}>
                        {title}
                      </p>
                      <div style={{ display: 'flex' }}>
                        <p style={{ fontWeight: '500', marginTop: 12 }}>
                          {value}
                        </p>
                        {comparison != null && comparison !== '' && (
                          <p
                            style={{
                              fontSize: 10,
                              marginTop: 12,
                              marginLeft: 12,
                              fontWeight: 'bold',
                              color: comparison < 0 ? 'red' : '#009951',
                            }}
                          >
                            {comparison < 0 ? '↘' : '↗'} {comparison}%
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </LegacyCard>
          </Grid.Cell>
        </Grid>
      </Box>
      <div style={{ paddingBottom: 8 }}>
        <Text variant='headingLg' as='h5'>
          Analytics Dashboard
        </Text>
      </div>
      <Card roundedAbove='sm'>
        <BlockStack gap='200'>
          {dashBoardData.settings_detail.map((setting, index) => (
            <React.Fragment key={index}>
              <InlineGrid columns='auto 1fr auto' alignItems='center'>
                <div style={{ paddingRight: 12 }}>
                  <Icon source={DeliveryIcon} tone='base' />
                </div>
                <BlockStack>
                  <Text as='h2' variant='headingSm'>
                    {setting.title}
                  </Text>
                  <Text as='p' tone='subdued'>
                    {setting.subtitle}
                  </Text>
                </BlockStack>
                <Button
                  onClick={() => window.open(setting.cta_url, '_blank')}
                  accessibilityLabel={setting.cta_text}
                >
                  {setting.cta_text}
                </Button>
              </InlineGrid>
              {index < dashBoardData.settings_detail.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </BlockStack>
      </Card>
    </Page>
  );
}
