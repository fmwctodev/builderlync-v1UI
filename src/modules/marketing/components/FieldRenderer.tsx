import React from 'react';
import { Star, Upload, Image as ImageIcon, FileText } from 'lucide-react';
import { FormField } from '../types/forms';

interface FieldRendererProps {
  field: FormField;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ field }) => {
  const baseInputClasses =
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white';

  switch (field.type) {
    case 'text':
    case 'single_line':
    case 'email':
    case 'phone':
    case 'website':
    case 'first_name':
    case 'last_name':
    case 'full_name':
    case 'city':
    case 'state':
    case 'country':
    case 'postal_code':
      return (
        <input
          type="text"
          placeholder={field.placeholder || field.label}
          disabled
          className={baseInputClasses}
        />
      );

    case 'address':
      return (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Street Address"
            disabled
            className={baseInputClasses}
          />
          <input
            type="text"
            placeholder="Apt, Suite, etc. (optional)"
            disabled
            className={baseInputClasses}
          />
        </div>
      );

    case 'number':
    case 'monetary':
      return (
        <div className="relative">
          {field.type === 'monetary' && (
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
          )}
          <input
            type="number"
            placeholder={field.placeholder || '0'}
            disabled
            className={`${baseInputClasses} ${field.type === 'monetary' ? 'pl-7' : ''}`}
          />
        </div>
      );

    case 'textarea':
    case 'multi_line':
      return (
        <textarea
          placeholder={field.placeholder || 'Enter text...'}
          disabled
          rows={3}
          className={baseInputClasses}
        />
      );

    case 'text_box_list':
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <input
              key={i}
              type="text"
              placeholder={`Item ${i}`}
              disabled
              className={baseInputClasses}
            />
          ))}
        </div>
      );

    case 'select':
    case 'single_dropdown':
      return (
        <select disabled className={baseInputClasses}>
          <option>Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'multi_dropdown':
      return (
        <div className="relative">
          <div className={`${baseInputClasses} flex items-center justify-between`}>
            <span className="text-gray-500">Select multiple options</span>
            <span className="text-gray-400">▼</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</div>
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {(field.options || [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]).map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" disabled className="rounded" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2' }]).map((opt) => (
            <label key={opt.value} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name={field.id} disabled className="rounded-full" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'date':
    case 'date_picker':
    case 'date_of_birth':
      return (
        <input
          type="date"
          disabled
          className={baseInputClasses}
        />
      );

    case 'star_rating':
      const maxStars = field.fieldSpecificProps?.maxStars || 5;
      return (
        <div className="flex items-center space-x-1">
          {Array.from({ length: maxStars }).map((_, i) => (
            <Star
              key={i}
              size={24}
              className="text-gray-300 dark:text-gray-600 cursor-pointer hover:text-yellow-400"
            />
          ))}
        </div>
      );

    case 'file':
    case 'file_upload':
      return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700/50">
          <Upload size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {field.fieldSpecificProps?.acceptedTypes || 'Any file type'}
          </p>
        </div>
      );

    case 'image':
      return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700/50">
          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload an image</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
        </div>
      );

    case 'signature':
      return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 p-4 h-32 flex items-center justify-center">
          <p className="text-sm text-gray-400">Sign here</p>
        </div>
      );

    case 'custom_text':
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {field.fieldSpecificProps?.text || 'Custom text content will appear here'}
          </p>
        </div>
      );

    case 'custom_html':
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2 text-gray-500">
            <FileText size={16} />
            <span className="text-xs">Custom HTML content</span>
          </div>
        </div>
      );

    case 'captcha':
      return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-400 border-t-red-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">reCAPTCHA</p>
          </div>
        </div>
      );

    case 'terms_conditions':
      return (
        <label className="flex items-start space-x-2 cursor-pointer">
          <input type="checkbox" disabled className="rounded mt-1" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-red-600 hover:underline">
              Terms and Conditions
            </a>
          </span>
        </label>
      );

    case 'source':
    case 'score':
      return (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <p className="text-xs text-gray-500 text-center">
            Hidden field - {field.type === 'source' ? 'tracks traffic source' : 'stores score value'}
          </p>
        </div>
      );

    case 'button':
      return (
        <button
          disabled
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
        >
          {field.fieldSpecificProps?.buttonText || field.label || 'Submit'}
        </button>
      );

    default:
      return (
        <input
          type="text"
          placeholder={field.placeholder}
          disabled
          className={baseInputClasses}
        />
      );
  }
};
