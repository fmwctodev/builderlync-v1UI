import { Routes, Route } from 'react-router-dom';
import FileManager from '../pages/FileManager';
import OAuthCallback from '../components/file-manager/OAuthCallback';
import OAuthCallbackRouter from '../components/file-manager/OAuthCallbackRouter';

export default function FileManagerRoutes() {
  return (
    <Routes>
      {/* Main file manager page */}
      <Route path="/" element={<FileManager />} />
      
      {/* OAuth callback handlers */}
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      
      {/* OAuth provider-specific callbacks */}
      <Route path="/auth/google/callback" element={<OAuthCallbackRouter />} />
      <Route path="/auth/microsoft/callback" element={<OAuthCallbackRouter />} />
    </Routes>
  );
}