import { useState, useEffect } from 'react';
import {
  X,
  Search,
  ChevronDown,
  ChevronRight,
  Heart,
  Grid,
  List,
  Filter,
  MessageSquare,
  Phone,
  Briefcase,
  Home,
  Building,
  Users,
  UserCheck,
  Star
} from 'lucide-react';
import { workflowTemplateApi, WorkflowTemplate, WorkflowTemplateCategory } from '../../../shared/store/services/workflowTemplateApi';

interface WorkflowTemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkflowTemplate) => void;
}

const iconMap: Record<string, any> = {
  MessageSquare,
  Phone,
  Briefcase,
  Home,
  Building,
  Users,
  UserCheck,
  Star
};

export default function WorkflowTemplateLibraryModal({
  isOpen,
  onClose,
  onSelectTemplate
}: WorkflowTemplateLibraryModalProps) {
  const [activeSection, setActiveSection] = useState('All Templates');
  const [showCategories, setShowCategories] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('Most Recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<WorkflowTemplateCategory[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, selectedCategories, searchQuery, activeSection]);

  const loadData = async () => {
    try {
      setLoading(true);
      const categoriesData = await workflowTemplateApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const filters: any = {};

      if (selectedCategories.length > 0) {
        const categoryIds = categories
          .filter(cat => selectedCategories.includes(cat.name))
          .map(cat => cat.id);
        if (categoryIds.length > 0) {
          filters.categoryId = categoryIds[0];
        }
      }

      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      if (activeSection === 'Favorites') {
        filters.isFavorite = true;
      }

      const templatesData = await workflowTemplateApi.getTemplates(filters);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleToggleFavorite = async (templateId: string, currentFavorite: boolean) => {
    try {
      await workflowTemplateApi.toggleFavorite(templateId, !currentFavorite);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getGradientStyle = (colors: string[]) => {
    if (colors.length >= 2) {
      return {
        background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
      };
    }
    return {
      background: colors[0] || '#DC2626'
    };
  };

  const getCategoryCount = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    if (!category) return 0;
    return templates.filter(t => t.category_id === category.id).length;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Template Library</h2>

          {/* Workflows Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Workflows</h3>
            <div className="space-y-1">
              {['All Templates', 'My Templates', 'Shared with Me', 'Favorites'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {section === 'Favorites' && <Heart className="w-4 h-4 inline mr-2" />}
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          <div className="mb-6">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Browse Categories</h3>
              {showCategories ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {showCategories && (
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => toggleCategory(category.name)}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                    <span>{category.name}</span>
                    <span className="text-gray-400">({getCategoryCount(category.name)})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <button
              onClick={() => setShowTags(!showTags)}
              className="flex items-center justify-between w-full mb-3"
            >
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
              {showTags ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a Template"
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 w-80 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {sortBy}
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-1">
                      {['Most Recent', 'Name A-Z', 'Name Z-A', 'Most Used'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option);
                            setShowSortDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${
                    viewMode === 'list'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {templates.length} Templates
          </p>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 dark:text-gray-400">Loading templates...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No templates found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}>
              {templates.map((template) => {
                const IconComponent = template.icon ? iconMap[template.icon] : MessageSquare;
                return (
                  <div
                    key={template.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Gradient Header */}
                      <div
                        className="h-40 relative flex items-center justify-center"
                        style={getGradientStyle(template.gradient_colors)}
                      >
                        <button
                          onClick={() => handleToggleFavorite(template.id, template.is_favorite)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              template.is_favorite
                                ? 'fill-white text-white'
                                : 'text-white'
                            }`}
                          />
                        </button>
                        {IconComponent && (
                          <IconComponent className="w-16 h-16 text-white opacity-90" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {template.description || 'No description'}
                        </p>

                        {/* Actions (shown on hover) */}
                        {hoveredTemplate === template.id && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => onSelectTemplate(template)}
                              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                            >
                              Choose Template
                            </button>
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              Preview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
