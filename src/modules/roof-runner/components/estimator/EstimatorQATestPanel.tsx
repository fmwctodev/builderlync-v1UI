import { useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  SkipForward,
  AlertTriangle,
} from 'lucide-react';
import type { QATestStep, QATestResult, QATestStepStatus } from '../../types/estimatorReadiness';
import { TEST_ADDRESSES } from '../../types/estimatorReadiness';
import { runQATestSuite, type QATestContext } from '../../services/estimatorQATestRunner';

interface EstimatorQATestPanelProps {
  testContext: QATestContext;
  onClose?: () => void;
}

const statusIcons: Record<QATestStepStatus, typeof CheckCircle> = {
  pending: Clock,
  running: Clock,
  pass: CheckCircle,
  fail: XCircle,
  skipped: SkipForward,
};

const statusColors: Record<QATestStepStatus, string> = {
  pending: 'text-gray-400',
  running: 'text-blue-500',
  pass: 'text-green-500',
  fail: 'text-red-500',
  skipped: 'text-gray-400',
};

const statusBgColors: Record<QATestStepStatus, string> = {
  pending: 'bg-gray-100 dark:bg-gray-800',
  running: 'bg-blue-100 dark:bg-blue-900/30',
  pass: 'bg-green-100 dark:bg-green-900/30',
  fail: 'bg-red-100 dark:bg-red-900/30',
  skipped: 'bg-gray-100 dark:bg-gray-800',
};

function StepItem({ step }: { step: QATestStep }) {
  const Icon = statusIcons[step.status];
  const colorClass = statusColors[step.status];
  const bgClass = statusBgColors[step.status];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${bgClass}`}>
      <div className={`mt-0.5 ${step.status === 'running' ? 'animate-spin' : ''}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-gray-900 dark:text-white">
            {step.label}
          </span>
          {step.duration !== null && (
            <span className="text-xs text-gray-500">
              {step.duration}ms
            </span>
          )}
        </div>
        {step.message && (
          <p className={`text-sm mt-0.5 ${
            step.status === 'fail' ? 'text-red-600 dark:text-red-400' :
            step.status === 'pass' ? 'text-green-600 dark:text-green-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {step.message}
          </p>
        )}
      </div>
    </div>
  );
}

export function EstimatorQATestPanel({
  testContext,
  onClose,
}: EstimatorQATestPanelProps) {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<QATestStep[]>([]);
  const [result, setResult] = useState<QATestResult | null>(null);

  const handleRunTest = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    setSteps([]);

    await runQATestSuite(
      testContext,
      selectedAddressIndex,
      (step) => {
        setSteps((prev) => {
          const index = prev.findIndex((s) => s.id === step.id);
          if (index >= 0) {
            const newSteps = [...prev];
            newSteps[index] = step;
            return newSteps;
          }
          return [...prev, step];
        });
      },
      (testResult) => {
        setResult(testResult);
        setIsRunning(false);
      }
    );
  }, [testContext, selectedAddressIndex]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-900 dark:text-blue-100">
            QA Test Suite (Non-Production Only)
          </span>
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
          Automated end-to-end test for Instant Estimator flow
        </p>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Property Address
        </label>
        <select
          value={selectedAddressIndex}
          onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
          disabled={isRunning}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        >
          {TEST_ADDRESSES.map((addr, index) => (
            <option key={addr.id} value={index}>
              {addr.address}
            </option>
          ))}
        </select>

        <button
          onClick={handleRunTest}
          disabled={isRunning}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <span className="animate-spin">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </span>
              Running Test Suite...
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Run QA Test Suite
            </>
          )}
        </button>
      </div>

      {steps.length > 0 && (
        <div className="p-4 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Test Steps
          </h4>
          {steps.map((step) => (
            <StepItem key={step.id} step={step} />
          ))}
        </div>
      )}

      {result && (
        <div className={`p-4 border-t ${
          result.overallStatus === 'pass' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
          result.overallStatus === 'fail' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
          'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.overallStatus === 'pass' ? (
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              ) : result.overallStatus === 'fail' ? (
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
              <span className={`font-semibold ${
                result.overallStatus === 'pass' ? 'text-green-900 dark:text-green-100' :
                result.overallStatus === 'fail' ? 'text-red-900 dark:text-red-100' :
                'text-amber-900 dark:text-amber-100'
              }`}>
                {result.overallStatus === 'pass' ? 'All Tests Passed' :
                 result.overallStatus === 'fail' ? 'Tests Failed' :
                 'Partial Success'}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: {result.totalDuration}ms
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              {result.steps.filter((s) => s.status === 'pass').length} passed
            </span>
            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4" />
              {result.steps.filter((s) => s.status === 'fail').length} failed
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <SkipForward className="w-4 h-4" />
              {result.steps.filter((s) => s.status === 'skipped').length} skipped
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
