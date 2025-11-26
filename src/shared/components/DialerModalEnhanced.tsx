import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Delete,
  Clock,
  Users,
  Grid3x3,
  Voicemail,
  List,
  ChevronDown,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  startCall,
  connectCall,
  endCall,
  toggleMute,
  setIncomingCall,
  setCallStatus,
} from '../store/slices/callSlice';
import { twilioService, CallEvent } from '../services/twilioService';

interface DialerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'recents' | 'contacts' | 'keypad' | 'voicemail' | 'queue';

const DialerModalEnhanced: React.FC<DialerModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const callState = useAppSelector((state) => state.call);

  const [activeTab, setActiveTab] = useState<TabType>('keypad');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [showNumberDropdown, setShowNumberDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [durationInterval, setDurationInterval] = useState<number | null>(null);

  useEffect(() => {
    const initializeTwilio = async () => {
      try {
        if (!callState.isInitialized) {
          await twilioService.initialize();

          twilioService.addEventListener(handleTwilioEvent);
        }
      } catch (error) {
        console.error('Failed to initialize Twilio:', error);
      }
    };

    if (isOpen) {
      initializeTwilio();
    }

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (callState.callStatus === 'connected' && !durationInterval) {
      const interval = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      setDurationInterval(interval);
    } else if (callState.callStatus !== 'connected' && durationInterval) {
      clearInterval(durationInterval);
      setDurationInterval(null);
      setCallDuration(0);
    }
  }, [callState.callStatus]);

  const handleTwilioEvent = (event: CallEvent) => {
    switch (event.type) {
      case 'connecting':
        dispatch(setCallStatus('connecting'));
        break;
      case 'ringing':
        dispatch(setCallStatus('ringing'));
        break;
      case 'connected':
        dispatch(connectCall());
        break;
      case 'disconnected':
        dispatch(endCall());
        setPhoneNumber('');
        break;
      case 'incoming':
        if (event.call) {
          dispatch(
            setIncomingCall({
              callSid: event.call.parameters.CallSid || '',
              from: event.call.parameters.From || '',
              contactName: undefined,
            })
          );
        }
        break;
      case 'error':
        console.error('Call error:', event.error);
        dispatch(endCall());
        break;
    }
  };

  const handleNumberClick = (digit: string) => {
    if (callState.isOnCall) {
      twilioService.sendDigits(digit);
    } else {
      setPhoneNumber((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = async () => {
    if (phoneNumber.length === 0) return;

    try {
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      const formattedNumber = cleanNumber.length === 10 ? `+1${cleanNumber}` : `+${cleanNumber}`;

      await twilioService.makeCall(formattedNumber, selectedNumber);

      dispatch(
        startCall({
          callSid: 'pending',
          phoneNumber: formattedNumber,
          direction: 'outbound',
        })
      );
    } catch (error) {
      console.error('Failed to make call:', error);
    }
  };

  const handleHangup = () => {
    twilioService.hangup();
    dispatch(endCall());
    setPhoneNumber('');
  };

  const handleMute = () => {
    const newMuteState = !callState.currentCall.isMuted;
    twilioService.mute(newMuteState);
    dispatch(toggleMute());
  };

  const handleAcceptCall = () => {
    twilioService.acceptCall();
    if (callState.incomingCall) {
      dispatch(
        startCall({
          callSid: callState.incomingCall.callSid || '',
          phoneNumber: callState.incomingCall.from || '',
          direction: 'inbound',
          contactName: callState.incomingCall.contactName || undefined,
        })
      );
      dispatch(setIncomingCall(null));
    }
  };

  const handleRejectCall = () => {
    twilioService.rejectCall();
    dispatch(setIncomingCall(null));
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {callState.isOnCall ? 'On Call' : 'Phone'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {callState.incomingCall && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Incoming Call</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {callState.incomingCall.contactName || callState.incomingCall.from}
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleRejectCall}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleAcceptCall}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            )}

            {callState.isOnCall ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {callState.callStatus === 'connecting' ? 'Connecting...' :
                   callState.callStatus === 'ringing' ? 'Ringing...' : 'Connected'}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {callState.currentCall.contactName || callState.currentCall.phoneNumber}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {formatDuration(callDuration)}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowNumberDropdown(!showNumberDropdown)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Calling From
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedNumber || 'Select a number'}
                        </div>
                      </div>
                      <ChevronDown size={20} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    value={phoneNumber ? formatPhoneNumber(phoneNumber) : ''}
                    placeholder="|"
                    readOnly
                    className="w-full text-3xl font-light text-center text-gray-900 dark:text-white bg-transparent border-none outline-none cursor-default"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {callState.isOnCall ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={handleMute}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-colors ${
                      callState.currentCall.isMuted
                        ? 'bg-red-100 dark:bg-red-900/20'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {callState.currentCall.isMuted ? (
                      <MicOff size={24} className="text-red-600 dark:text-red-400" />
                    ) : (
                      <Mic size={24} className="text-gray-700 dark:text-gray-300" />
                    )}
                    <span className="text-xs text-gray-700 dark:text-gray-300">Mute</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Grid3x3 size={24} className="text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Keypad</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Volume2 size={24} className="text-gray-700 dark:text-gray-300" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Speaker</span>
                  </button>
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleHangup}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                  >
                    <PhoneOff size={24} className="text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleNumberClick(digit)}
                      className="h-16 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-2xl font-light text-gray-900 dark:text-white"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    onClick={handleCall}
                    disabled={phoneNumber.length === 0}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-lg"
                  >
                    <Phone size={24} className="text-white" />
                  </button>

                  <button
                    onClick={handleBackspace}
                    disabled={phoneNumber.length === 0}
                    className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Delete size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {!callState.isOnCall && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-around py-3">
                <button
                  onClick={() => setActiveTab('recents')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    activeTab === 'recents'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Clock size={20} />
                  <span className="text-xs font-medium">Recents</span>
                </button>

                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    activeTab === 'contacts'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Users size={20} />
                  <span className="text-xs font-medium">Contacts</span>
                </button>

                <button
                  onClick={() => setActiveTab('keypad')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    activeTab === 'keypad'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Grid3x3 size={20} />
                  <span className="text-xs font-medium">Keypad</span>
                </button>

                <button
                  onClick={() => setActiveTab('voicemail')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    activeTab === 'voicemail'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Voicemail size={20} />
                  <span className="text-xs font-medium">Voicemail</span>
                </button>

                <button
                  onClick={() => setActiveTab('queue')}
                  className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                    activeTab === 'queue'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <List size={20} />
                  <span className="text-xs font-medium">Queue</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DialerModalEnhanced;
