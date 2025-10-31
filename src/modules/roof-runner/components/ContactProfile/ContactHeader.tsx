import React from 'react';
import { ArrowLeft, Clock, Edit, FileText, Calendar, DollarSign } from 'lucide-react';

interface ContactHeaderProps {
  contactName: string;
  onBack: () => void;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({ contactName, onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {contactName}
          </h1>
          {/* <span className="text-sm text-gray-500">1 of 808 selected</span> */}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Clock className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <FileText className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Calendar className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <DollarSign className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;