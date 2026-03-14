import React, { useState } from 'react';
import { Globe, Plus, ChevronRight, X } from 'lucide-react';
import { LanguageConfig } from '../services/agentsApi';

interface LanguageSectionProps {
  languages: LanguageConfig[];
  onChange: (languages: LanguageConfig[]) => void;
}

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  // { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  // { code: 'fr', name: 'French', flag: '🇫🇷' },
  // { code: 'de', name: 'German', flag: '🇩🇪' },
  // { code: 'it', name: 'Italian', flag: '🇮🇹' },
  // { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  // { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  // { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  // { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  // { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  // { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  // { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  // { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  // { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

export function LanguageSection({ languages, onChange }: LanguageSectionProps) {
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const defaultLanguage = languages.find((l) => l.isDefault);

  const handleAddLanguage = (lang: { code: string; name: string; flag: string }) => {
    const newLanguage: LanguageConfig = {
      code: lang.code,
      name: lang.name,
      isDefault: languages.length === 0,
    };
    onChange([...languages, newLanguage]);
    setShowLanguageSelector(false);
  };

  const handleRemoveLanguage = (code: string) => {
    const updatedLanguages = languages.filter((l) => l.code !== code);
    if (updatedLanguages.length > 0 && !updatedLanguages.some((l) => l.isDefault)) {
      updatedLanguages[0].isDefault = true;
    }
    onChange(updatedLanguages);
  };

  const handleSetDefault = (code: string) => {
    const updatedLanguages = languages.map((l) => ({
      ...l,
      isDefault: l.code === code,
    }));
    onChange(updatedLanguages);
  };

  const getLanguageFlag = (code: string) => {
    return AVAILABLE_LANGUAGES.find((l) => l.code === code)?.flag || '🌐';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Language</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose the default and additional languages the agent will communicate in.
        </p>
      </div>

      <div className="space-y-2">
        {languages.map((language) => (
          <div
            key={language.code}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 group"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getLanguageFlag(language.code)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{language.name}</span>
                  {language.isDefault && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{language.code.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!language.isDefault && (
                <button
                  onClick={() => handleSetDefault(language.code)}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Set as default
                </button>
              )}
              {languages.length > 1 && (
                <button
                  onClick={() => handleRemoveLanguage(language.code)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {languages.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No languages selected. Add a language to get started.
          </div>
        )}

        <button
          onClick={() => setShowLanguageSelector(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:border-red-500 dark:hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add additional languages
        </button>
      </div>

      {showLanguageSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Language</h3>
                <button
                  onClick={() => setShowLanguageSelector(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-2">
                {AVAILABLE_LANGUAGES.filter((l) => !languages.some((lang) => lang.code === l.code)).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleAddLanguage(lang)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{lang.flag}</div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{lang.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{lang.code.toUpperCase()}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}

                {AVAILABLE_LANGUAGES.filter((l) => !languages.some((lang) => lang.code === l.code)).length === 0 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    All available languages have been added.
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
