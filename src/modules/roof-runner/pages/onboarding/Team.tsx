import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Mail, Loader, UserCheck } from 'lucide-react';
import { OnboardingLayout } from './OnboardingLayout';
import { onboardingApi } from '../../../../shared/services/onboardingApi';
import { useSupabaseUser } from '../../../../shared/hooks/useSupabaseUser';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';

interface TeamMember {
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

const roleOptions = [
  { value: 'Admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'Manager', label: 'Manager', description: 'Manage projects and team members' },
  { value: 'Sales Rep', label: 'Sales Rep', description: 'Manage leads and opportunities' },
  { value: 'Field Tech', label: 'Field Tech', description: 'Access to jobs and scheduling' },
  { value: 'Viewer', label: 'Viewer', description: 'Read-only access' },
];

export const Team: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { currentOrganization } = useCurrentOrganization();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<TeamMember>({
    email: '',
    role: 'Admin',
    firstName: '',
    lastName: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExistingConfig();
  }, [currentOrganization?.id]);

  const loadExistingConfig = async () => {
    if (!currentOrganization?.id) return;

    try {
      const settings = await onboardingApi.getSettings(currentOrganization.id);
      if (settings?.team_config?.members) {
        setTeamMembers(settings.team_config.members);
      }
    } catch (err) {
      console.error('Error loading team config:', err);
    }
  };

  const addTeamMember = () => {
    if (!newMember.email || !newMember.firstName || !newMember.lastName) {
      setError('Please fill in all fields');
      return;
    }

    if (teamMembers.some((m) => m.email === newMember.email)) {
      setError('This email is already added');
      return;
    }

    setTeamMembers([...teamMembers, newMember]);
    setNewMember({ email: '', role: 'Admin', firstName: '', lastName: '' });
    setError(null);
  };

  const removeTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter((m) => m.email !== email));
  };

  const handleSave = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    setError(null);

    try {
      await onboardingApi.updateTeamConfig(currentOrganization.id, {
        members: teamMembers,
        invitations_sent: true,
        configured_at: new Date().toISOString(),
      });

      await onboardingApi.completeStep(user.id, currentOrganization.id, 3);
      navigate('/onboarding/phone-setup');
    } catch (err: any) {
      console.error('Error saving team config:', err);
      setError(err.message || 'Failed to save team configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user || !currentOrganization?.id) return;

    setSaving(true);
    try {
      await onboardingApi.completeStep(user.id, currentOrganization.id, 3);
      navigate('/onboarding/phone-setup');
    } catch (err) {
      console.error('Error skipping step:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={3}
      title="Invite Your Team"
      description="Add team members to collaborate on projects and manage customers together."
    >
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Team Member
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                placeholder="John"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={addTeamMember}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>

        {teamMembers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Members ({teamMembers.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.map((member) => (
                <div key={member.email} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      {member.role}
                    </span>
                    <button
                      onClick={() => removeTeamMember(member.email)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
            What happens next?
          </h4>
          <p className="text-sm text-red-800 dark:text-red-200">
            Each team member will receive an email invitation to join your organization. They'll be able to
            create their account and start collaborating immediately.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/onboarding/integrations')}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Back
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader className="w-4 h-4 animate-spin" />}
            <span>Continue</span>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
};
