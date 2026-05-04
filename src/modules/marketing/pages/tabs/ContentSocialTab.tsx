import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Instagram, Facebook, Youtube, Calendar, Zap, Image, Clock, CheckCircle, AlertCircle, Sparkles, Loader2, Trash2 } from 'lucide-react';
import type { SocialPost } from '../../types/marketing';
import { socialPostsApi } from '../../services/socialPostsApi';
import { useCurrentOrganization } from '../../../../shared/context/OrgContext';
import { useMarketingToast } from '../../hooks/useMarketingToast';
import { MarketingToastContainer } from '../../components/MarketingToastContainer';

const PLATFORMS = [
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
];

const AI_PROMPT_TEMPLATES = [
  { label: 'Job Completion Post', prompt: 'Write a Facebook post celebrating a completed residential roof replacement in Tampa, FL. Include before/after mention, 5-star quality, and a CTA.' },
  { label: 'Storm Alert Post', prompt: 'Write an urgent Instagram caption for a roofing contractor after a hailstorm in the area. Emphasize fast response and free inspections.' },
  { label: '5-Star Review Highlight', prompt: 'Turn this review into a social post: "The crew was amazing and completed our entire roof in one day. Highly recommend BuilderLync!" — Sarah T., Tampa.' },
  { label: 'Seasonal Promotion', prompt: 'Write a summer roofing promotion post offering free gutter cleaning with any roof replacement booked in July.' },
  { label: 'Before & After', prompt: 'Write a before-and-after social post for a hail-damaged roof that was replaced with architectural shingles in 3 days.' },
  { label: 'Team Spotlight', prompt: 'Write a team spotlight post for a roofing company featuring a lead installer with 12 years of experience.' },
];

const statusIcon = {
  published: <CheckCircle size={12} className="text-green-500" />,
  scheduled: <Clock size={12} className="text-blue-500" />,
  draft: <AlertCircle size={12} className="text-gray-400" />,
  failed: <AlertCircle size={12} className="text-red-500" />,
};

const statusLabel: Record<string, string> = {
  published: 'Published',
  scheduled: 'Scheduled',
  draft: 'Draft',
  failed: 'Failed',
};

