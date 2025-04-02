import { BrowserRouter, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavMenu } from '@shopify/app-bridge-react';
import Routes from './Routes';

import {
  QueryProvider,
  PolarisProvider,
  VendorStatusProvider,
  VendorDashboardDetailsProvider,
  ShopifyTokenProvider,
} from './components/providers';

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager('./pages/**/!(*.test.[jt]sx)*.([jt]sx)');
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <QueryProvider>
          <ShopifyTokenProvider>
            <VendorStatusProvider>
              <VendorDashboardDetailsProvider>
                <NavMenu>
                  <Link to='/' rel='home'>
                    Home
                  </Link>
                  <Link to='/dashboard'>Dashboard</Link>
                </NavMenu>
                <Routes pages={pages} />
              </VendorDashboardDetailsProvider>
            </VendorStatusProvider>
          </ShopifyTokenProvider>
        </QueryProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
