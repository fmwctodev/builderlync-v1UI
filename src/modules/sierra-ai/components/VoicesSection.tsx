import React, { useState } from 'react';
import { Volume2, Settings, Plus, ChevronRight, X } from 'lucide-react';
import { VoiceConfig } from '../services/agentsApi';

interface VoicesSectionProps {
  voices: VoiceConfig[];
  onChange: (voices: VoiceConfig[]) => void;
}

export function VoicesSection({ voices, onChange }: VoicesSectionProps) {
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const primaryVoice = voices.find((v) => v.isPrimary);

  const availableVoices = [
    { id: 'eric', name: 'Eric', provider: 'ElevenLabs' },
    { id: 'rachel', name: 'Rachel', provider: 'ElevenLabs' },
    { id: 'dave', name: 'Dave', provider: 'ElevenLabs' },
    { id: 'sarah', name: 'Sarah', provider: 'ElevenLabs' },
    { id: 'josh', name: 'Josh', provider: 'ElevenLabs' },
    { id: 'nicole', name: 'Nicole', provider: 'ElevenLabs' },
  ];

  const handleAddVoice = (voice: { id: string; name: string; provider: string }) => {
    const newVoice: VoiceConfig = {
      id: voice.id,
      name: voice.name,
      provider: voice.provider,
      isPrimary: voices.length === 0,
    };
    onChange([...voices, newVoice]);
    setShowVoiceSelector(false);
  };

  const handleRemoveVoice = (voiceId: string) => {
    const updatedVoices = voices.filter((v) => v.id !== voiceId);
    if (updatedVoices.length > 0 && !updatedVoices.some((v) => v.isPrimary)) {
      updatedVoices[0].isPrimary = true;
    }
    onChange(updatedVoices);
  };

  const handleSetPrimary = (voiceId: string) => {
    const updatedVoices = voices.map((v) => ({
      ...v,
      isPrimary: v.id === voiceId,
    }));
    onChange(updatedVoices);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Voices</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select the ElevenLabs voices you want to use for the agent.
          </p>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{voice.name}</span>
                  {voice.isPrimary && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                      Primary
                    </span>
                  )}
                </div>
                {voice.provider && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{voice.provider}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!voice.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(voice.id)}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Set as primary
                </button>
              )}
              {voices.length > 1 && (
                <button
                  onClick={() => handleRemoveVoice(voice.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {voices.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No voices selected. Add a voice to get started.
          </div>
        )}

        <button
          onClick={() => setShowVoiceSelector(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add additional voice
        </button>
      </div>

      {showVoiceSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Voice</h3>
                <button
                  onClick={() => setShowVoiceSelector(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {availableVoices
                  .filter((v) => !voices.some((voice) => voice.id === v.id))
                  .map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => handleAddVoice(voice)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{voice.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{voice.provider}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}

                {availableVoices.filter((v) => !voices.some((voice) => voice.id === v.id)).length === 0 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    All available voices have been added.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
