export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'number'
  | 'file'
  | 'full_name'
  | 'first_name'
  | 'last_name'
  | 'date_of_birth'
  | 'address'
  | 'city'
  | 'state'
  | 'country'
  | 'postal_code'
  | 'website'
  | 'single_line'
  | 'multi_line'
  | 'text_box_list'
  | 'single_dropdown'
  | 'multi_dropdown'
  | 'star_rating'
  | 'custom_text'
  | 'custom_html'
  | 'captcha'
  | 'source'
  | 'terms_conditions'
  | 'score'
  | 'image'
  | 'file_upload'
  | 'monetary'
  | 'date_picker'
  | 'signature'
  | 'button';

export type FormFieldCategory =
  | 'personal_info'
  | 'submit'
  | 'address'
  | 'organization'
  | 'text'
  | 'choice'
  | 'rating'
  | 'customized'
  | 'other';

export type FormStatus = 'draft' | 'published' | 'archived';

export type SubmissionStatus = 'pending' | 'processed' | 'error';

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customError?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
  category?: FormFieldCategory;
  positionOrder?: number;
  styling?: {
    width?: 'full' | 'half' | 'third';
    alignment?: 'left' | 'center' | 'right';
    customCss?: string;
  };
  conditionalLogic?: {
    show: boolean;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains';
      value: string;
    }>;
  };
  fieldSpecificProps?: Record<string, any>;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor?: string;
  fontFamily?: string;
}

export interface FormNotificationSettings {
  enabled: boolean;
  recipients: string[];
  subject?: string;
  includeSubmissionData?: boolean;
}

export interface FormSettings {
  theme: FormTheme;
  thankYouMessage: string;
  redirectUrl?: string | null;
  showLogo: boolean;
  notifications: FormNotificationSettings;
  captchaEnabled?: boolean;
  allowMultipleSubmissions?: boolean;
  customCss?: string;
}

export interface MarketingForm {
  id: string;
  organization_id?: string;
  user_id?: number;
  name: string;
  description?: string;
  status: FormStatus;
  fields?: FormField[];
  settings?: FormSettings;
  pipeline_id?: string;
  stage_id?: string;
  public_id?: string;
  embed_code?: string;
  submission_count?: number;
  conversion_count?: number;
  folder_id?: string;
  created_by?: string;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FormSubmissionMetadata {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  page_url?: string;
  timestamp?: string;
}

export interface FormSubmission {
  id: string | number;
  organization_id?: string;
  form_id?: string;
  formId?: string;
  formName?: string;
  submission_data?: Record<string, any>;
  submissionData?: Record<string, any>;
  metadata?: FormSubmissionMetadata;
  status?: SubmissionStatus;
  contact_id?: string;
  opportunity_id?: string;
  error_message?: string;
  processed_at?: string;
  created_at?: string;
  submittedAt?: string;
  ipAddress?: string;
}

export interface FormSubmissionWithDetails extends FormSubmission {
  form?: MarketingForm | { name: string };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  opportunity?: {
    id: string;
    name: string;
    stage_id: string;
  };
}

export interface CreateFormRequest {
  name: string;
  description?: string;
  fields: FormField[];
  settings?: Partial<FormSettings>;
  pipeline_id?: string;
  stage_id?: string;
}

export interface UpdateFormRequest extends Partial<CreateFormRequest> {
  status?: FormStatus;
}

export interface SubmitFormRequest {
  form_id: string;
  public_id: string;
  submission_data: Record<string, any>;
  metadata?: FormSubmissionMetadata;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  settings: Partial<FormSettings>;
  icon?: string;
}

export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  totalConversions: number;
  conversionRate: number;
  submissionsByDay: Array<{
    date: string;
    count: number;
  }>;
  topSources: Array<{
    source: string;
    count: number;
  }>;
  averageCompletionTime?: number;
  abandonmentRate?: number;
}

export interface FormFolder {
  id: string;
  organization_id?: string;
  user_id?: number;
  name: string;
  parent_folder_id?: string;
  color?: string;
  form_count?: number;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface FormAnalyticsData {
  total_views: number;
  total_responses: number;
  average_completion_time: number;
  completion_rate: number;
  views_by_date: Array<{
    date: string;
    views: number;
  }>;
  responses_by_date: Array<{
    date: string;
    responses: number;
  }>;
}

export interface FormAnalyticsFilters {
  formId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateFolderRequest {
  name: string;
  parent_folder_id?: string;
  color?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  parent_folder_id?: string;
  color?: string;
}
