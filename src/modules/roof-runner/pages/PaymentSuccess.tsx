import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-12 bg-[#111111] border border-gray-800 rounded-3xl shadow-2xl">
        <div className="flex justify-center">
          <div className="p-4 bg-green-500/10 rounded-full">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Payment Successful!</h1>
          <p className="text-gray-400 text-lg">
            Welcome to BuilderLync. Your account has been upgraded and you're ready to start winning jobs.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-gray-500 text-sm">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
};

export default Success;
