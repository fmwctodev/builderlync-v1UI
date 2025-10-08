import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import JobCam from './pages/JobCam';
import InstantEstimator from './pages/InstantEstimator';
import Measurements from './pages/Measurements';
import Proposals from './pages/Proposals';
import MaterialOrders from './pages/MaterialOrders';
import Settings from './pages/Settings';

export function ProjectManagementModule() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/*" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="job-cam" element={<JobCam />} />
          <Route path="instant-estimator" element={<InstantEstimator />} />
          <Route path="measurements" element={<Measurements />} />
          <Route path="proposals" element={<Proposals />} />
          <Route path="material-orders" element={<MaterialOrders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}