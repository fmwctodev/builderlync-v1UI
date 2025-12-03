import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CallState {
  isInitialized: boolean;
  isOnCall: boolean;
  callStatus: 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected';
  currentCall: {
    callSid: string | null;
    direction: 'inbound' | 'outbound' | null;
    phoneNumber: string | null;
    contactName: string | null;
    startTime: string | null;
    duration: number;
    isMuted: boolean;
    isRecording: boolean;
  };
  incomingCall: {
    callSid: string | null;
    from: string | null;
    contactName: string | null;
  } | null;
  recentCalls: Array<{
    id: string;
    phoneNumber: string;
    contactName: string | null;
    direction: 'inbound' | 'outbound';
    status: string;
    duration: number;
    timestamp: string;
  }>;
  error: string | null;
}

const initialState: CallState = {
  isInitialized: false,
  isOnCall: false,
  callStatus: 'idle',
  currentCall: {
    callSid: null,
    direction: null,
    phoneNumber: null,
    contactName: null,
    startTime: null,
    duration: 0,
    isMuted: false,
    isRecording: false,
  },
  incomingCall: null,
  recentCalls: [],
  error: null,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setInitialized(state, action: PayloadAction<boolean>) {
      state.isInitialized = action.payload;
    },
    setCallStatus(state, action: PayloadAction<CallState['callStatus']>) {
      state.callStatus = action.payload;
    },
    startCall(
      state,
      action: PayloadAction<{
        callSid: string;
        phoneNumber: string;
        direction: 'inbound' | 'outbound';
        contactName?: string;
      }>
    ) {
      state.isOnCall = true;
      state.callStatus = 'connecting';
      state.currentCall = {
        callSid: action.payload.callSid,
        direction: action.payload.direction,
        phoneNumber: action.payload.phoneNumber,
        contactName: action.payload.contactName || null,
        startTime: new Date().toISOString(),
        duration: 0,
        isMuted: false,
        isRecording: false,
      };
    },
    connectCall(state) {
      state.callStatus = 'connected';
    },
    updateCallDuration(state, action: PayloadAction<number>) {
      state.currentCall.duration = action.payload;
    },
    toggleMute(state) {
      state.currentCall.isMuted = !state.currentCall.isMuted;
    },
    toggleRecording(state) {
      state.currentCall.isRecording = !state.currentCall.isRecording;
    },
    endCall(state) {
      if (state.currentCall.callSid) {
        state.recentCalls.unshift({
          id: state.currentCall.callSid,
          phoneNumber: state.currentCall.phoneNumber || '',
          contactName: state.currentCall.contactName,
          direction: state.currentCall.direction || 'outbound',
          status: 'completed',
          duration: state.currentCall.duration,
          timestamp: state.currentCall.startTime || new Date().toISOString(),
        });
        if (state.recentCalls.length > 50) {
          state.recentCalls.pop();
        }
      }
      state.isOnCall = false;
      state.callStatus = 'idle';
      state.currentCall = initialState.currentCall;
      state.incomingCall = null;
    },
    setIncomingCall(
      state,
      action: PayloadAction<{
        callSid: string;
        from: string;
        contactName?: string;
      } | null>
    ) {
      state.incomingCall = action.payload
        ? {
            callSid: action.payload.callSid,
            from: action.payload.from,
            contactName: action.payload.contactName || null,
          }
        : null;
    },
    setRecentCalls(state, action: PayloadAction<CallState['recentCalls']>) {
      state.recentCalls = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetCallState(state) {
      return initialState;
    },
  },
});

export const {
  setInitialized,
  setCallStatus,
  startCall,
  connectCall,
  updateCallDuration,
  toggleMute,
  toggleRecording,
  endCall,
  setIncomingCall,
  setRecentCalls,
  setError,
  resetCallState,
} = callSlice.actions;

export default callSlice.reducer;
