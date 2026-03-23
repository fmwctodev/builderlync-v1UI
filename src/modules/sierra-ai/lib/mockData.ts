import {
  SierraConfig,
  TwilioNumber,
  KbCollection,
  KbArticle,
  KbQaPair,
  BehaviorProfile,
  Conversation,
  AppointmentType,
  BookingRules,
  AgentScript,
  BusinessProfile,
  ActivityStats,
  WidgetConfig,
  CalendarConnection,
} from './types';

export const mockSierraConfig: SierraConfig = {
  id: '1',
  agentStatus: 'active',
  businessName: 'Elite Roofing & Solar',
  channels: {
    voice: { enabled: true, connected: true, status: 'connected' },
    sms: { enabled: true, connected: true, status: 'connected' },
    webchat: { enabled: true, connected: false, status: 'enabled' },
  },
  lastUpdated: new Date().toISOString(),
  hasPendingChanges: false,
};

export const mockTwilioNumbers: TwilioNumber[] = [
  {
    id: '1',
    label: 'Main Office Line',
    phoneNumber: '+1 (555) 123-4567',
    channels: ['voice', 'sms', 'mms'],
    callHandling: 'sierra_all',
    missedCallRecovery: true,
    defaultPipeline: 'New Leads',
    defaultOwner: 'John Smith',
    status: 'active',
  },
  {
    id: '2',
    label: 'After Hours',
    phoneNumber: '+1 (555) 987-6543',
    channels: ['sms'],
    callHandling: 'sierra_after_hours',
    missedCallRecovery: true,
    defaultPipeline: 'After Hours Leads',
    status: 'active',
  },
  {
    id: '3',
    label: 'Solar Division',
    phoneNumber: '+1 (555) 246-8135',
    channels: ['voice', 'sms'],
    callHandling: 'sierra_backup',
    missedCallRecovery: false,
    defaultPipeline: 'Solar Leads',
    defaultOwner: 'Sarah Johnson',
    status: 'active',
  },
];

export const mockKbCollections: KbCollection[] = [
  { id: '1', name: 'General FAQs', articleCount: 12, createdAt: '2024-01-15', updatedAt: '2024-11-20' },
  { id: '2', name: 'Product & Services', articleCount: 8, createdAt: '2024-01-20', updatedAt: '2024-11-18' },
  { id: '3', name: 'Pricing & Packages', articleCount: 6, createdAt: '2024-02-01', updatedAt: '2024-11-15' },
  { id: '4', name: 'Policies & Guarantees', articleCount: 5, createdAt: '2024-02-10', updatedAt: '2024-11-10' },
  { id: '5', name: 'Scheduling & Process', articleCount: 7, createdAt: '2024-02-15', updatedAt: '2024-11-05' },
  { id: '6', name: 'Edge Cases & Objections', articleCount: 4, createdAt: '2024-03-01', updatedAt: '2024-10-28' },
];

export const mockKbArticles: KbArticle[] = [
  {
    id: '1',
    title: 'Roof Replacement Pricing Guide',
    collectionId: '3',
    tags: ['pricing', 'roof replacement', 'residential'],
    content: 'Our roof replacement pricing typically ranges from $8,000 to $25,000 depending on size, materials, and complexity. We offer free inspections and detailed quotes.',
    status: 'live',
    highPriority: true,
    allowVerbatim: true,
    lastUpdated: '2024-11-15T10:30:00Z',
    createdAt: '2024-02-05T09:00:00Z',
  },
  {
    id: '2',
    title: 'Service Area Coverage',
    collectionId: '1',
    tags: ['service area', 'coverage'],
    content: 'We serve the entire Dallas-Fort Worth metroplex including Dallas, Fort Worth, Arlington, Plano, Irving, Garland, and surrounding cities within a 50-mile radius.',
    status: 'live',
    highPriority: true,
    allowVerbatim: true,
    lastUpdated: '2024-11-10T14:20:00Z',
    createdAt: '2024-01-20T11:00:00Z',
  },
  {
    id: '3',
    title: 'Storm Damage Assessment Process',
    collectionId: '5',
    tags: ['storm damage', 'insurance', 'process'],
    content: 'Our storm damage process includes: 1) Free inspection within 24-48 hours, 2) Detailed damage report with photos, 3) Insurance claim assistance, 4) Direct billing to insurance when approved.',
    status: 'live',
    highPriority: false,
    allowVerbatim: false,
    lastUpdated: '2024-11-05T16:45:00Z',
    createdAt: '2024-02-15T13:30:00Z',
  },
];

