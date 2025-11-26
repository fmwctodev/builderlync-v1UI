import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { SocialPlatform } from '../../../../shared/services/socialMediaApi';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (data: NewPostData) => void;
}

export interface NewPostData {
  content: string;
  platforms: SocialPlatform[];
  scheduledDate?: string;
  scheduledTime?: string;
  publishNow: boolean;
}

export default function NewPostModal({ isOpen, onClose, onCreatePost }: NewPostModalProps) {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook', 'instagram']);
  const [publishNow, setPublishNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:00');

  const platforms = [
    { id: 'google_business' as SocialPlatform, name: 'Google Business', icon: '🔷', connected: false },
    { id: 'facebook' as SocialPlatform, name: 'Facebook', icon: '📘', connected: true },
    { id: 'instagram' as SocialPlatform, name: 'Instagram', icon: '📸', connected: true },
    { id: 'linkedin' as SocialPlatform, name: 'LinkedIn', icon: '💼', connected: false },
    { id: 'twitter' as SocialPlatform, name: 'Twitter', icon: '🐦', connected: false },
    { id: 'tiktok' as SocialPlatform, name: 'TikTok', icon: '🎵', connected: false },
    { id: 'youtube' as SocialPlatform, name: 'YouTube', icon: '▶️', connected: false },
  ];

  const togglePlatform = (platformId: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('Please enter post content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (!publishNow && !scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }

    onCreatePost({
      content,
      platforms: selectedPlatforms,
      scheduledDate: publishNow ? undefined : scheduledDate,
      scheduledTime: publishNow ? undefined : scheduledTime,
      publishNow,
    });

    setContent('');
    setSelectedPlatforms(['facebook', 'instagram']);
    setPublishNow(true);
    setScheduledDate('');
    setScheduledTime('09:00');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => platform.connected && togglePlatform(platform.id)}
                  disabled={!platform.connected}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                  } ${!platform.connected ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 cursor-pointer'}`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{platform.name}</span>
                  {selectedPlatforms.includes(platform.id) && (
                    <X size={14} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {content.length} / 1500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Publishing Options
            </label>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="publishNow"
                  checked={publishNow}
                  onChange={() => setPublishNow(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="publishNow" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Publish immediately
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="schedulePost"
                  checked={!publishNow}
                  onChange={() => setPublishNow(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor="schedulePost" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Schedule for later
                </label>
              </div>

              {!publishNow && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {publishNow ? 'Publish Now' : 'Schedule Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
