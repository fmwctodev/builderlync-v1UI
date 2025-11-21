import { Routes, Route } from 'react-router-dom';

function SimpleDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CRM Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p>CRM module is working! This is a simplified version.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary-50 p-4 rounded">
            <h3 className="font-semibold">Contacts</h3>
            <p className="text-2xl font-bold text-primary-600">245</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Active Jobs</h3>
            <p className="text-2xl font-bold text-green-600">12</p>
          </div>
          <div className="bg-primary-50 p-4 rounded">
            <h3 className="font-semibold">Revenue</h3>
            <p className="text-2xl font-bold text-primary-600">$24,500</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CRMModuleSimple() {
  return (
    <Routes>
      <Route path="/*" element={<SimpleDashboard />} />
    </Routes>
  );
}