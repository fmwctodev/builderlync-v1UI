import React, { useState } from 'react';
import { Play, Check, User } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female';
  description?: string;
}

const voices: Voice[] = [
  { id: 'james', name: 'James', gender: 'male', description: 'Professional and clear' },
  { id: 'michael', name: 'Michael', gender: 'male', description: 'Warm and friendly' },
  { id: 'sarah', name: 'Sarah', gender: 'female', description: 'Confident and engaging' },
  { id: 'emma', name: 'Emma', gender: 'female', description: 'Calm and soothing' },
];

export function VoicesTab() {
  const [selectedVoice, setSelectedVoice] = useState<string>('james');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const handlePlayVoice = (voiceId: string) => {
    setPlayingVoice(voiceId);
    // Simulate audio playback
    setTimeout(() => {
      setPlayingVoice(null);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select Voice</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a voice for your AI agent. You can preview each voice before selecting.
        </p>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {voices.map((voice) => (
          <div
            key={voice.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${
              selectedVoice === voice.id
                ? 'border-red-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setSelectedVoice(voice.id)}
          >
            <div className="p-6">
              {/* Voice Avatar */}
              <div className="relative mb-4">
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                    voice.gender === 'male'
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : 'bg-pink-100 dark:bg-pink-900/20'
                  }`}
                >
                  <User
                    className={`w-10 h-10 ${
                      voice.gender === 'male'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-pink-600 dark:text-pink-400'
                    }`}
                  />
                </div>
                {selectedVoice === voice.id && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              {/* Voice Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {voice.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                  {voice.gender}
                </p>
                {voice.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {voice.description}
                  </p>
                )}
              </div>

              {/* Play Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayVoice(voice.id);
                }}
                disabled={playingVoice === voice.id}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  playingVoice === voice.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Play className="w-4 h-4" />
                <span className="text-sm">
                  {playingVoice === voice.id ? 'Playing...' : 'Preview Voice'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-900 dark:text-red-100">
              Voice selection will apply to all agents in your organization. You can customize individual agent voices in the agent settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
