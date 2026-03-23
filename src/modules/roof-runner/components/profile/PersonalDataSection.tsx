import React, { useState, useEffect } from 'react';
import { Camera, X, Loader2, Info } from 'lucide-react';
import { profileService } from '../../../../shared/services/profileService';
import { UserProfile } from '../../../../shared/types/profile';
import { supabase } from '../../../../shared/lib/supabase';

interface PersonalDataSectionProps {
  onUpdate?: () => void;
}

const PersonalDataSection: React.FC<PersonalDataSectionProps> = ({ onUpdate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    extension: '',
    platform_language: 'en-US',
    calendar_name: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getUserProfile();

      if (data) {
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || '',
          phone: data.phone,
          extension: data.extension,
          platform_language: data.platform_language,
          calendar_name: data.calendar_name,
        });
        setIsNewProfile(false);
      } else {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const firstName = user.user_metadata?.first_name || '';
          const lastName = user.user_metadata?.last_name || '';
          const fullName = user.user_metadata?.full_name || '';

          const extractedFirstName = firstName || fullName.split(' ')[0] || '';
          const extractedLastName = lastName || fullName.split(' ').slice(1).join(' ') || '';

          setFormData({
            first_name: extractedFirstName,
            last_name: extractedLastName,
            email: user.email || '',
            phone: '',
            extension: '',
            platform_language: 'en-US',
            calendar_name: '',
          });
          setIsNewProfile(true);
        }
      }
    } catch (err) {
      setError('Failed to load profile. Please try refreshing the page.');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      setError('File size must be less than 2.5 MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const avatarUrl = await profileService.uploadAvatar(file);
      await profileService.updateUserProfile({ avatar_url: avatarUrl });
      await loadProfile();
      onUpdate?.();
    } catch (err) {
      setError('Failed to upload avatar');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      setSaving(true);
      await profileService.deleteAvatar(profile.avatar_url);
      await profileService.updateUserProfile({ avatar_url: null });
      await loadProfile();
      onUpdate?.();
    } catch (err) {
      setError('Failed to remove avatar');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      if (profile) {
        await profileService.updateUserProfile(formData);
      } else {
        await profileService.createUserProfile(formData);
      }

      await loadProfile();
      setIsNewProfile(false);
      onUpdate?.();
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Profile save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isNewProfile && !error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
          <Info className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Complete Your Profile</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Please fill out your profile information below and click "Update Profile" to save.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Data</h3>

          <div className="flex items-start space-x-6 mb-6">
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden group">
                {profile?.avatar_url ? (
                  <>
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    {!uploading && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-gray-100 shadow-md"
                      >
                        <X className="w-4 h-4 text-gray-900" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-4xl font-semibold text-gray-400 dark:text-gray-500">
                    {formData.first_name?.[0] || '?'}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-md"
              >
                <Camera className="w-5 h-5 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Profile Image</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The proposed size is 512×512 px no bigger than 2.5 MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="sean@autom8ionlab.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 689-310-2712"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Extension
                </label>
                <input
                  type="text"
                  name="extension"
                  value={formData.extension}
                  onChange={handleInputChange}
                  placeholder="Extension"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calendar
              </label>
              <input
                type="text"
                name="calendar_name"
                value={formData.calendar_name}
                onChange={handleInputChange}
                placeholder="Book With..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform Language
              </label>
              <select
                name="platform_language"
                value={formData.platform_language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="en-US">English (United States)</option>
                <option value="es-ES">Spanish (Spain)</option>
                <option value="fr-FR">French (France)</option>
                <option value="de-DE">German (Germany)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? 'Saving...' : isNewProfile ? 'Save Profile' : 'Update Profile'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PersonalDataSection;
