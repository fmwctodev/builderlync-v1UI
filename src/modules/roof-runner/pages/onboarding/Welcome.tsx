import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, ChevronRight } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { supabase } from '../../../../shared/lib/supabase';

const businessTypes = [
  { value: 'roofing', label: 'Roofing', icon: '🏠' },
  { value: 'solar', label: 'Solar', icon: '☀️' },
  { value: 'siding', label: 'Siding', icon: '🏗️' },
  { value: 'general_contractor', label: 'General Contractor', icon: '🔨' },
];

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    companyName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    businessType: '',
    locations: [''],
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Unable to load user data');
        return;
      }

      // Get organization data (separate queries to avoid recursion)
      const { data: orgMember, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      let companyName = 'Your Company';
      if (orgMember && !orgError) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', orgMember.organization_id)
          .maybeSingle();

        if (org) {
          companyName = org.name;
        }
      }

      setUserData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        companyName,
      });
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const addLocation = () => {
    setFormData({
      ...formData,
      locations: [...formData.locations, ''],
    });
  };

  const updateLocation = (index: number, value: string) => {
    const newLocations = [...formData.locations];
    newLocations[index] = value;
    setFormData({ ...formData, locations: newLocations });
  };

  const removeLocation = (index: number) => {
    if (formData.locations.length > 1) {
      const newLocations = formData.locations.filter((_, i) => i !== index);
      setFormData({ ...formData, locations: newLocations });
    }
  };

  const handleContinue = async () => {
    if (!formData.businessType) {
      setError('Please select a business type');
      return;
    }

    const validLocations = formData.locations.filter(loc => loc.trim() !== '');
    if (validLocations.length === 0) {
      setError('Please add at least one location');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('User not found');
        return;
      }

      // Get organization ID
      const { data: orgMember, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgMember) {
        setError('Organization not found');
        return;
      }

      const orgId = orgMember.organization_id;

      // Check if onboarding_progress exists
      const { data: existingProgress } = await supabase
        .from('onboarding_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .single();

      if (!existingProgress) {
        // Create onboarding progress record
        await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            organization_id: orgId,
            current_step: 1,
            completed_steps: [1],
            total_steps: 10,
            onboarding_score: 10,
          });
      } else {
        // Update existing progress
        await supabase
          .from('onboarding_progress')
          .update({
            current_step: 2,
            completed_steps: [1],
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      }

      // Create or update onboarding_settings
      const { data: existingSettings } = await supabase
        .from('onboarding_settings')
        .select('id')
        .eq('organization_id', orgId)
        .single();

      const settingsData = {
        organization_id: orgId,
        business_type: formData.businessType,
        locations: validLocations,
      };

      if (!existingSettings) {
        await supabase.from('onboarding_settings').insert(settingsData);
      } else {
        await supabase
          .from('onboarding_settings')
          .update(settingsData)
          .eq('id', existingSettings.id);
      }

      // Navigate to next step
      navigate('/onboarding/integrations');
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      title={`Welcome to BuilderLync${userData?.name ? `, ${userData.name}!` : '!'}`}
      description="Let's get your account set up. This should take about 10-15 minutes."
    >
      <div className="max-w-3xl mx-auto">

        {/* Account Snapshot */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Account Summary</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-base font-medium text-gray-900">{userData?.companyName}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-base font-medium text-gray-900">{userData?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Business Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            What type of business are you?
          </label>
          <div className="grid grid-cols-2 gap-4">
            {businessTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFormData({ ...formData, businessType: type.value })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.businessType === type.value
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-base font-medium text-gray-900">{type.label}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            This helps us customize your platform with industry-specific templates and workflows.
          </p>
        </div>

        {/* Locations */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Where do you operate?
          </label>
          <div className="space-y-3">
            {formData.locations.map((location, index) => (
              <div key={index} className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => updateLocation(index, e.target.value)}
                    placeholder="City, State or Region"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  />
                </div>
                {formData.locations.length > 1 && (
                  <button
                    onClick={() => removeLocation(index)}
                    className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addLocation}
            className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            + Add Another Location
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Welcome;
