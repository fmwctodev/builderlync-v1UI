import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Plus, Save, Loader2 } from 'lucide-react';
import { brandBoardService, BrandColor, type BrandBoard } from '../../../../shared/services/brandBoardService';

const BrandBoard: React.FC = () => {
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBrandBoard();
  }, []);

  const loadBrandBoard = async () => {
    try {
      setLoading(true);
      const response = await brandBoardService.getBrandBoard();
      if (response.success && response.data) {
        const data = response.data;
        setWebsite(data.website || '');
        setDescription(data.description || '');
        setBrandVoice(data.brand_voice || '');
        setTargetAudience(data.target_audience || '');
        setLogoPreview(data.logo_url || null);
        setColors(data.brand_colors || []);
      }
    } catch (err) {
      console.error('Error loading brand board:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo file size must be less than 5MB');
        return;
      }
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addColor = () => {
    const newColor: BrandColor = {
      id: Date.now().toString(),
      color: '#000000',
      name: `Color ${colors.length + 1}`
    };
    setColors([...colors, newColor]);
  };

  const updateColor = (id: string, field: 'color' | 'name', value: string) => {
    setColors(colors.map(color => 
      color.id === id ? { ...color, [field]: value } : color
    ));
  };

  const removeColor = (id: string) => {
    if (colors.length > 1) {
      setColors(colors.filter(color => color.id !== id));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const brandBoardData: Partial<BrandBoard> = {
        website,
        description,
        brand_voice: brandVoice,
        target_audience: targetAudience,
        brand_colors: colors
      };
      
      const response = await brandBoardService.saveBrandBoard(brandBoardData, logo || undefined);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        // Reload to get updated data including new logo URL
        await loadBrandBoard();
      } else {
        setError(response.message || 'Failed to save brand board');
      }
    } catch (err) {
      setError('Failed to save brand board');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Brand board saved successfully!</p>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Brand Board</h2>
        <p className="text-gray-600 dark:text-gray-400">Define your brand identity for AI and creative assets</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Website</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              pattern="https?://.*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            {website && !website.match(/^https?:\/\/.+/) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid URL starting with http:// or https://</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Voice & Tone</label>
            <textarea
              rows={3}
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="Describe your brand's personality, tone of voice, and communication style..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
            <textarea
              rows={3}
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Describe your ideal customers and target market..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Brand Assets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Upload</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center dark:border-gray-600 relative">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-32 mx-auto" />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upload your logo</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Choose File
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Max file size: 5MB. Supported formats: JPG, PNG, SVG</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand Colors</label>
              <button
                onClick={addColor}
                className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <Plus className="w-4 h-4" />
                <span>Add Color</span>
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {colors.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No colors added yet. Click "Add Color" to get started.</p>
              ) : (
                colors.map((color) => (
                  <div key={color.id} className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      style={{ backgroundColor: color.color }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'color';
                        input.value = color.color;
                        input.onchange = (e) => updateColor(color.id!, 'color', (e.target as HTMLInputElement).value);
                        input.click();
                      }}
                    ></div>
                    <input
                      type="text"
                      value={color.color}
                      onChange={(e) => updateColor(color.id!, 'color', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColor(color.id!, 'name', e.target.value)}
                      placeholder="Color name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      onClick={() => removeColor(color.id!)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Brand Board'}</span>
        </button>
      </div>
    </div>
  );
};

export default BrandBoard;