import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-[#111111] border border-gray-800 rounded-3xl shadow-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 rounded-full">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Payment Cancelled</h1>
          <p className="text-gray-400 text-lg">
            No worries! Your payment was cancelled and no charges were made. You can try again whenever you're ready.
          </p>
        </div>

        <button 
          onClick={() => navigate('/billing')}
          className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Plans
        </button>

        <p className="text-gray-500 text-sm">
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  );
};

export default Cancel;
