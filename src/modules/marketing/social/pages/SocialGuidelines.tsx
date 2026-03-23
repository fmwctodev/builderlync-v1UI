import React, { useState, useEffect, useRef } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import type { SocialGuideline } from '../types';
import { getGuidelines, upsertGuidelines } from '../services/socialGuidelines';
import GuidelineBlockEditor from '../components/GuidelineBlockEditor';

interface SocialGuidelinesProps {
  orgId: string;
}

type Block = { content: string; label?: string };
type StringArray = string[];

const TONES = ['Professional', 'Friendly', 'Authoritative', 'Inspirational', 'Educational', 'Humorous', 'Empathetic'];
const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'google_business', 'reddit'];

const DEFAULT_GUIDELINES: Partial<SocialGuideline> = {
  brand_voice: '',
  content_themes: [],
  image_style: [],
  writing_style: [],
  words_to_avoid: [],
  cta_rules: [],
  hashtag_preferences: { preferred: [], banned: [] },
  tone_preferences: {},
  platform_specific_notes: {},
  seasonal_rules: '',
  competitor_rules: '',
};

const SocialGuidelines: React.FC<SocialGuidelinesProps> = ({ orgId }) => {
  const [guidelines, setGuidelines] = useState<Partial<SocialGuideline>>(DEFAULT_GUIDELINES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadGuidelines();
  }, [orgId]);

  const loadGuidelines = async () => {
    setLoading(true);
    try {
      const data = await getGuidelines(orgId);
      if (data) setGuidelines(data);
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoSave = (updated: Partial<SocialGuideline>) => {
    setGuidelines(updated);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => save(updated), 1500);
  };

  const save = async (data: Partial<SocialGuideline>) => {
    setSaving(true);
    try {
      await upsertGuidelines(orgId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof SocialGuideline>(key: K, value: SocialGuideline[K]) => {
    const updated = { ...guidelines, [key]: value };
    triggerAutoSave(updated);
  };

  const toBlocks = (arr: string[] | undefined): Block[] =>
    (arr ?? []).map((content) => ({ content }));
  const fromBlocks = (blocks: Block[]): string[] =>
    blocks.map((b) => b.content).filter(Boolean);

  const toContentBlocks = (arr: Block[] | undefined): Block[] => arr ?? [];
  const fromContentBlocks = (blocks: Block[]): Block[] => blocks;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-slate-600 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 bg-slate-800/50">
        <div>
          <h2 className="text-base font-semibold text-white">Brand Guidelines</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define your brand voice, style, and content rules for AI generation</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle size={12} />
              Saved
            </span>
          )}
          {saving && (
            <span className="text-xs text-slate-500">Saving...</span>
          )}
          <button
            onClick={() => save(guidelines)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-xl transition-colors"
          >
            <Save size={14} />
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-3xl mx-auto space-y-8">
          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Brand Voice</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Voice description</label>
              <textarea
                value={guidelines.brand_voice ?? ''}
                onChange={(e) => updateField('brand_voice', e.target.value)}
                placeholder="Describe your brand voice in a few sentences..."
                rows={3}
                className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-2">Tone preferences by platform</label>
              <div className="space-y-2">
                {PLATFORMS.map((platform) => (
                  <div key={platform} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 capitalize w-28">{platform.replace('_', ' ')}</span>
                    <select
                      value={(guidelines.tone_preferences as Record<string, string>)?.[platform] ?? ''}
                      onChange={(e) =>
                        updateField('tone_preferences', {
                          ...(guidelines.tone_preferences as Record<string, string> ?? {}),
                          [platform]: e.target.value,
                        } as SocialGuideline['tone_preferences'])
                      }
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Use default tone</option>
                      {TONES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <GuidelineBlockEditor
              label="Content Themes"
              description="Topics and themes to regularly cover"
              blocks={toContentBlocks(guidelines.content_themes)}
              onChange={(blocks) => updateField('content_themes', fromContentBlocks(blocks))}
              placeholder="e.g. Storm damage prevention tips..."
            />
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <GuidelineBlockEditor
              label="Writing Style Rules"
              description="Specific writing guidelines for AI to follow"
              blocks={toContentBlocks(guidelines.writing_style)}
              onChange={(blocks) => updateField('writing_style', fromContentBlocks(blocks))}
              placeholder="e.g. Always use active voice..."
            />
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <GuidelineBlockEditor
              label="Image Style"
              description="Visual style preferences for AI-generated images"
              blocks={toContentBlocks(guidelines.image_style)}
              onChange={(blocks) => updateField('image_style', fromContentBlocks(blocks))}
              placeholder="e.g. Clean, professional photography..."
            />
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Words & Phrases</h3>
            <GuidelineBlockEditor
              label="Words to Avoid"
              blocks={toBlocks(guidelines.words_to_avoid as StringArray)}
              onChange={(blocks) => updateField('words_to_avoid', fromBlocks(blocks) as SocialGuideline['words_to_avoid'])}
              placeholder="e.g. cheap, lowball..."
            />
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">CTAs & Hashtags</h3>
            <GuidelineBlockEditor
              label="CTA Rules"
              description="Call-to-action guidelines"
              blocks={toBlocks(guidelines.cta_rules as StringArray)}
              onChange={(blocks) => updateField('cta_rules', fromBlocks(blocks) as SocialGuideline['cta_rules'])}
              placeholder="e.g. Always include a free estimate CTA..."
            />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Preferred hashtags</label>
                <textarea
                  value={((guidelines.hashtag_preferences as { preferred?: string[] })?.preferred ?? []).join('\n')}
                  onChange={(e) =>
                    updateField('hashtag_preferences', {
                      ...((guidelines.hashtag_preferences as { preferred?: string[]; banned?: string[] }) ?? {}),
                      preferred: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    } as SocialGuideline['hashtag_preferences'])
                  }
                  rows={4}
                  placeholder="#roofing&#10;#stormrepair"
                  className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Banned hashtags</label>
                <textarea
                  value={((guidelines.hashtag_preferences as { banned?: string[] })?.banned ?? []).join('\n')}
                  onChange={(e) =>
                    updateField('hashtag_preferences', {
                      ...((guidelines.hashtag_preferences as { preferred?: string[]; banned?: string[] }) ?? {}),
                      banned: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                    } as SocialGuideline['hashtag_preferences'])
                  }
                  rows={4}
                  placeholder="#cheap&#10;#discount"
                  className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Platform Notes</h3>
            {PLATFORMS.map((platform) => (
              <div key={platform}>
                <label className="text-xs text-slate-400 block mb-1 capitalize">{platform.replace('_', ' ')}</label>
                <input
                  value={(guidelines.platform_specific_notes as Record<string, string>)?.[platform] ?? ''}
                  onChange={(e) =>
                    updateField('platform_specific_notes', {
                      ...(guidelines.platform_specific_notes as Record<string, string> ?? {}),
                      [platform]: e.target.value,
                    } as SocialGuideline['platform_specific_notes'])
                  }
                  placeholder={`Notes for ${platform}...`}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            ))}
          </section>

          <section className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Seasonal & Competitor Rules</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Seasonal rules</label>
              <textarea
                value={guidelines.seasonal_rules ?? ''}
                onChange={(e) => updateField('seasonal_rules', e.target.value)}
                rows={3}
                placeholder="e.g. During storm season (June-Sept), prioritize emergency response content..."
                className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Competitor rules</label>
              <textarea
                value={guidelines.competitor_rules ?? ''}
                onChange={(e) => updateField('competitor_rules', e.target.value)}
                rows={3}
                placeholder="e.g. Never mention competitors by name. Focus on our unique value..."
                className="w-full resize-none bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SocialGuidelines;
