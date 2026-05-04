import React, { useState } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';
import { contactModulesApi } from '../../../../shared/store/services/contactModulesApi';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contactId: number;
}

export function DocumentModal({ isOpen, onClose, onSuccess, contactId }: DocumentModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [section, setSection] = useState<'internal' | 'sent' | 'received'>('internal');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('section', section);

        try {
            await contactModulesApi.uploadDocument(contactId, formData);
            onSuccess();
            onClose();
            setFile(null);
            setDescription('');
        } catch (error) {
            console.error('Failed to upload document:', error);
            alert('Failed to upload document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold dark:text-white">Upload Document</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors ${file ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                            required={!file}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center"
                        >
                            {file ? (
                                <>
                                    <FileIcon className="w-12 h-12 text-primary-600 mb-2" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center break-all px-4">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        Click to change file
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Click to select a file
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">
                                        PDF, DOC, DOCX, Images (up to 5MB)
                                    </span>
                                </>
                            )}
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="What is this document about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Section</label>
                        <select
                            value={section}
                            onChange={(e) => setSection(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="internal">Internal Only</option>
                            <option value="sent">Sent to Customer</option>
                            <option value="received">Received from Customer</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
