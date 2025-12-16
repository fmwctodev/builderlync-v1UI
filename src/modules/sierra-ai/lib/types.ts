export interface SierraConfig {
  id: string;
  agentStatus: 'active' | 'paused';
  businessName: string;
  channels: {
    voice: ChannelStatus;
    sms: ChannelStatus;
    webchat: ChannelStatus;
  };
  lastUpdated: string;
  hasPendingChanges: boolean;
}

export interface ChannelStatus {
  enabled: boolean;
  connected: boolean;
  status: 'connected' | 'not_connected' | 'enabled' | 'disabled';
}

export interface TwilioNumber {
  id: string;
  label: string;
  phoneNumber: string;
  channels: ('voice' | 'sms' | 'mms' | 'webchat')[];
  callHandling: 'sierra_all' | 'sierra_after_hours' | 'sierra_backup';
  missedCallRecovery: boolean;
  defaultPipeline: string;
  defaultOwner?: string;
  status: 'active' | 'inactive';
}

export interface KbCollection {
  id: string;
  name: string;
  description?: string;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KbArticle {
  id: string;
  title: string;
  collectionId: string;
  tags: string[];
  content: string;
  status: 'draft' | 'live';
  highPriority: boolean;
  allowVerbatim: boolean;
  lastUpdated: string;
  createdAt: string;
}

export interface KbQaPair {
  id: string;
  question: string;
  answer: string;
  intent: 'pricing' | 'service_area' | 'scheduling' | 'warranty' | 'insurance' | 'misc';
  priority: 'high' | 'normal' | 'low';
  canMentionRanges: boolean;
  offerBooking: boolean;
  tags: string[];
  lastUpdated: string;
  createdAt: string;
}

export interface BehaviorProfile {
  id: string;
  name: string;
  personaDescription: string;
  toneChips: string[];
  formalityLevel: 'casual' | 'neutral' | 'formal';
  useEverydayLanguage: boolean;
  operatingRules: {
    introduceWithBusinessName: boolean;
    neverMentionAI: boolean;
    captureNamePhoneService: boolean;
    attemptBooking: boolean;
    confirmDetails: boolean;
  };
  customInstructions: string;
  escalationTriggers: string[];
  escalationInstructions: { [trigger: string]: string };
  defaultEscalationTarget: string;
  forbiddenTopics: string[];
  bannedPhrases: string[];
  redirectOnForbidden: boolean;
}

export interface Conversation {
  id: string;
  dateTime: string;
  channel: 'voice' | 'sms' | 'webchat';
  direction: 'inbound' | 'outbound';
  contactName: string;
  contactPhone: string;
  jobType?: string;
  outcome: 'appointment_booked' | 'info_provided' | 'escalated' | 'spam' | 'abandoned';
  duration?: string;
  transcript: Message[];
  capturedFields: CapturedFields;
}

export interface Message {
  id: string;
  sender: 'sierra' | 'user';
  content: string;
  timestamp: string;
}

export interface CapturedFields {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  jobType?: string;
  urgency?: 'immediate' | 'soon' | 'flexible';
  leadSource?: string;
  notes?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  locationType: 'in_person' | 'virtual' | 'both';
  enabled: boolean;
  description?: string;
}

export interface BookingRules {
  minNoticeHours: number;
  maxDaysOut: number;
  maxPerDay: number;
  businessHoursOnly: boolean;
  sameDayBooking: boolean;
}

export interface AgentScript {
  greeting: {
    voice: string;
    sms: string;
  };
  identification: {
    voice: string;
    sms: string;
  };
  leadCapture: {
    namePrompt: string;
    phonePrompt: string;
    addressPrompt: string;
    servicePrompt: string;
  };
  qualifyingQuestions: QualifyingQuestion[];
  bookingPitch: string;
  closingLanguage: string;
}

export interface QualifyingQuestion {
  id: string;
  question: string;
  order: number;
  required: boolean;
}

export interface BusinessProfile {
  businessName: string;
  serviceAreas: string[];
  servicesOffered: string[];
  defaultPipeline: string;
  defaultCalendar: string;
}

export interface ActivityStats {
  callsHandled: number;
  smsChatsHandled: number;
  appointmentsBooked: number;
  date: string;
}

export interface WidgetConfig {
  title: string;
  welcomeMessage: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  enabled: boolean;
}

export interface CalendarConnection {
  id: string;
  provider: 'google' | 'microsoft' | 'apple';
  email: string;
  connected: boolean;
  lastSync?: string;
}

export interface TestScenario {
  type: 'phone' | 'sms';
  scenario: string;
  userInput: string;
  expectedOutcome: string;
}
