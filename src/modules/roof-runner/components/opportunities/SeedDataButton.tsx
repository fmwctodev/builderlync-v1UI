import { useState, useEffect } from 'react';
import { supabase } from '../../../../shared/lib/supabase';

export function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setIsReady(true);
    };
    getUser();
  }, []);

  const handleSeedData = async () => {
    if (!userId) {
      setMessage('⚠ Authentication required');
      return;
    }

    setLoading(true);
    setMessage('Creating pipelines and opportunities...');

    try {
      const { data, error } = await supabase.rpc('seed_dummy_opportunities_for_user', {
        p_user_id: userId
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        const result = data as { success: boolean; message: string };
        if (result.success) {
          setMessage('✓ ' + result.message);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setMessage('⚠ ' + result.message);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage('✗ Failed: ' + (error as Error).message);
      setLoading(false);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleSeedData}
        disabled={loading || !userId}
        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {loading ? 'Seeding Data...' : 'Seed Dummy Data'}
      </button>
      {message && (
        <span className={`text-sm font-medium ${message.startsWith('✓') ? 'text-green-600 dark:text-green-400' : message.startsWith('⚠') ? 'text-yellow-600 dark:text-yellow-400' : message.startsWith('Creating') ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
          {message}
        </span>
      )}
    </div>
  );
}
