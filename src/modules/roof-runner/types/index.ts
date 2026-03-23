// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  isRecurring: boolean;
  assignedTo?: string;
  contactId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  isRecurring: boolean;
  assignedTo?: string;
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  contactId: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  section: 'Internal' | 'Sent' | 'Received';
  contactId: string;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
}

export interface CreateDocumentData {
  files: File[];
  section: 'Internal' | 'Sent' | 'Received';
}

// Appointment Types
export interface Appointment {
  id: string;
  calendar: string;
  title: string;
  description?: string;
  teamMember: string;
  date: string;
  slot: string;
  timezone: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  contactId: string;
  attendees: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  calendar: string;
  title: string;
  description?: string;
  teamMember: string;
  date: string;
  slot: string;
  timezone: string;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Company Types
export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyData {
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Modal Props Types
export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskData) => void;
}

export interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { data: string }) => void;
}

export interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateDocumentData) => void;
}

export interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateAppointmentData) => void;
}

export interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCompanyData) => void;
}

// Instant Estimator Types
export interface InstantEstimator {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInstantEstimatorData {
  name: string;
}

export interface RenameInstantEstimatorData {
  name: string;
}

export interface InstantEstimatorsResponse {
  data: InstantEstimator[];
  total: number;
  page: number;
  limit: number;
}