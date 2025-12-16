import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { formsApi } from '../services/formsApi';
import { formProcessingService } from '../services/formProcessingService';
import type { MarketingForm, FormField } from '../types/forms';

export const PublicForm: React.FC = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const [form, setForm] = useState<MarketingForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (publicId) {
      loadForm();
    }
  }, [publicId]);

  const loadForm = async () => {
    if (!publicId) return;

    try {
      setLoading(true);
      const formData = await formsApi.getFormByPublicId(publicId);
      setForm(formData);
    } catch (error) {
      console.error('Error loading form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    const validation = formProcessingService.validateSubmission(form, formData);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      setErrors({});

      const metadata = {
        ip: '',
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        page_url: window.location.href,
        timestamp: new Date().toISOString(),
      };

      await formProcessingService.processSubmission(form, formData, metadata);

      setSubmitted(true);
      setFormData({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({ ...formData, [fieldId]: value });
    if (errors[fieldId]) {
      const newErrors = { ...errors };
      delete newErrors[fieldId];
      setErrors(newErrors);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600">The form you're looking for doesn't exist or has been removed.</p>
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
              {form.settings?.thankYouMessage || 'Your submission has been received. We will be in touch soon.'}
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
            <p className="text-gray-600 mb-8">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block font-medium mb-2" style={{ color: theme.textColor }}>
                  {field.label}
                  {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.helpText && (
                  <p className="text-sm text-gray-500 mb-2">{field.helpText}</p>
                )}
                <FieldInput
                  field={field}
                  value={formData[field.id] || ''}
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
                <span>Submit</span>
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

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'number':
      return (
        <input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.validation?.required}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.validation?.required}
          rows={4}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.validation?.required}
          className={baseInputClass}
          style={focusRingStyle}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value?.includes(option.value) || false}
                onChange={(e) => {
                  const currentValues = value || [];
                  if (e.target.checked) {
                    onChange([...currentValues, option.value]);
                  } else {
                    onChange(currentValues.filter((v: string) => v !== option.value));
                  }
                }}
                className="rounded"
                style={{ accentColor: primaryColor }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                required={field.validation?.required}
                className="rounded-full"
                style={{ accentColor: primaryColor }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'date':
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.validation?.required}
          className={baseInputClass}
          style={focusRingStyle}
        />
      );

    default:
      return null;
  }
};
