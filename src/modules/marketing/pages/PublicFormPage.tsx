import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader, Star } from 'lucide-react';
import { formsApi } from '../services/formsApi';
import type { MarketingForm, FormField, FormFieldOption } from '../types/forms';

export const PublicFormPage: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [form, setForm] = useState<MarketingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadForm();
  }, [publicId]);

  useLayoutEffect(() => {
    const postHeight = () => {
      if (window.parent === window) return;

      window.parent.postMessage(
        {
          type: 'builderlynk-form-resize',
          height: document.documentElement.scrollHeight,
        },
        '*'
      );
    };

    postHeight();

    const resizeObserver = new ResizeObserver(() => {
      postHeight();
    });

    resizeObserver.observe(document.body);
    resizeObserver.observe(document.documentElement);
    window.addEventListener('load', postHeight);
    window.addEventListener('resize', postHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('load', postHeight);
      window.removeEventListener('resize', postHeight);
    };
  }, [form, submitted, formData, errors]);

  const loadForm = async () => {
    if (!publicId) return;
    try {
      setLoading(true);
      const loadedForm = await formsApi.getFormByPublicId(publicId);
      setForm(normalizeForm(loadedForm));
      setError(null);
    } catch (err) {
      setError('Form not found or no longer available');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !publicId) return;

    const validationErrors = validateForm(form, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});
      const submissionData: Record<string, any> = {};

      Object.entries(formData).forEach(([fieldId, rawValue]) => {
        const field = form.fields?.find((f) => f.id === fieldId);
        if (field) {
          submissionData[field.label] = serializeSubmissionValue(field, rawValue);
        }
      });

      let userIp = 'Unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        userIp = ipData.ip;
      } catch (ipError) {
        console.log('Could not fetch IP address');
      }
      
      // Add metadata
      const metadata = {
        ip: userIp,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      await formsApi.submitPublicForm(publicId, submissionData, metadata);
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;

      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error || 'This form is no longer available'}</p>
        </div>
      </div>
    );
  }

  const theme = form.settings?.theme || {
    primaryColor: '#dc2626',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: `${theme.primaryColor}20` }}
            >
              <CheckCircle className="w-10 h-10" style={{ color: theme.primaryColor }} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              {form.settings?.thankYouMessage || 'Your response has been submitted successfully.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: theme.backgroundColor }}>
          {form.settings?.showLogo && (
            <div className="mb-6 text-center">
              <div
                className="inline-block px-4 py-2 rounded-lg font-bold text-lg"
                style={{ backgroundColor: theme.primaryColor, color: '#ffffff' }}
              >
                BuilderLynk
              </div>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.textColor }}>
            {form.name}
          </h1>
          {form.description && (
            <p className="text-gray-600 mb-6">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields?.map((field) => (
              <div key={field.id}>
                <label className="block font-medium mb-2" style={{ color: theme.textColor }}>
                  {field.label}
                  {field.validation?.required && <span className="text-red-600 ml-1">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
                )}

                <FieldInput
                  field={field}
                  value={getFieldValue(formData, field)}
                  onChange={(value) => handleFieldChange(field.id, value)}
                  error={errors[field.id]}
                  primaryColor={theme.primaryColor}
                />

                {errors[field.id] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ backgroundColor: theme.primaryColor }}
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>{getSubmitButtonText(form)}</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Powered by <span className="font-semibold">BuilderLynk</span>
        </p>
      </div>
    </div>
  );
};

const normalizeOption = (option: FormFieldOption | string, index: number): FormFieldOption => {
  if (typeof option === 'string') {
    return {
      label: option,
      value: option.toLowerCase().replace(/\s+/g, '_') || `option_${index + 1}`,
    };
  }

  return {
    label: option.label || option.value || `Option ${index + 1}`,
    value: option.value || option.label?.toLowerCase().replace(/\s+/g, '_') || `option_${index + 1}`,
  };
};

const normalizeField = (field: any): FormField => {
  const normalizedOptions = Array.isArray(field?.options)
    ? field.options.map((option: FormFieldOption | string, index: number) => normalizeOption(option, index))
    : [];

  return {
    ...field,
    helpText: field.helpText ?? field.help_text,
    defaultValue: field.defaultValue ?? field.default_value,
    fieldSpecificProps: field.fieldSpecificProps ?? field.field_specific_props ?? {},
    validation: field.validation || {},
    options: normalizedOptions,
  };
};

const normalizeForm = (form: MarketingForm | null): MarketingForm | null => {
  if (!form) return null;

  return {
    ...form,
    fields: Array.isArray(form.fields) ? form.fields.map(normalizeField) : [],
  };
};

const getFieldOptions = (field: FormField): FormFieldOption[] => field.options || [];

const getDefaultFieldValue = (field: FormField) => {
  if (field.defaultValue !== undefined) {
    if (field.type === 'checkbox' || field.type === 'multi_dropdown') {
      return Array.isArray(field.defaultValue) ? field.defaultValue : [field.defaultValue].filter(Boolean);
    }
    return field.defaultValue;
  }

  if (field.type === 'checkbox' || field.type === 'multi_dropdown') {
    return [];
  }

  return '';
};

const getFieldValue = (formData: Record<string, any>, field: FormField) => {
  const value = formData[field.id];
  return value !== undefined ? value : getDefaultFieldValue(field);
};

const isEmptyValue = (field: FormField, value: any) => {
  if (field.type === 'checkbox' || field.type === 'multi_dropdown') {
    return !Array.isArray(value) || value.length === 0;
  }

  if (field.type === 'star_rating') {
    return value === undefined || value === null || value === '';
  }

  return value === undefined || value === null || value === '';
};

const serializeSubmissionValue = (field: FormField, value: any) => {
  if (field.type === 'checkbox' || field.type === 'multi_dropdown') {
    return Array.isArray(value) ? value : [];
  }

  return value;
};

const validateForm = (form: MarketingForm, submissionData: Record<string, any>) => {
  const validationErrors: Record<string, string> = {};

  for (const field of form.fields || []) {
    if (field.type === 'button') continue;

    const value = getFieldValue(submissionData, field);

    if (field.validation?.required && isEmptyValue(field, value)) {
      validationErrors[field.id] = field.validation.customError || `${field.label} is required`;
      continue;
    }

    if (isEmptyValue(field, value)) {
      continue;
    }

    if ((field.type === 'email') && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        validationErrors[field.id] = 'Invalid email address';
      }
    }

    if (field.type === 'phone' && typeof value === 'string') {
      const phoneRegex = /^[\d\s\-()+]+$/;
      if (!phoneRegex.test(value)) {
        validationErrors[field.id] = 'Invalid phone number';
      }
    }

    if (typeof value === 'string') {
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        validationErrors[field.id] = `Must be at least ${field.validation.minLength} characters`;
      }

      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        validationErrors[field.id] = `Must be no more than ${field.validation.maxLength} characters`;
      }

      if (field.validation?.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          validationErrors[field.id] = field.validation.customError || 'Invalid format';
        }
      }
    }

    if ((field.type === 'number' || field.type === 'monetary') && value !== '') {
      const numValue = parseFloat(value);
      if (Number.isNaN(numValue)) {
        validationErrors[field.id] = 'Must be a valid number';
      } else {
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
          validationErrors[field.id] = `Must be at least ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
          validationErrors[field.id] = `Must be no more than ${field.validation.max}`;
        }
      }
    }
  }

  return validationErrors;
};

const getSubmitButtonText = (form: MarketingForm) => {
  const submitButtonField = form.fields?.find((field) => field.type === 'button');
  return submitButtonField?.fieldSpecificProps?.buttonText || submitButtonField?.label || 'Submit';
};

const FieldInput: React.FC<{
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  primaryColor: string;
}> = ({ field, value, onChange, error, primaryColor }) => {
  const baseInputClass = `w-full px-4 py-3 border rounded-lg transition-colors ${
    error
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-2 focus:border-transparent'
  }`;

  const focusRingStyle = {
    '--tw-ring-color': primaryColor,
  } as React.CSSProperties;

  const options = getFieldOptions(field);

  switch (field.type) {
    case 'text':
    case 'single_line':
    case 'email':
    case 'phone':
    case 'website':
    case 'full_name':
    case 'first_name':
    case 'last_name':
    case 'city':
    case 'state':
    case 'country':
    case 'postal_code':
      return (
        <input
          type={field.type === 'email' ? 'email' : field.type === 'website' ? 'url' : field.type === 'phone' ? 'tel' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'number':
    case 'monetary':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'textarea':
    case 'multi_line':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'text_box_list':
      return (
        <div className="space-y-2">
          {(Array.isArray(value) && value.length > 0 ? value : ['']).map((item: string, index: number) => (
            <input
              key={`${field.id}-${index}`}
              type="text"
              value={item}
              onChange={(e) => {
                const nextValues = Array.isArray(value) ? [...value] : [''];
                nextValues[index] = e.target.value;
                onChange(nextValues);
              }}
              placeholder={`Item ${index + 1}`}
              className={baseInputClass}
              style={focusRingStyle}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange([...(Array.isArray(value) ? value : ['']), ''])}
            className="text-sm font-medium"
            style={{ color: primaryColor }}
          >
            + Add item
          </button>
        </div>
      );

    case 'select':
    case 'single_dropdown':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          style={focusRingStyle}
        >
          <option value="">{field.placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'multi_dropdown':
      return (
        <select
          multiple
          value={Array.isArray(value) ? value : []}
          onChange={(e) =>
            onChange(Array.from(e.target.selectedOptions, (option) => option.value))
          }
          className={`${baseInputClass} min-h-[140px]`}
          style={focusRingStyle}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {options.map((option) => {
            const selectedValues = Array.isArray(value) ? value : [];
            return (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((selectedValue: string) => selectedValue !== option.value));
                    }
                  }}
                  className="rounded"
                  style={{ accentColor: primaryColor }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {options.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-full"
                style={{ accentColor: primaryColor }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'star_rating': {
      const maxStars = field.fieldSpecificProps?.maxStars || 5;
      const currentRating = Number(value) || 0;

      return (
        <div className="flex items-center gap-2">
          {Array.from({ length: maxStars }, (_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                key={ratingValue}
                type="button"
                onClick={() => onChange(ratingValue)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  fill={ratingValue <= currentRating ? primaryColor : 'transparent'}
                  color={ratingValue <= currentRating ? primaryColor : '#9ca3af'}
                />
              </button>
            );
          })}
        </div>
      );
    }

    case 'date':
    case 'date_picker':
    case 'date_of_birth':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'button':
      return null;

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || field.label}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );
  }
};
