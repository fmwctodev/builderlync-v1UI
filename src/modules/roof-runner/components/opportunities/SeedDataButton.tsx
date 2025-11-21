import { useState } from 'react';
import { supabase } from '../../../../shared/lib/supabase';

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.rpc('seed_dummy_opportunities');

      if (error) throw error;

      if (data && typeof data === 'object') {
        const result = data as { success: boolean; message: string };
        if (result.success) {
          setMessage('✓ ' + result.message);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setMessage('⚠ ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage('✗ Failed to seed data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSeedData}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Seeding Data...' : 'Seed Dummy Data'}
      </button>
      {message && (
        <span className={`text-sm ${message.startsWith('✓') ? 'text-green-600' : message.startsWith('⚠') ? 'text-yellow-600' : 'text-red-600'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
