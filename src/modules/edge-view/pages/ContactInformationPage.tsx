import React from 'react';
import Header from '../components/Header';
import { User } from 'lucide-react';

const ContactInformationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Contact Information</h1>
          <p className="text-gray-600">Update your contact details and preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Details</h3>
          <p className="text-gray-500">Manage your contact information and communication preferences</p>
        </div>
      </main>
    </div>
  );
};

export default ContactInformationPage;