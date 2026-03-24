import React, { useEffect, useState } from 'react';
import { Save, Loader2, ShieldCheck, Brain } from 'lucide-react';
import { useSierraAssistant } from '../../context/SierraAssistantContext';

export function SierraAssistantSettingsView() {
  const { profile, saveProfile } = useSierraAssistant();
  const [confirmAllWrites, setConfirmAllWrites] = useState(true);
  const [systemPromptOverride, setSystemPromptOverride] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setConfirmAllWrites(profile.confirm_all_writes ?? true);
      setSystemPromptOverride(profile.system_prompt_override ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await saveProfile({
        confirm_all_writes: confirmAllWrites,
        system_prompt_override: systemPromptOverride || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-5">

        {/* Confirmation setting */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary-600 dark:text-primary-400" />
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Safety</h3>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Confirm all write actions</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Sierra will always show you a plan and ask for approval before creating, updating, or deleting anything.
              </p>
            </div>
            <button
              onClick={() => setConfirmAllWrites(!confirmAllWrites)}
              className={`relative flex-shrink-0 h-5 w-9 rounded-full transition-colors mt-0.5 ${
                confirmAllWrites ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              role="switch"
              aria-checked={confirmAllWrites}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  confirmAllWrites ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Custom instructions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-primary-600 dark:text-primary-400" />
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Custom Instructions</h3>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Tell Sierra about your preferences, communication style, or how you like to work. This will be included in every conversation.
            </p>
            <textarea
              value={systemPromptOverride}
              onChange={e => setSystemPromptOverride(e.target.value)}
              placeholder="e.g. I prefer formal email drafts. Always suggest a follow-up task after scheduling an appointment. My team works Pacific time..."
              rows={6}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 resize-none"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {systemPromptOverride.length}/1000 characters
            </p>
          </div>
        </div>

        {/* About */}
        <div className="rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900 p-3 space-y-1">
          <p className="text-xs font-medium text-primary-800 dark:text-primary-300">About Sierra</p>
          <p className="text-xs text-primary-600 dark:text-primary-400">
            Sierra is your AI executive assistant built into BuilderLynk. She can read and act on your contacts, schedule, opportunities, tasks, and more — all from this panel.
          </p>
          <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
            Press <strong>⌘⇧K</strong> (Mac) or <strong>Ctrl+⇧K</strong> (Windows) to open/close.
          </p>
        </div>
      </div>

      {/* Save button */}
      <div className="sticky bottom-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white text-sm font-medium transition-colors"
        >
          {isSaving
            ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
            : saved
            ? <><Save size={15} /> Saved!</>
            : <><Save size={15} /> Save Settings</>
          }
        </button>
      </div>
    </div>
  );
}
