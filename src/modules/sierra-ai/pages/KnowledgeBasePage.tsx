import React, { useState } from 'react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { BookOpen, Plus, Search, Edit, Trash2, TrendingUp, Globe, Upload, HelpCircle } from 'lucide-react';
import { mockKbCollections, mockKbArticles, mockKbQaPairs, mockBehaviorProfile } from '../lib/mockData';
import { ImportFromUrlModal } from '../components/ImportFromUrlModal';
import { UploadFilesModal } from '../components/UploadFilesModal';
import { AddFAQModal } from '../components/AddFAQModal';

type ContentView = 'articles' | 'qapairs';
type EditorTab = 'article' | 'qapair' | 'behavior';

export function KnowledgeBasePage() {
  const [selectedCollection, setSelectedCollection] = useState(mockKbCollections[0].id);
  const [contentView, setContentView] = useState<ContentView>('articles');
  const [editorTab, setEditorTab] = useState<EditorTab>('article');
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);

  const filteredArticles = mockKbArticles.filter(
    (article) => article.collectionId === selectedCollection
  );

  const totalArticles = mockKbArticles.length;
  const totalQAPairs = mockKbQaPairs.length;

  return (
    <div className="space-y-6">
      {/* KB Summary Card */}
      <Card title="Knowledge Base Overview">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalArticles}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalQAPairs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Q&A Pairs</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Coverage</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Sales & Services</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Add URL
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Add Files
            </button>
            <button
              onClick={() => setShowFAQModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Add FAQ
            </button>
          </div>
        </div>
      </Card>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Collections */}
        <div className="lg:col-span-3">
          <Card title="Collections" noPadding>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {mockKbCollections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollection(collection.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedCollection === collection.id
                      ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {collection.name}
                      </div>
                    </div>
                    <StatusChip label={`${collection.articleCount}`} status="neutral" size="sm" />
                  </div>
                </button>
              ))}
              <button className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                + New Collection
              </button>
            </div>
          </Card>
        </div>

        {/* Middle: Articles / Q&A List */}
        <div className="lg:col-span-4">
          <Card noPadding>
            {/* Segmented Control */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setContentView('articles')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    contentView === 'articles'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Articles
                </button>
                <button
                  onClick={() => setContentView('qapairs')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    contentView === 'qapairs'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Q&A Pairs
                </button>
              </div>

              {/* Search */}
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
              {contentView === 'articles' ? (
                filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusChip label={article.status} status={article.status === 'live' ? 'success' : 'neutral'} />
                          <span className="text-xs text-gray-500">
                            Updated {new Date(article.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                mockKbQaPairs.map((pair) => (
                  <div
                    key={pair.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                          {pair.question}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusChip label={pair.intent} status="info" />
                          <StatusChip label={pair.priority} status={pair.priority === 'high' ? 'warning' : 'neutral'} />
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right: Editor & Preview */}
        <div className="lg:col-span-5">
          <Card noPadding>
            {/* Editor Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-1 px-4 pt-4">
                {['article', 'qapair', 'behavior'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditorTab(tab as EditorTab)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                      editorTab === tab
                        ? 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-t border-x border-gray-200 dark:border-gray-600'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'article' ? 'Article' : tab === 'qapair' ? 'Q&A Pair' : 'Agent Behavior'}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Content */}
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
              {editorTab === 'article' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Article title..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Collection
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      {mockKbCollections.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Article content that Sierra can reference..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">High Priority Fact</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Allow Verbatim</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                      Publish
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                      Save Draft
                    </button>
                  </div>
                </>
              )}

              {editorTab === 'qapair' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      User Question / Pattern
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. 'How much do you charge for a roof replacement?'"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intent
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      <option>Pricing</option>
                      <option>Service Area</option>
                      <option>Scheduling</option>
                      <option>Warranty</option>
                      <option>Insurance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sierra's Answer
                    </label>
                    <textarea
                      rows={6}
                      placeholder="The answer Sierra should provide..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Offer to book</span>
                    </label>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                      Publish
                    </button>
                    <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">
                      Save Draft
                    </button>
                  </div>
                </>
              )}

              {editorTab === 'behavior' && (
                <>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Persona & Tone</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Persona Description
                      </label>
                      <textarea
                        rows={4}
                        defaultValue={mockBehaviorProfile.personaDescription}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tone
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {mockBehaviorProfile.toneChips.map((tone) => (
                          <StatusChip key={tone} label={tone} status="info" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Operating Rules</h4>
                    <div className="space-y-2">
                      {Object.entries(mockBehaviorProfile.operatingRules).map(([key, value]) => (
                        <label key={key} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" defaultChecked={value} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Forbidden Topics & Phrases
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Do NOT Talk About
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={mockBehaviorProfile.forbiddenTopics.join(', ')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                      Save Behavior Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      <ImportFromUrlModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        collections={mockKbCollections}
        onSuccess={(result) => {
          console.log('Import successful:', result);
          setShowImportModal(false);
        }}
      />

      <UploadFilesModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        collections={mockKbCollections}
        onSuccess={(files) => {
          console.log('Files uploaded:', files);
          setShowUploadModal(false);
        }}
      />

      <AddFAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        collections={mockKbCollections}
        onSuccess={() => {
          console.log('FAQ added successfully');
          setShowFAQModal(false);
        }}
      />
    </div>
  );
}