export const mockKbQaPairs: KbQaPair[] = [
  {
    id: '1',
    question: 'How much does a roof replacement cost?',
    answer: 'Roof replacement costs typically range from $8,000 to $25,000 depending on your home size, materials chosen, and roof complexity. Every roof is unique, so I recommend we schedule a free inspection to provide you with an accurate quote. Would you like me to book that for you?',
    intent: 'pricing',
    priority: 'high',
    canMentionRanges: true,
    offerBooking: true,
    tags: ['pricing', 'roof replacement'],
    lastUpdated: '2024-11-15T10:00:00Z',
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: '2',
    question: 'Do you service my area?',
    answer: 'We serve the entire Dallas-Fort Worth metroplex and surrounding areas within 50 miles. What city are you located in? I can confirm we service your area and check our availability.',
    intent: 'service_area',
    priority: 'high',
    canMentionRanges: false,
    offerBooking: true,
    tags: ['service area', 'coverage'],
    lastUpdated: '2024-11-10T12:00:00Z',
    createdAt: '2024-01-25T10:30:00Z',
  },
  {
    id: '3',
    question: 'How long does a roof installation take?',
    answer: 'Most residential roof installations take 1-3 days depending on the size and complexity. We work efficiently while maintaining high quality standards. Weather can sometimes affect the timeline. Would you like to schedule a consultation to discuss your specific project?',
    intent: 'scheduling',
    priority: 'normal',
    canMentionRanges: true,
    offerBooking: true,
    tags: ['timeline', 'installation'],
    lastUpdated: '2024-11-01T15:20:00Z',
    createdAt: '2024-02-10T11:00:00Z',
  },
];

export const mockBehaviorProfile: BehaviorProfile = {
  id: '1',
  name: 'Default',
  personaDescription: 'Sierra is a professional, friendly, and efficient virtual assistant for Elite Roofing & Solar. She is direct, clear, and avoids fluff. She helps homeowners understand their roofing needs and books qualified appointments.',
  toneChips: ['Professional', 'Friendly', 'Direct', 'Empathetic'],
  formalityLevel: 'neutral',
  useEverydayLanguage: true,
  operatingRules: {
    introduceWithBusinessName: true,
    neverMentionAI: true,
    captureNamePhoneService: true,
    attemptBooking: true,
    confirmDetails: true,
  },
  customInstructions: 'Always prioritize booking qualified appointments. If the customer mentions storm damage or insurance claims, treat as high priority. Be empathetic but efficient.',
  escalationTriggers: ['Legal questions', 'Complaints or refunds', 'Insurance disputes', 'Project in progress'],
  escalationInstructions: {
    'Legal questions': 'Apologize and explain that legal matters need to be discussed with our management team. Capture contact info and promise a callback within 2 hours.',
    'Complaints or refunds': 'Listen empathetically, capture all details, and assure them a manager will call back within 1 hour.',
  },
  defaultEscalationTarget: 'Office Manager',
  forbiddenTopics: ['Politics', 'Competitor bashing', 'Exact legal advice', 'Medical advice'],
  bannedPhrases: [
    'I guarantee you\'ll get approved by insurance',
    'We are the cheapest',
    'Other companies do bad work',
  ],
  redirectOnForbidden: true,
};

export const mockConversations: Conversation[] = [
  {
    id: '1',
    dateTime: '2024-11-28T09:30:00Z',
    channel: 'voice',
    direction: 'inbound',
    contactName: 'Mike Johnson',
    contactPhone: '+1 (555) 234-5678',
    jobType: 'Roof Replacement',
    outcome: 'appointment_booked',
    duration: '4:32',
    transcript: [
      { id: '1', sender: 'sierra', content: 'Thank you for calling Elite Roofing & Solar, this is Sierra. How can I help you today?', timestamp: '09:30:00' },
      { id: '2', sender: 'user', content: 'Hi, I think I need a new roof. Had some storm damage last week.', timestamp: '09:30:15' },
      { id: '3', sender: 'sierra', content: 'I\'m sorry to hear about the storm damage. We can definitely help with that. May I have your name please?', timestamp: '09:30:25' },
      { id: '4', sender: 'user', content: 'Mike Johnson', timestamp: '09:30:30' },
      { id: '5', sender: 'sierra', content: 'Thank you Mike. And what\'s the best phone number to reach you at?', timestamp: '09:30:35' },
      { id: '6', sender: 'user', content: '555-234-5678', timestamp: '09:30:42' },
    ],
    capturedFields: {
      name: 'Mike Johnson',
      phone: '+1 (555) 234-5678',
      address: '123 Oak Street, Dallas, TX',
      jobType: 'Roof Replacement - Storm Damage',
      urgency: 'soon',
      leadSource: 'Inbound Call',
    },
  },
  {
    id: '2',
    dateTime: '2024-11-28T10:15:00Z',
    channel: 'sms',
    direction: 'inbound',
    contactName: 'Sarah Williams',
    contactPhone: '+1 (555) 876-5432',
    jobType: 'Solar Installation',
    outcome: 'info_provided',
    transcript: [
      { id: '1', sender: 'user', content: 'Do you install solar panels?', timestamp: '10:15:00' },
      { id: '2', sender: 'sierra', content: 'Yes! We do solar installations. I\'m Sierra with Elite Roofing & Solar. What\'s your name?', timestamp: '10:15:10' },
      { id: '3', sender: 'user', content: 'Sarah', timestamp: '10:15:20' },
      { id: '4', sender: 'sierra', content: 'Great to meet you Sarah! We offer complete solar panel installation. Are you looking for information on pricing or would you like to schedule a free consultation?', timestamp: '10:15:25' },
    ],
    capturedFields: {
      name: 'Sarah Williams',
      phone: '+1 (555) 876-5432',
      jobType: 'Solar Installation',
      urgency: 'flexible',
    },
  },
];

