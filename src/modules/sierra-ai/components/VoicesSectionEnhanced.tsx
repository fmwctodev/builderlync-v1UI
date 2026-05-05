import { useState, useEffect } from 'react';
import { Play, Check, User, Loader2 } from 'lucide-react';
import { vapiApi } from '../services/vapiApi';

interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: {
    gender?: string;
  };
}

interface VoicesSectionEnhancedProps {
  agentId?: string;
}

export function VoicesSectionEnhanced({ agentId }: VoicesSectionEnhancedProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [agentVoiceId, setAgentVoiceId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
       await loadVoices();
       if (agentId) {
         await loadAgentVoice();
       }
    };
    initialize();
  }, [agentId]);

  const loadAgentVoice = async () => {
    if (!agentId) return;
    try {
      const response = await vapiApi.getAgentVoice(agentId);
      console.log('Agent voice response:', response);
      // Backend returns {success: true, data: {voice_id: ...}}
      const voiceId = response?.data?.voice_id || response?.voice_id;
      if (voiceId) {
        console.log('Setting voice to:', voiceId);
        setAgentVoiceId(voiceId);
        setSelectedVoice(voiceId);
      }
    } catch (error) {
      console.error('Error loading agent voice:', error);
    }
  };

  const loadVoices = async () => {
    try {
      setLoading(true);
      const response = await vapiApi.listVoices();
      console.log('List voices response:', response);
      const voiceData = response?.data || response || [];
      setVoices(voiceData);
      
      // Don't overwrite if loadAgentVoice already set it
      if (voiceData.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceData[0].voice_id);
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVoice = async (voiceId: string) => {
    if (!agentId) {
      alert('Please select an agent first');
      return;
    }
    try {
      await vapiApi.updateAgent(agentId, { voice_id: voiceId });
      setSelectedVoice(voiceId);
      setAgentVoiceId(voiceId);
    } catch (error) {
      console.error('Error updating voice:', error);
    }
  };

  const handlePlayVoice = (voice: Voice) => {
    setPlayingVoice(voice.voice_id);
    
    if ((voice as any).preview_url) {
      const audio = new Audio((voice as any).preview_url);
      audio.play().catch(err => console.error('Error playing audio:', err));
      audio.onended = () => setPlayingVoice(null);
      audio.onerror = () => setPlayingVoice(null);
    } else {
      setTimeout(() => {
        setPlayingVoice(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select Voice</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a voice for your AI agent. You can preview each voice before selecting.
        </p>
        {agentVoiceId && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 dark:text-green-300 font-medium">
              Agent voice configured in Vapi
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {voices.map((voice) => (
            <div
              key={voice.voice_id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all cursor-pointer ${
                selectedVoice === voice.voice_id
                  ? 'border-red-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => handleSelectVoice(voice.voice_id)}
            >
              <div className="p-6">
                <div className="relative mb-4">
                  <div
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                      voice.category === 'male'
                        ? 'bg-red-100 dark:bg-red-900/20'
                        : 'bg-pink-100 dark:bg-pink-900/20'
                    }`}
                  >
                    <User
                      className={`w-10 h-10 ${
                        voice.category === 'male'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-pink-600 dark:text-pink-400'
                      }`}
                    />
                  </div>
                  {selectedVoice === voice.voice_id && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {voice.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                    {voice.category}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayVoice(voice);
                  }}
                  disabled={playingVoice === voice.voice_id}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    playingVoice === voice.voice_id
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm">
                    {playingVoice === voice.voice_id ? 'Playing...' : 'Preview Voice'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-red-900 dark:text-red-100">
              Voice selection will apply to this agent. You can customize voices for each agent individually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
