import { FormFieldType, FormFieldCategory } from '../types/forms';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Type,
  List,
  CheckSquare,
  Star,
  Code,
  Image,
  Upload,
  DollarSign,
  Hash,
  FileSignature,
  MousePointerClick,
  Shield,
  Tag,
  Award,
} from 'lucide-react';

export interface FieldTypeConfig {
  type: FormFieldType;
  label: string;
  category: FormFieldCategory;
  icon: any;
  description?: string;
}

export const FIELD_TYPE_CONFIGS: FieldTypeConfig[] = [
  // Personal Info
  { type: 'full_name', label: 'Full Name', category: 'personal_info', icon: User },
  { type: 'first_name', label: 'First Name', category: 'personal_info', icon: User },
  { type: 'last_name', label: 'Last Name', category: 'personal_info', icon: User },
  { type: 'date_of_birth', label: 'Date of Birth', category: 'personal_info', icon: Calendar },
  { type: 'phone', label: 'Phone', category: 'personal_info', icon: Phone },
  { type: 'email', label: 'Email', category: 'personal_info', icon: Mail },

  // Submit
  { type: 'button', label: 'Button', category: 'submit', icon: MousePointerClick },

  // Address
  { type: 'address', label: 'Address', category: 'address', icon: MapPin },
  { type: 'city', label: 'City', category: 'address', icon: MapPin },
  { type: 'state', label: 'State', category: 'address', icon: MapPin },
  { type: 'country', label: 'Country', category: 'address', icon: MapPin },
  { type: 'postal_code', label: 'Postal Code', category: 'address', icon: MapPin },

  // Organization
  { type: 'website', label: 'Website', category: 'organization', icon: Globe },

  // Text
  { type: 'single_line', label: 'Single Line', category: 'text', icon: Type },
  { type: 'multi_line', label: 'Multi Line', category: 'text', icon: Type },
  { type: 'text_box_list', label: 'Text Box List', category: 'text', icon: List },

  // Choice Elements
  { type: 'single_dropdown', label: 'Single Dropdown', category: 'choice', icon: List },
  { type: 'multi_dropdown', label: 'Multi Dropdown', category: 'choice', icon: List },
  { type: 'checkbox', label: 'Checkbox', category: 'choice', icon: CheckSquare },
  { type: 'radio', label: 'Radio', category: 'choice', icon: CheckSquare },

  // Rating
  { type: 'star_rating', label: 'Star Rating', category: 'rating', icon: Star },

  // Customized
  { type: 'custom_text', label: 'Text', category: 'customized', icon: Type },
  { type: 'custom_html', label: 'Html', category: 'customized', icon: Code },
  { type: 'captcha', label: 'Captcha', category: 'customized', icon: Shield },
  { type: 'source', label: 'Source', category: 'customized', icon: Tag },
  { type: 'terms_conditions', label: 'T & C', category: 'customized', icon: FileSignature },
  { type: 'score', label: 'Score', category: 'customized', icon: Award },

  // Other Elements
  { type: 'image', label: 'Add Image', category: 'other', icon: Image },
  { type: 'file_upload', label: 'File Upload', category: 'other', icon: Upload },
  { type: 'monetary', label: 'Monetary', category: 'other', icon: DollarSign },
  { type: 'number', label: 'Number', category: 'other', icon: Hash },
  { type: 'date_picker', label: 'Date Picker', category: 'other', icon: Calendar },
  { type: 'signature', label: 'Signature', category: 'other', icon: FileSignature },
];

export const CATEGORY_LABELS: Record<FormFieldCategory, string> = {
  personal_info: 'Personal Info',
  submit: 'Submit',
  address: 'Address',
  organization: 'Organization',
  text: 'Text',
  choice: 'Choice Elements',
  rating: 'Rating',
  customized: 'Customized',
  other: 'Other Elements',
};

export const getFieldTypesByCategory = (category: FormFieldCategory): FieldTypeConfig[] => {
  return FIELD_TYPE_CONFIGS.filter((field) => field.category === category);
};

export const getFieldTypeConfig = (type: FormFieldType): FieldTypeConfig | undefined => {
  return FIELD_TYPE_CONFIGS.find((field) => field.type === type);
};