export const mockAppointmentTypes: AppointmentType[] = [
  { id: '1', name: 'Free Roof Inspection', duration: 60, locationType: 'in_person', enabled: true, description: 'Comprehensive roof inspection' },
  { id: '2', name: 'Storm Damage Assessment', duration: 45, locationType: 'in_person', enabled: true, description: 'Quick storm damage evaluation' },
  { id: '3', name: 'Solar Consultation', duration: 90, locationType: 'both', enabled: true, description: 'Solar panel system consultation' },
  { id: '4', name: 'Quote Review Call', duration: 30, locationType: 'virtual', enabled: true, description: 'Review written quote over phone' },
];

export const mockBookingRules: BookingRules = {
  minNoticeHours: 2,
  maxDaysOut: 30,
  maxPerDay: 8,
  businessHoursOnly: false,
  sameDayBooking: true,
};

export const mockAgentScript: AgentScript = {
  greeting: {
    voice: 'Thank you for calling Elite Roofing & Solar, this is Sierra. How can I help you today?',
    sms: 'Hi! This is Sierra with Elite Roofing & Solar. Thanks for reaching out! How can I help you?',
  },
  identification: {
    voice: 'I\'m Sierra, your virtual assistant with Elite Roofing & Solar. I\'m here to help answer your questions and schedule appointments.',
    sms: 'I\'m Sierra, Elite Roofing & Solar\'s virtual assistant. I can answer questions and book appointments for you!',
  },
  leadCapture: {
    namePrompt: 'May I have your name please?',
    phonePrompt: 'And what\'s the best phone number to reach you at?',
    addressPrompt: 'What\'s the property address where you need service?',
    servicePrompt: 'What type of service are you interested in today?',
  },
  qualifyingQuestions: [
    { id: '1', question: 'Is this for a residential or commercial property?', order: 1, required: true },
    { id: '2', question: 'How soon are you looking to get this work done?', order: 2, required: true },
    { id: '3', question: 'Have you noticed any specific issues or damage?', order: 3, required: false },
    { id: '4', question: 'Will this be an insurance claim?', order: 4, required: false },
  ],
  bookingPitch: 'I have availability this week for a free inspection. Would you like me to schedule that for you?',
  closingLanguage: 'Perfect! I\'ve got you scheduled for [DATE] at [TIME]. You\'ll receive a confirmation text shortly. Is there anything else I can help you with today?',
};

export const mockBusinessProfile: BusinessProfile = {
  businessName: 'Elite Roofing & Solar',
  serviceAreas: ['Dallas', 'Fort Worth', 'Arlington', 'Plano', 'Irving', 'Garland'],
  servicesOffered: ['Roof Replacement', 'Roof Repair', 'Storm Damage', 'Solar Installation', 'Gutter Installation'],
  defaultPipeline: 'New Leads',
  defaultCalendar: 'Main Calendar',
};

export const mockActivityStats: ActivityStats = {
  callsHandled: 24,
  smsChatsHandled: 18,
  appointmentsBooked: 12,
  date: new Date().toISOString(),
};

export const mockWidgetConfig: WidgetConfig = {
  title: 'Chat with Sierra',
  welcomeMessage: 'Hi! I\'m Sierra from Elite Roofing & Solar. How can I help you today?',
  primaryColor: '#dc2626',
  position: 'bottom-right',
  enabled: true,
};

export const mockCalendarConnections: CalendarConnection[] = [
  { id: '1', provider: 'google', email: 'office@eliteroofing.com', connected: true, lastSync: '2024-11-28T08:00:00Z' },
  { id: '2', provider: 'microsoft', email: 'team@eliteroofing.com', connected: false },
];
