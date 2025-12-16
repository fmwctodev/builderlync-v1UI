import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Table as TableIcon, Upload, AlertCircle, CheckCircle, Loader, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import { knowledgeBaseService } from '../services';
import type { ColumnDefinition } from '../lib/database.types';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Array<{ id: string; name: string }>;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

interface ParsedColumn {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  selected: boolean;
  sampleValues: string[];
}

export function AddTableModal({
  isOpen,
  onClose,
  collections,
  onSuccess,
}: AddTableModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [columns, setColumns] = useState<ParsedColumn[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  const detectColumnType = (values: string[]): 'text' | 'number' | 'date' | 'boolean' => {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');

    if (nonEmptyValues.length === 0) return 'text';

    const numberCount = nonEmptyValues.filter(v => !isNaN(Number(v))).length;
    const booleanCount = nonEmptyValues.filter(v =>
      v.toLowerCase() === 'true' || v.toLowerCase() === 'false' || v === '0' || v === '1'
    ).length;
    const dateCount = nonEmptyValues.filter(v => !isNaN(Date.parse(v))).length;

    const total = nonEmptyValues.length;

    if (numberCount / total > 0.8) return 'number';
    if (booleanCount / total > 0.8) return 'boolean';
    if (dateCount / total > 0.8) return 'date';

    return 'text';
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0] as string[];
          const dataRows = results.data.slice(1).filter(row =>
            Array.isArray(row) && row.some(cell => cell !== '')
          );

          const parsedColumns: ParsedColumn[] = headers.map((header, index) => {
            const columnValues = dataRows.map(row => (row as any)[index]);
            const sampleValues = columnValues.slice(0, 3).filter(v => v !== null && v !== undefined && v !== '');

            return {
              name: header,
              type: detectColumnType(columnValues),
              selected: true,
              sampleValues
            };
          });

          setColumns(parsedColumns);
          setRawData(dataRows.map(row => {
            const obj: Record<string, any> = {};
            headers.forEach((header, index) => {
              obj[header] = (row as any)[index];
            });
            return obj;
          }));
          setCurrentStep(2);
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setError('Please upload a CSV file');
      return;
    }

    const file = acceptedFiles[0];

    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50 MB limit');
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv') {
      setError('Please upload a CSV file');
      return;
    }

    setSelectedFile(file);
    setTableName(file.name.replace('.csv', ''));
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    disabled: loading,
    maxFiles: 1,
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 1 && selectedFile) {
      parseCSV(selectedFile);
    } else if (currentStep === 2) {
      const selectedColumns = columns.filter(c => c.selected);
      if (selectedColumns.length === 0) {
        setError('Please select at least one column');
        return;
      }
      setError('');
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!tableName.trim()) {
      setError('Please enter a table name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedColumns = columns.filter(c => c.selected);
      const columnDefs: ColumnDefinition[] = selectedColumns.map(col => ({
        name: col.name,
        type: col.type,
        selected: true
      }));

      const filteredRows = rawData.map(row => {
        const filtered: Record<string, any> = {};
        selectedColumns.forEach(col => {
          filtered[col.name] = row[col.name];
        });
        return filtered;
      });

      await knowledgeBaseService.createTable({
        name: tableName.trim(),
        description: tableDescription.trim(),
        source_file_name: selectedFile!.name,
        column_definitions: columnDefs,
        collection_id: selectedCollection || undefined,
        status: 'published'
      }, filteredRows);

      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save table');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setCurrentStep(1);
    setSelectedFile(null);
    setTableName('');
    setTableDescription('');
    setSelectedCollection('');
    setColumns([]);
    setRawData([]);
    setError('');
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  const toggleColumn = (index: number) => {
    setColumns(prev => prev.map((col, i) =>
      i === index ? { ...col, selected: !col.selected } : col
    ));
  };

  const updateColumnType = (index: number, type: 'text' | 'number' | 'date' | 'boolean') => {
    setColumns(prev => prev.map((col, i) =>
      i === index ? { ...col, type } : col
    ));
  };

  const selectedCount = columns.filter(c => c.selected).length;
  const selectedRowCount = rawData.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={handleClose} />

        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <TableIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Table Upload
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a CSV file to train your bot with product details or other structured data.
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Upload File</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Column Selection</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Summary</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {currentStep === 1 && (
              <>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-2">
                      {isDragActive ? 'Drop the file here' : 'Click to upload'}{' '}
                      {!isDragActive && <span className="text-red-600 dark:text-red-400">or drag and drop</span>}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CSV file only (max 50 MB)
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <TableIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    placeholder="Enter a name for your table source"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    required
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Select Columns
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedCount} of {columns.length} columns selected
                    </p>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {columns.map((column, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={column.selected}
                          onChange={() => toggleColumn(index)}
                          className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {column.name}
                            </p>
                            <select
                              value={column.type}
                              onChange={(e) => updateColumnType(index, e.target.value as any)}
                              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="boolean">Boolean</option>
                            </select>
                          </div>
                          {column.sampleValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {column.sampleValues.map((value, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                                >
                                  {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Table Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={tableDescription}
                      onChange={(e) => setTableDescription(e.target.value)}
                      placeholder="Add a description for this table"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                    />
                  </div>

                  {collections.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Collection (Optional)
                      </label>
                      <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">None (General)</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                      Summary
                    </h4>
                    <div className="text-sm text-red-800 dark:text-red-300 space-y-1">
                      <p><strong>File:</strong> {selectedFile?.name}</p>
                      <p><strong>Columns:</strong> {selectedCount}</p>
                      <p><strong>Rows:</strong> {selectedRowCount}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Table saved successfully!
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as Step)}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedFile || loading}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Table'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
