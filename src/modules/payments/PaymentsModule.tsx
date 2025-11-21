import { Routes, Route } from 'react-router-dom';
import PaymentsLayout from './components/PaymentsLayout';
import GetStarted from './pages/GetStarted';
import AllPayments from './pages/AllPayments';
import InvoicesEstimates from './pages/InvoicesEstimates';
import DocumentsContracts from './pages/DocumentsContracts';
import Transactions from './pages/Transactions';
import Coupons from './pages/Coupons';
import PaymentsSettings from './pages/PaymentsSettings';
import Integrations from './pages/Integrations';

export function PaymentsModule() {
  return (
    <Routes>
      <Route element={<PaymentsLayout />}>
        <Route index element={<GetStarted />} />
        <Route path="get-started" element={<GetStarted />} />
        <Route path="all-payments" element={<AllPayments />} />
        <Route path="invoices" element={<InvoicesEstimates />} />
        <Route path="documents" element={<DocumentsContracts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="settings" element={<PaymentsSettings />} />
        <Route path="integrations" element={<Integrations />} />
      </Route>
    </Routes>
  );
}
