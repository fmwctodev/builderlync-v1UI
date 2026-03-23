import React from 'react';
import { Settings2, ChevronDown } from 'lucide-react';
import type { MediaPreferences } from '../types';

interface ChatMediaSettingsProps {
  prefs: MediaPreferences;
  onChange: (prefs: MediaPreferences) => void;
}

const VIDEO_MODELS = [
  { id: 'gen3', label: 'Gen-3 Alpha (Fast)' },
  { id: 'gen3_turbo', label: 'Gen-3 Turbo' },
  { id: 'wan', label: 'Wan (High Quality)' },
];

const ASPECT_RATIOS = [
  { value: '9:16', label: '9:16 Vertical' },
  { value: '1:1', label: '1:1 Square' },
  { value: '16:9', label: '16:9 Landscape' },
];

const ChatMediaSettings: React.FC<ChatMediaSettingsProps> = ({ prefs, onChange }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-t border-slate-700 px-4 py-2 bg-slate-800/50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Settings2 size={13} />
          <span>Media settings</span>
          <ChevronDown
            size={13}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs text-slate-400">Auto-generate media</span>
          <div
            onClick={() => onChange({ ...prefs, auto_generate_media: !prefs.auto_generate_media })}
            className={`relative w-8 h-4 rounded-full transition-colors ${
              prefs.auto_generate_media ? 'bg-cyan-600' : 'bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                prefs.auto_generate_media ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
        </label>
      </div>

      {open && prefs.auto_generate_media && (
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Video model</label>
            <div className="relative">
              <select
                value={prefs.video_model_id ?? 'gen3'}
                onChange={(e) => onChange({ ...prefs, video_model_id: e.target.value })}
                className="appearance-none bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded-lg px-3 py-1.5 pr-7 focus:outline-none focus:border-cyan-500"
              >
                {VIDEO_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Aspect ratio</label>
            <div className="flex gap-1">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => onChange({ ...prefs, aspect_ratio: r.value })}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    prefs.aspect_ratio === r.value
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {r.value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Mode</label>
            <div className="flex gap-1">
              {(['std', 'pro'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...prefs, video_mode: mode })}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                    (prefs.video_mode ?? 'std') === mode
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {mode === 'std' ? 'Standard' : 'Pro'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMediaSettings;
