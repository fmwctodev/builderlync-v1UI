import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ProductCatalog from './pages/ProductCatalog';
import BranchLocator from './pages/BranchLocator';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import AccountSettings from './pages/AccountSettings';
import Notifications from './pages/Notifications';

export function ABCSupplyModule() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/*" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductCatalog />} />
              <Route path="branches" element={<BranchLocator />} />
              <Route path="cart" element={<Cart />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}