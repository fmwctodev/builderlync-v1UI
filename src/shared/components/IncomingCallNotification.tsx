import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { startCall, setIncomingCall } from '../store/slices/callSlice';
import { twilioService } from '../services/twilioService';

const IncomingCallNotification: React.FC = () => {
  const dispatch = useAppDispatch();
  const incomingCall = useAppSelector((state) => state.call.incomingCall);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (incomingCall) {
      setIsRinging(true);
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch((err) => console.error('Failed to play ringtone:', err));

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [incomingCall]);

  const handleAccept = () => {
    if (incomingCall) {
      twilioService.acceptCall();
      dispatch(
        startCall({
          callSid: incomingCall.callSid,
          phoneNumber: incomingCall.from,
          direction: 'inbound',
          contactName: incomingCall.contactName || undefined,
        })
      );
      dispatch(setIncomingCall(null));
    }
  };

  const handleReject = () => {
    twilioService.rejectCall();
    dispatch(setIncomingCall(null));
    setIsRinging(false);
  };

  if (!incomingCall) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-green-500 dark:border-green-600 animate-bounce">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full bg-green-500 flex items-center justify-center ${isRinging ? 'animate-pulse' : ''}`}>
            <Phone size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Incoming Call
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {incomingCall.contactName || incomingCall.from}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            <PhoneOff size={18} />
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            <Phone size={18} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
