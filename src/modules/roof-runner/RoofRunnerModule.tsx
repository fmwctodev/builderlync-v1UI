import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import BlankPage from './pages/BlankPage';
import JobCam from './pages/JobCam';
import Measurements from './pages/Measurements';
import Proposals from './pages/Proposals';
import MaterialOrders from './pages/MaterialOrders';
import Calendars from './pages/Calendars';
import Jobs from './pages/Jobs';
import Payments from './pages/Payments';
import InstantEstimator from './pages/InstantEstimator';
import InstantEstimatorManage from './pages/InstantEstimatorManage';
import ManageQuestions from './pages/ManageQuestions';
import NewMaterial from './pages/NewMaterial';
import Conversations from './pages/Conversations';
import { AIAgentsModule } from '../ai-agents/AIAgentsModule';
import Contacts from './pages/Contacts';
import ContactProfile from './pages/ContactProfile';
import WorkOrders from './pages/WorkOrders';
import Automations from './pages/Automations';
import Opportunities from './pages/Opportunities';
import FileManager from './pages/FileManager';
import Reputation from './pages/Reputation';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';
import Support from './pages/Support';
import QuickBooksCallback from './pages/QuickBooksCallback';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import { ProtectedRoute } from '../../shared/components/ProtectedRoute';
import { AuthRoute } from '../../shared/components/AuthRoute';

export function RoofRunnerModule() {
  return (
    <Provider store={store}>
      <Routes>
      <Route path="auth/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="auth/signup" element={<AuthRoute><Signup /></AuthRoute>} />
      <Route path="auth/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />

        <Route path="conversations" element={<Conversations />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactProfile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="ai-agents/*" element={<AIAgentsModule />} />
        <Route path="job-cam" element={<JobCam />} />
        <Route path="instant-estimator" element={<InstantEstimator />} />
        <Route path="instant-estimator/:id/manage" element={<InstantEstimatorManage />} />
        <Route path="instant-estimator/:id/manage/questions" element={<ManageQuestions />} />
        <Route path="instant-estimator/:id/manage/materials/new" element={<NewMaterial />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="material-orders" element={<MaterialOrders />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="automation" element={<Automations />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="file-manager" element={<FileManager />} />
        <Route path="reputation" element={<Reputation />} />
        <Route path="reporting" element={<BlankPage title="Reporting" />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
        <Route path="quickbooks/callback" element={<QuickBooksCallback />} />
      </Route>
      </Routes>
    </Provider>
  );
}