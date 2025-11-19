import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';

const PublicEstimator: React.FC = () => {
  const { publicUrl } = useParams();
  const [estimatorData, setEstimatorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEstimatorData();
  }, [publicUrl]);

  const fetchEstimatorData = async () => {
    if (!publicUrl) return;
    try {
      setLoading(true);
      const response = await apiService.getInstantEstimatorByPublicUrl(publicUrl);
      if (response && response.data) {
        setEstimatorData(response.data);
      } else {
        setError('Estimator not found');
      }
    } catch (error) {
      console.error('Failed to fetch estimator:', error);
      setError('Failed to load estimator');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimator...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Estimator Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{estimatorData?.name}</h1>
          <p className="text-gray-600 mb-6">Get an instant estimate for your project</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Questions ({estimatorData?.questions?.length || 0})</h2>
            {estimatorData?.questions?.map((q: any, index: number) => (
              <div key={index} className="text-left mb-2 p-2 bg-gray-50 rounded">
                {q.name || q}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Materials ({estimatorData?.materials?.length || 0})</h2>
            {estimatorData?.materials?.map((m: any, index: number) => (
              <div key={index} className="text-left mb-2 p-2 bg-gray-50 rounded">
                {m.name} - {m.description}
              </div>
            ))}
          </div>

          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicEstimator;