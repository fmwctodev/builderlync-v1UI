import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const EagleViewCallback: React.FC = () => {
    const isError = window.location.pathname.includes('/error');
    const urlParams = new URLSearchParams(window.location.search);
    const errorMessage = urlParams.get('message');

    useEffect(() => {
        // Redirect to settings after 3 seconds
        const timer = setTimeout(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const orgSlug = user.companySlug || localStorage.getItem('currentOrganizationSlug') || 'default';
            window.location.href = `/org/${orgSlug}/settings/integrations`;
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-red-900/20">
                        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Connection Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {errorMessage || 'There was an error connecting to EagleView.'} Redirecting to settings...
                    </p>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 text-center max-w-md">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/20">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    EagleView Connected Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your EagleView integration has been updated. Redirecting to settings...
                </p>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            </div>
        </div>
    );
};

export default EagleViewCallback;
