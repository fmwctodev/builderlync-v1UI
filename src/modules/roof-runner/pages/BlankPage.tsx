import React from 'react';

interface BlankPageProps {
  title: string;
}

const BlankPage: React.FC<BlankPageProps> = ({ title }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">This feature is coming soon</p>
      </div>
    </div>
  );
};

export default BlankPage;