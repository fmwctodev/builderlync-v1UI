import { Routes, Route } from 'react-router-dom';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import BillingInformationPage from './pages/BillingInformationPage';
import ContactInformationPage from './pages/ContactInformationPage';
import DashboardPage from './pages/DashboardPage';
import OrderSummaryPage from './pages/OrderSummaryPage';

export function EdgeViewModule() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<PlaceOrderPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/billing" element={<BillingInformationPage />} />
        <Route path="/contact" element={<ContactInformationPage />} />
        <Route path="/order-summary" element={<OrderSummaryPage />} />
      </Routes>
    </div>
  );
}