const sourceTypeLabel: Record<string, string> = {
  job: 'From Job',
  review: 'From Review',
  manual: 'Manual',
  storm: 'Storm Event',
  template: 'Template',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface PostModalProps {
  orgId: string | null;
  onClose: () => void;
  onCreated: (post: SocialPost) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const NewPostModal: React.FC<PostModalProps> = ({ orgId, onClose, onCreated, addToast }) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const handleGenerate = () => {
    if (!selectedPrompt) return;
    setGenerating(true);
    setTimeout(() => {
      setContent('After a devastating hailstorm swept through Tampa last week, our crew responded within 24 hours to help homeowners get back on track. From emergency tarping to full roof replacements — we\'ve got your back. Call us today for a FREE storm damage inspection. Limited spots available this week! #TampaRoofing #StormDamage #FreeInspection');
      setGenerating(false);
    }, 1200);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleSaveDraft = async () => {
    if (!content.trim()) { addToast('error', 'Post content is required'); return; }
    setSaving(true);
    try {
      const post = await socialPostsApi.createPost({
        content,
        platforms: selectedPlatforms,
        source_type: 'manual',
      }, orgId);
      onCreated(post);
      addToast('success', 'Draft saved');
      onClose();
    } catch {
      addToast('error', 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!content.trim()) { addToast('error', 'Post content is required'); return; }
    setScheduling(true);
    try {
      const post = await socialPostsApi.createPost({
        content,
        platforms: selectedPlatforms,
        scheduled_at: scheduleDate ? new Date(scheduleDate).toISOString() : new Date(Date.now() + 86400000).toISOString(),
        source_type: 'manual',
      }, orgId);
      onCreated(post);
      addToast('success', 'Post scheduled');
      onClose();
    } catch {
      addToast('error', 'Failed to schedule post');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Platforms</p>
            <div className="flex gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${selectedPlatforms.includes(p.id) ? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                >
                  <p.icon size={14} className={selectedPlatforms.includes(p.id) ? p.color : ''} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sierra AI Prompts</p>
            <div className="grid grid-cols-2 gap-2">
              {AI_PROMPT_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setSelectedPrompt(t.prompt)}
                  className={`text-left p-2.5 rounded-lg border text-xs transition-all ${selectedPrompt === t.prompt ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'}`}
                >
                  <Sparkles size={10} className="inline mr-1" />
                  {t.label}
                </button>
              ))}
            </div>
            {selectedPrompt && (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Zap size={14} className={generating ? 'animate-pulse' : ''} />
                {generating ? 'Generating...' : 'Generate with Sierra'}
              </button>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Post Content</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post or use Sierra AI above..."
              rows={5}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/2200</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Schedule Date (optional)</p>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="text-sm text-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2">Cancel</button>
          <div className="flex gap-2">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Save Draft
            </button>
            <button
              onClick={handleSchedule}
              disabled={scheduling}
              className="flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
            >
              {scheduling && <Loader2 size={12} className="animate-spin" />}
              {scheduleDate ? 'Schedule Post' : 'Schedule Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContentSocialTab: React.FC = () => {
  const { currentOrganizationId: orgId } = useCurrentOrganization();
  const { toasts, addToast, removeToast } = useMarketingToast();

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState<'calendar' | 'list'>('list');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await socialPostsApi.getPosts(orgId);
      setPosts(data);
    } catch {
      addToast('error', 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (post: SocialPost) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await socialPostsApi.deletePost(id, orgId);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      addToast('success', 'Post deleted');
    } catch {
      addToast('error', 'Failed to delete post');
    } finally {
      setDeletingId(null);
    }
  };

  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Posts This Month', value: posts.length.toString() },
          { label: 'Published', value: publishedCount.toString() },
          { label: 'Scheduled', value: scheduledCount.toString() },
          { label: 'Avg Engagement', value: '4.2%' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(['list', 'calendar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors capitalize ${activeView === v ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
            >
              {v === 'list' ? 'Post List' : 'Calendar View'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Create Post
        </button>
      </div>

      {activeView === 'list' && (
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No posts yet</p>
              <p className="text-xs text-gray-500">Create your first post using Sierra AI.</p>
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start gap-3">
                <div className="flex gap-1 shrink-0 pt-0.5">
                  {post.platforms.map((p) => {
                    const P = PLATFORMS.find((x) => x.id === p);
                    return P ? <P.icon key={p} size={14} className={P.color} /> : null;
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      {statusIcon[post.status]}
                      <span className="text-xs text-gray-500">{statusLabel[post.status]}</span>
                    </div>
                    {post.source_type && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded">
                        {sourceTypeLabel[post.source_type]}
                      </span>
                    )}
                    {post.scheduled_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
                </div>
                {post.image_url && (
                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                    <Image size={16} className="text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  {deletingId === post.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="px-3 py-2 text-xs font-semibold text-gray-500 text-center border-r border-gray-100 dark:border-gray-700 last:border-0">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[300px]">
            {Array.from({ length: 35 }).map((_, i) => {
              const dayNum = i - 2;
              const scheduledPosts = posts.filter((p) => {
                if (!p.scheduled_at) return false;
                return new Date(p.scheduled_at).getDate() === dayNum;
              });
              return (
                <div key={i} className={`min-h-[80px] p-2 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 ${dayNum < 1 || dayNum > 30 ? 'bg-paper dark:bg-canvas' : ''}`}>
                  {dayNum >= 1 && dayNum <= 30 && (
                    <>
                      <p className="text-xs text-gray-500 mb-1">{dayNum}</p>
                      {scheduledPosts.map((sp) => (
                        <div key={sp.id} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded px-1 py-0.5 truncate mb-0.5">
                          {sp.content.substring(0, 20)}...
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <NewPostModal
          orgId={orgId}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
          addToast={addToast}
        />
      )}

      <MarketingToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
