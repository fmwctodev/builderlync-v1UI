import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import BlankPage from './pages/BlankPage';
import Measurements from './pages/Measurements';
import Proposals from './pages/Proposals';
import MaterialOrders from './pages/MaterialOrders';
import Calendars from './pages/Calendars';
import Jobs from './pages/Jobs';
import Payments from './pages/Payments';
import InstantEstimator from './pages/InstantEstimator';
import Conversations from './pages/Conversations';
import { AIAgentsModule } from '../ai-agents/AIAgentsModule';
import Contacts from './pages/Contacts';
import WorkOrders from './pages/WorkOrders';
import Automations from './pages/Automations';
import Opportunities from './pages/Opportunities';
import FileManager from './pages/FileManager';
import Reputation from './pages/Reputation';

export function RoofRunnerModule() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="conversations" element={<Conversations />} />
        <Route path="calendars" element={<Calendars />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="payments" element={<Payments />} />
        <Route path="ai-agents/*" element={<AIAgentsModule />} />
        <Route path="job-cam" element={<BlankPage title="Job Cam" />} />
        <Route path="instant-estimator" element={<InstantEstimator />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="material-orders" element={<MaterialOrders />} />
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="automation" element={<Automations />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="marketing" element={<BlankPage title="Marketing" />} />
        <Route path="file-manager" element={<FileManager />} />
        <Route path="reputation" element={<Reputation />} />
        <Route path="reporting" element={<BlankPage title="Reporting" />} />
        {/* <Route path="sites" element={<BlankPage title="Sites" />} /> */}
        <Route path="support" element={<BlankPage title="Support" />} />
        <Route path="settings" element={<BlankPage title="Settings" />} />
      </Route>
    </Routes>
  );
}