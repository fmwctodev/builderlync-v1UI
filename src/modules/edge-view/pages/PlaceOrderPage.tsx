import React, { useState } from 'react';
import Header from '../components/Header';
import { Eye } from 'lucide-react';

const PlaceOrderPage: React.FC = () => {
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Place Measurement Order</h1>
          <p className="text-gray-600">Enter property details and select measurement products</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Property Measurement Orders</h3>
          <p className="text-gray-500">Create and manage property measurement orders</p>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter property address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            
            <button className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Continue Order
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlaceOrderPage;