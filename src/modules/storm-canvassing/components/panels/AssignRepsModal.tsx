import { useState, useEffect } from 'react';
import { X, UserPlus, User, Check, Loader2 } from 'lucide-react';
import { supabase } from '../../../../shared/lib/supabase';
import type { Turf, TurfAssignment } from '../../types';

interface OrgMember {
  user_id: string;
  full_name: string | null;
  email: string;
}

interface AssignRepsModalProps {
  turf: Turf;
  organizationId: string;
  onConfirm: (turfId: string, userIds: string[]) => Promise<void>;
  onRemove: (turfId: string, userId: string) => Promise<void>;
  onClose: () => void;
}

export function AssignRepsModal({
  turf,
  organizationId,
  onConfirm,
  onRemove,
  onClose,
}: AssignRepsModalProps) {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAssigneeIds = new Set(
    (turf.assignments || []).map((a: TurfAssignment) => a.user_id)
  );

  useEffect(() => {
    async function loadMembers() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            user_id,
            user_profiles(full_name, email)
          `)
          .eq('organization_id', organizationId)
          .eq('is_active', true);

        if (error) throw error;

        const mapped: OrgMember[] = (data || []).map((m: any) => ({
          user_id: m.user_id,
          full_name: m.user_profiles?.full_name || null,
          email: m.user_profiles?.email || '',
        }));

        setMembers(mapped);
        setSelected(new Set(currentAssigneeIds));
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMembers();
  }, [organizationId]);

  const toggleMember = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const toAdd = [...selected].filter((id) => !currentAssigneeIds.has(id));
      const toRemove = [...currentAssigneeIds].filter((id) => !selected.has(id));

      if (toAdd.length > 0) {
        await onConfirm(turf.id, toAdd);
      }
      for (const userId of toRemove) {
        await onRemove(turf.id, userId);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges =
    [...selected].some((id) => !currentAssigneeIds.has(id)) ||
    [...currentAssigneeIds].some((id) => !selected.has(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Reps</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{turf.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No team members found
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {members.map((member) => {
                const isSelected = selected.has(member.user_id);
                const isCurrentlyAssigned = currentAssigneeIds.has(member.user_id);
                const displayName = member.full_name || member.email;
                const initials = displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <button
                    key={member.user_id}
                    onClick={() => toggleMember(member.user_id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {initials || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {displayName}
                        {isCurrentlyAssigned && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            currently assigned
                          </span>
                        )}
                      </p>
                      {member.full_name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.email}</p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-3">{error}</p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !hasChanges}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : `Save (${selected.size} reps)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
