import React from 'react';
import { ArrowLeft, Clock, Edit, FileText, Calendar, DollarSign, Briefcase } from 'lucide-react';

interface ContactHeaderProps {
  contactName: string;
  onBack: () => void;
  onCreateJob?: () => void;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({ contactName, onBack, onCreateJob }) => {
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
          <button 
            onClick={onCreateJob}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactHeader;