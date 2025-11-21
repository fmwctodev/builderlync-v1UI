import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Lock, GripVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../store/services/api';

const ManageQuestions: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [selectedQuestions, setSelectedQuestions] = useState([
    'Get started',
    'Address & slope',
    'Building type',
    'Current material',
    'Desired material',
    'Timeline',
    'Contact form'
  ]);

  const allPossibleQuestions = [
    'Get started',
    'Address & slope', 
    'Building type',
    'Current material',
    'Desired material',
    'Timeline',
    'Contact form',
    'Multi-story building',
    'Roof age',
    'Leaks and damages',
    'Insurance claim',
    'Solar',
    'Project details',
    'Financing'
  ];

  const availableQuestions = allPossibleQuestions.filter(q => !selectedQuestions.includes(q));

  const addQuestion = (question: string) => {
    if (!selectedQuestions.includes(question)) {
      setSelectedQuestions([...selectedQuestions, question]);
    }
    setShowDropdown(false);
  };

  const removeQuestion = (question: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q !== question));
  };

  const isLocked = (question: string) => {
    return ['Get started', 'Contact form'].includes(question);
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const fetchQuestions = async () => {
    if (!id) return;
    try {
      const response = await apiService.getInstantEstimator(parseInt(id));
      if (response?.data?.questions) {
        const savedQuestions = response.data.questions.map((q: any) => q.name || q);
        if (savedQuestions.length > 0) {
          setSelectedQuestions(savedQuestions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const saveQuestions = async () => {
    if (!id) return;
    try {
      console.log('Saving questions for ID:', id);
      const questionsData = selectedQuestions.map((name, index) => ({
        id: (index + 1).toString(),
        name,
        selected: true
      }));
      console.log('Questions data:', questionsData);
      const result = await apiService.updateInstantEstimatorQuestions(parseInt(id), questionsData);
      console.log('Save result:', result);
      alert('Questions saved successfully!');
    } catch (error) {
      console.error('Failed to save questions:', error);
      alert('Failed to save questions: ' + error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/instant-estimator/${id}/manage`)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage questions</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Choose which questions you'd like to be displayed in your instant estimator</p>
          </div>
        </div>
        <button onClick={saveQuestions} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg">
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Selected Questions */}
        <div className="w-1/2 p-6 border-r border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            {selectedQuestions.map((question, index) => (
              <div key={question} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <GripVertical className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-gray-900 dark:text-white">{question}</span>
                {question === 'Address & slope' && (
                  <div className="text-xs text-gray-500">
                    <div>Address</div>
                    <div>Slope selection</div>
                  </div>
                )}
                {isLocked(question) ? (
                  <Lock className="w-4 h-4 text-gray-400" />
                ) : (
                  <button
                    onClick={() => removeQuestion(question)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Add Button */}
            <div className="relative">
              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {availableQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => addQuestion(question)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full border-2 border-dashed border-blue-300 dark:border-primary-600 rounded-lg p-6 text-center text-primary-600 hover:text-primary-700 hover:border-blue-400"
              >
                <Plus className="w-6 h-6 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 p-6 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-xs text-gray-500">Logo</div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Get a <span className="underline">free</span> instant estimate
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use satellite imagery to measure your roof and provide an instant estimate for your roof replacement
              </p>
            </div>
            
            <button className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg mb-4">
              Get started →
            </button>
            
            <div className="text-xs text-gray-400 text-center">
              Powered by BuilderLync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;