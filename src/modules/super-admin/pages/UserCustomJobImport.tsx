import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, UploadCloud, X } from 'lucide-react';

type ImportFileKey = 'jobs' | 'notes' | 'invoices';

const JOB_COLUMNS = [
  'Team Id',
  'Team Name',
  'Team Owner Email',
  'Job ID',
  'Job Address',
  'Current Job Workflow Stage Category',
  'Current Job Workflow Stage Name',
  'Customer Name',
  'Customer Email',
  'Customer Phone',
  'Job Lead Referral Source',
  'Job Lead Source Name',
  'Job Lead Form Name',
];

const NOTE_COLUMNS = [
  'Job Id',
  'Job Note Id',
  'Job Note User Email',
  'Job Note Created At',
  'Job Note Updated At',
  'Job Note Body',
];

const INVOICE_COLUMNS = [
  'Id',
  'Job Id',
  'Created At',
  'Due At',
  'Updated At',
  'Invoice Total Amount',
  'Invoice Paid Amount',
  'Billing Customer Email',
  'Billing Customer Name',
  'Billing Customer Phone',
  'Job Customer Email',
  'Job Customer Name',
  'Job Customer Phone',
  'Status',
];

export const UserCustomJobImport: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [invoicesFile, setInvoicesFile] = useState<File | null>(null);
  const [dragTarget, setDragTarget] = useState<ImportFileKey | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const jobInputRef = useRef<HTMLInputElement | null>(null);
  const notesInputRef = useRef<HTMLInputElement | null>(null);
  const invoicesInputRef = useRef<HTMLInputElement | null>(null);

  const pageTitle = useMemo(() => 'Import Job Data Bundle', []);

  const parseDelimitedFile = (text: string): Array<Record<string, string>> => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const delimiter =
      (lines[0].match(/\t/g) || []).length > (lines[0].match(/,/g) || []).length ? '\t' : ',';

    const parseLine = (line: string): string[] => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        const next = line[i + 1];

        if (ch === '"') {
          if (inQuotes && next === '"') {
            current += '"';
            i += 1;
          } else {
            inQuotes = !inQuotes;
          }
          continue;
        }

        if (ch === delimiter && !inQuotes) {
          values.push(current.trim());
          current = '';
          continue;
        }

        current += ch;
      }

      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = parseLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, idx) => {
        row[header] = cols[idx] || '';
      });
      return row;
    });
  };

  const parseNumber = (value: string): number => {
    const cleaned = String(value || '').replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const parseDateValue = (value: string): string | null => {
    if (!value || !value.trim()) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const toTitleCase = (value: string): string =>
    value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const normalizeHeader = (value: string) =>
    String(value || '')
      .toLowerCase()
      .replace(/\uFEFF/g, '')
      .replace(/[^a-z0-9]/g, '');

  const getValue = (row: Record<string, string>, aliases: string[]): string => {
    const aliasSet = new Set(aliases.map(normalizeHeader));
    const entry = Object.entries(row).find(([key]) => aliasSet.has(normalizeHeader(key)));
    return entry ? String(entry[1] || '').trim() : '';
  };

  const mapImportedJobRows = (rows: Array<Record<string, string>>) =>
    rows
      .map((row) => {
        const customerName = getValue(row, ['Customer Name', 'Customer', 'Name', 'Full Name']);
        const address = getValue(row, ['Job Address', 'Address', 'Customer / Address']);
        const city = getValue(row, ['City', 'Customer / City']);
        const state = getValue(row, ['State', 'Customer / State']);
        const zip = getValue(row, ['Zipcode', 'Zip', 'Postal Code', 'Customer / Zipcode']);
        const location = [address, city, state, zip].filter(Boolean).join(', ');

        const jobId = getValue(row, ['Job ID', 'Job Id']);
        const jobDetails = getValue(row, ['Job Details', 'Details']);
        const teamId = getValue(row, ['Team Id', 'Team ID']);
        const teamName = getValue(row, ['Team Name']);
        const teamOwnerEmail = getValue(row, ['Team Owner Email']);
        const jobCreatedAt = getValue(row, ['Job Created at (UTC)', 'Job Created At', 'Created At']);
        const jobAuthorEmail = getValue(row, ['Job Author Email']);
        const jobAssigneeEmail = getValue(row, ['Job Assignee Email', 'Assignee Email']);
        const resolutionStatus = getValue(row, ['Current Job Resolution Status', 'Resolution Status']);
        const workflowStageCategory = getValue(
          row,
          ['Current Job Workflow Stage Category', 'Workflow Stage Category']
        );
        const workflowStageName = getValue(row, ['Current Job Workflow Stage Name', 'Workflow Stage Name']);
        const customerEmail = getValue(row, ['Customer Email']);
        const customerPhone = getValue(row, ['Customer Phone']);
        const referralSource = getValue(row, ['Job Lead Referral Source', 'Referral Source']);
        const leadSourceName = getValue(row, ['Job Lead Source Name', 'Lead Source Name']);
        const leadFormName = getValue(row, ['Job Lead Form Name', 'Lead Form Name']);
        const closeDate = parseDateValue(getValue(row, ['Date closed']));
        const estimateTotal = parseNumber(getValue(row, ['Estimate / Total', 'Job Value', 'Total']));
        const insuranceCompany = getValue(row, ['Insurance company / Name']);

        const normalizedStage = toTitleCase(
          workflowStageName || workflowStageCategory || resolutionStatus || 'Imported'
        );

        return {
          externalJobId: jobId,
          teamId,
          teamName,
          teamOwnerEmail,
          sourceCreatedAt: jobCreatedAt,
          address: location || address || 'Unknown location',
          authorEmail: jobAuthorEmail,
          assigneeEmail: jobAssigneeEmail,
          resolutionStatus,
          workflowStageCategory,
          workflowStageName: workflowStageName || normalizedStage,
          customerName,
          customerEmail,
          customerPhone,
          referralSource,
          leadSourceName,
          leadFormName,
          estimatedValue: estimateTotal,
          closeDate,
          insuranceCompany,
          jobDetails,
          _hasContent: Boolean(customerName || jobId || location || jobDetails),
        };
      })
      .filter((job) => job._hasContent)
      .map(({ _hasContent, ...job }) => job);

  const mapImportedNoteRows = (rows: Array<Record<string, string>>) =>
    rows
      .map((row) => {
        const externalJobId = getValue(row, ['Job Id', 'Job ID']);
        const externalJobNoteId = getValue(row, ['Job Note Id', 'Job Note ID']);
        const body = getValue(row, ['Job Note Body', 'Body']);

        return {
          externalJobId,
          externalJobNoteId,
          teamId: getValue(row, ['Team Id', 'Team ID']),
          teamName: getValue(row, ['Team Name']),
          teamOwnerEmail: getValue(row, ['Team Owner Email']),
          noteUserEmail: getValue(row, ['Job Note User Email']),
          createdAt: parseDateValue(getValue(row, ['Job Note Created At', 'Created At'])),
          updatedAt:
            parseDateValue(getValue(row, ['Job Note Updated At', 'Updated At'])) ||
            parseDateValue(getValue(row, ['Job Note Created At', 'Created At'])),
          body,
          _hasContent: Boolean(externalJobId && externalJobNoteId && body),
        };
      })
      .filter((note) => note._hasContent)
      .map(({ _hasContent, ...note }) => note);

  const mapImportedInvoiceRows = (rows: Array<Record<string, string>>) =>
    rows
      .map((row) => ({
        externalInvoiceId: getValue(row, ['Id', 'Invoice Id', 'Invoice ID']),
        externalJobId: getValue(row, ['Job Id', 'Job ID']),
        assigneeUserId: getValue(row, ['Assignee User Id']),
        assigneeEmail: getValue(row, ['Assignee Email']),
        authorUserId: getValue(row, ['Author User Id']),
        authorEmail: getValue(row, ['Author Email']),
        teamId: getValue(row, ['Team Id', 'Team ID']),
        teamOwnerEmail: getValue(row, ['Team Owner Email']),
        createdAt: parseDateValue(getValue(row, ['Created At'])),
        dueAt: parseDateValue(getValue(row, ['Due At'])),
        updatedAt: parseDateValue(getValue(row, ['Updated At'])),
        adjustedTotal: parseNumber(getValue(row, ['Adjusted Total'])),
        adjustedTax: parseNumber(getValue(row, ['Adjusted Tax'])),
        invoiceTotalAmount: parseNumber(getValue(row, ['Invoice Total Amount'])),
        invoicePaidAmount: parseNumber(getValue(row, ['Invoice Paid Amount'])),
        billingCustomerId: getValue(row, ['Billing Customer Id']),
        billingCustomerEmail: getValue(row, ['Billing Customer Email']),
        billingCustomerName: getValue(row, ['Billing Customer Name']),
        billingCustomerPhone: getValue(row, ['Billing Customer Phone']),
        currency: getValue(row, ['Currency']),
        jobCustomerEmail: getValue(row, ['Job Customer Email']),
        jobCustomerName: getValue(row, ['Job Customer Name']),
        jobCustomerPhone: getValue(row, ['Job Customer Phone']),
        status: getValue(row, ['Status']),
        _hasContent: Boolean(
          getValue(row, ['Id', 'Invoice Id', 'Invoice ID']) &&
            getValue(row, ['Job Id', 'Job ID'])
        ),
      }))
      .filter((invoice) => invoice._hasContent)
      .map(({ _hasContent, ...invoice }) => invoice);

  const setFileForKey = (key: ImportFileKey, file: File | null) => {
    if (key === 'jobs') setJobFile(file);
    if (key === 'notes') setNotesFile(file);
    if (key === 'invoices') setInvoicesFile(file);
  };

  const getFileForKey = (key: ImportFileKey) => {
    if (key === 'jobs') return jobFile;
    if (key === 'notes') return notesFile;
    return invoicesFile;
  };

  const getInputRefForKey = (key: ImportFileKey) => {
    if (key === 'jobs') return jobInputRef;
    if (key === 'notes') return notesInputRef;
    return invoicesInputRef;
  };

  const handleDrop = (key: ImportFileKey, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragTarget(null);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileForKey(key, file);
  };

  const handleFilePick = (key: ImportFileKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileForKey(key, file);
  };

  const handleUpload = async () => {
    if (!userId || isUploading) return;

    if (!jobFile && !notesFile && !invoicesFile) {
      alert('Select at least one file before importing.');
      return;
    }

    try {
      setIsUploading(true);

      let customJobs: any[] = [];
      let customNotes: any[] = [];
      let customInvoices: any[] = [];

      if (jobFile) {
        const rows = parseDelimitedFile(await jobFile.text());
        if (rows.length === 0) {
          alert('No rows found in the jobs file.');
          return;
        }
        customJobs = mapImportedJobRows(rows);
        if (customJobs.length === 0) {
          alert('No valid jobs found in the jobs file.');
          return;
        }
      }

      if (notesFile) {
        const rows = parseDelimitedFile(await notesFile.text());
        if (rows.length === 0) {
          alert('No rows found in the job notes file.');
          return;
        }
        customNotes = mapImportedNoteRows(rows);
        if (customNotes.length === 0) {
          alert('No valid notes found in the job notes file.');
          return;
        }
      }

      if (invoicesFile) {
        const rows = parseDelimitedFile(await invoicesFile.text());
        if (rows.length === 0) {
          alert('No rows found in the invoices file.');
          return;
        }
        customInvoices = mapImportedInvoiceRows(rows);
        if (customInvoices.length === 0) {
          alert('No valid invoices found in the invoices file.');
          return;
        }
      }

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Admin token missing. Please login again.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/import/custom-jobs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ customJobs, customNotes, customInvoices }),
        }
      );

      const result = await response.json();
      if (!response.ok || !result?.success) {
        alert(result?.message || 'Failed to import job data bundle');
        return;
      }

      const summary = [
        `Jobs imported: ${result?.data?.imported ?? customJobs.length}`,
        `Job duplicates skipped: ${result?.data?.duplicatesSkipped ?? 0}`,
        `Notes imported: ${result?.data?.notesImported ?? customNotes.length}`,
        `Notes duplicate skipped: ${result?.data?.notesDuplicatesSkipped ?? 0}`,
        `Notes unmatched job skipped: ${result?.data?.notesSkippedNoJob ?? 0}`,
        `Invoices imported: ${result?.data?.invoicesImported ?? customInvoices.length}`,
        `Invoices duplicate skipped: ${result?.data?.invoicesDuplicatesSkipped ?? 0}`,
        `Invoices unmatched job skipped: ${result?.data?.invoicesSkippedNoJob ?? 0}`,
        `Contacts created: ${result?.data?.contactsCreated ?? 0}`,
        `Contacts matched: ${result?.data?.contactsMatched ?? 0}`,
        `Contacts updated: ${result?.data?.contactsUpdated ?? 0}`,
      ].join('\n');

      alert(`${result?.message || 'Custom job bundle import completed.'}\n\n${summary}`);
      setJobFile(null);
      setNotesFile(null);
      setInvoicesFile(null);
    } catch (error) {
      alert('Failed to process import bundle.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderUploadCard = (
    key: ImportFileKey,
    title: string,
    subtitle: string,
    columns: string[]
  ) => {
    const file = getFileForKey(key);
    const inputRef = getInputRefForKey(key);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          </div>
          {file && (
            <button
              onClick={() => setFileForKey(key, null)}
              className="text-gray-400 hover:text-gray-600"
              title="Clear selected file"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {columns.map((column) => (
            <span
              key={`${key}-${column}`}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
            >
              {column}
            </span>
          ))}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFilePick(key, e)}
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragTarget(key);
          }}
          onDragLeave={() => setDragTarget((current) => (current === key ? null : current))}
          onDrop={(e) => handleDrop(key, e)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragTarget === key
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
          }`}
        >
          <UploadCloud className="w-8 h-8 mx-auto text-gray-500 mb-2" />
          <p className="text-sm font-medium text-gray-800">
            {file ? file.name : `Upload ${title}`}
          </p>
          <p className="text-xs text-gray-500 mt-1">CSV or tab-delimited export</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/super-admin/users')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileSpreadsheet className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>
        <p className="text-gray-600">
          Import jobs, job notes, and invoices for user{' '}
          <span className="font-medium text-gray-900">{userId}</span> in one flow.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">How This Bundle Works</h2>
        <p className="text-sm text-gray-600">
          Upload one or more files below. Jobs are imported first, then notes and invoices attach
          through the external `Job Id`. If you skip the jobs file, the notes and invoices will only
          import when those external job ids already exist from a previous custom import.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {renderUploadCard(
          'jobs',
          'Jobs CSV',
          'Creates or matches contacts, creates jobs, and links customer_id.',
          JOB_COLUMNS
        )}
        {renderUploadCard(
          'notes',
          'Job Notes CSV',
          'Imports note HTML and links each note to the matched job customer contact.',
          NOTE_COLUMNS
        )}
        {renderUploadCard(
          'invoices',
          'Invoices CSV',
          'Imports invoices and links them to the matched job and customer.',
          INVOICE_COLUMNS
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => navigate('/super-admin/users')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={() => void handleUpload()}
          disabled={isUploading || (!jobFile && !notesFile && !invoicesFile)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Importing...' : 'Run Unified Import'}
        </button>
      </div>
    </div>
  );
};
