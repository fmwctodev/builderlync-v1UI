import React from 'react';
import { PhoneNumbersSection } from '../components/PhoneNumbersSection';
import { useAppSelector } from '../../roof-runner/store/hooks';

export function NumbersRoutingPage() {
  const { user } = useAppSelector((state) => state.auth);
  const organizationId = String(user?.id || '');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <PhoneNumbersSection organizationId={organizationId} />
      </div>
    </div>
  );
}
