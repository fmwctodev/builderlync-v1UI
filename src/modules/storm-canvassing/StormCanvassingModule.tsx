import { Routes, Route, Navigate } from 'react-router-dom';
import { StormMapPage } from './pages/StormMapPage';
import { TurfsPage } from './pages/TurfsPage';
import { CanvassLeadsPage } from './pages/CanvassLeadsPage';
import { CanvassSettingsPage } from './pages/CanvassSettingsPage';
import { StormEventsPage } from './pages/StormEventsPage';
import { StormEventDetailPage } from './pages/StormEventDetailPage';
import { DoorDetailPage } from './pages/DoorDetailPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';

export function StormCanvassingModule() {
  return (
    <Routes>
      <Route index element={<StormMapPage />} />
      <Route path="turfs" element={<TurfsPage />} />
      <Route path="events" element={<StormEventsPage />} />
      <Route path="events/:eventId" element={<StormEventDetailPage />} />
      <Route path="doors/:doorId" element={<DoorDetailPage />} />
      <Route path="leads" element={<CanvassLeadsPage />} />
      <Route path="manager" element={<ManagerDashboardPage />} />
      <Route path="settings" element={<CanvassSettingsPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}

export default StormCanvassingModule;
