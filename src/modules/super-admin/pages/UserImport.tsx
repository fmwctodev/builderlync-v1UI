import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UploadCloud, X } from 'lucide-react';

interface ImportSource {
  id: string;
  name: string;
  description: string;
}

type ImportEntity = 'contacts' | 'jobs' | 'opportunities';

const SOURCES: ImportSource[] = [
  {
    id: 'roofr',
    name: 'Roofr',
    description: 'Import leads, jobs, and customer data from Roofr.',
  },
  {
    id: 'rooflink',
    name: 'Rooflink',
    description: 'Import leads, jobs, and customer data from Rooflink.',
  },
  {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    description: 'Import contacts, opportunities, and pipeline details.',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Import CRM contacts, companies, and deal records.',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Import accounts, contacts, and opportunity data.',
  },
];

export const UserImport: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [selectedEntityBySource, setSelectedEntityBySource] = useState<Record<string, ImportEntity>>({});
  const [activeSource, setActiveSource] = useState<ImportSource | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const storageKey = useMemo(() => `super_admin_import_selection_${userId || 'unknown'}`, [userId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, ImportEntity>;
        setSelectedEntityBySource(parsed);
      }
    } catch {
      setSelectedEntityBySource({});
    }
  }, [storageKey]);

  const persistSelection = (next: Record<string, ImportEntity>) => {
    setSelectedEntityBySource(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // no-op
    }
  };

  const handleEntityChange = (sourceId: string, entity: ImportEntity) => {
    persistSelection({
      ...selectedEntityBySource,
      [sourceId]: entity,
    });
  };

  const handleImportClick = (source: ImportSource) => {
    setActiveSource(source);
    setActiveFile(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setActiveFile(file);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setActiveFile(file);
  };

  const handleUpload = () => {
    void uploadSelectedFile();
  };

  const parseDelimitedFile = (text: string): Array<Record<string, string>> => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length < 2) return [];

    const delimiter = (lines[0].match(/\t/g) || []).length > (lines[0].match(/,/g) || []).length ? '\t' : ',';

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

  const mapImportedJobRows = (rows: Array<Record<string, string>>, sourceName: string) =>
    rows.map((row) => {
      const firstName = (row['Customer / First name'] || '').trim();
      const lastName = (row['Customer / Last name'] || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();
      const address = (row['Address'] || row['Customer / Address'] || '').trim();
      const city = (row['City'] || row['Customer / City'] || '').trim();
      const state = (row['State'] || row['Customer / State'] || '').trim();
      const zip = (row['Zipcode'] || row['Customer / Zipcode'] || '').trim();
      const location = [address, city, state, zip].filter(Boolean).join(', ');

      const statusLabel = (row['Status label'] || row['Lead status label'] || 'Imported').trim();
      const total = parseNumber(row['Estimate / Total']);
      const source = (row['Customer / Lead source'] || sourceName || 'Import').trim();
      const closeDate = parseDateValue(row['Date closed']);
      const insuranceCompany = (row['Insurance company / Name'] || '').trim();
      const fullUrl = (row['Full url'] || '').trim();
      const lastNote = (row['Last note message'] || '').trim();
      const rep = (row['Customer / Rep'] || '').trim();

      const detailsParts = [
        fullUrl ? `URL: ${fullUrl}` : '',
        lastNote ? `Last note: ${lastNote}` : '',
        rep ? `Rep: ${rep}` : '',
      ].filter(Boolean);

      const normalizedStage = statusLabel ? toTitleCase(statusLabel) : 'Imported';

      return {
        name: fullName ? `${fullName} - ${normalizedStage}` : `Imported Job - ${normalizedStage}`,
        location: location || 'Unknown location',
        workflowStages: normalizedStage,
        jobValue: total,
        source,
        closeDate,
        insuranceCompany,
        details: detailsParts.join(' | '),
      };
    });

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

  const mapImportedContactRows = (rows: Array<Record<string, string>>, sourceName: string) =>
    rows
      .map((row) => {
        const firstName = getValue(row, ['First Name', 'firstName', 'first_name']);
        const lastName = getValue(row, ['Last Name', 'lastName', 'last_name']);
        const fullNameFromSingleCol = getValue(row, ['Full Name', 'Name', 'contactName']);
        const fullName = `${firstName} ${lastName}`.trim() || fullNameFromSingleCol;

        const address1 = getValue(row, ['Address', 'Address 1', 'Street', 'Street Address', 'address1']);
        const city = getValue(row, ['City']);
        const state = getValue(row, ['State', 'Province']);
        const zip = getValue(row, ['Zip', 'Zipcode', 'Postal Code', 'postalCode']);
        const country = getValue(row, ['Country']);
        const address = [address1, city, state, zip, country].filter(Boolean).join(', ');

        const email = getValue(row, ['Email', 'emailAddress']);
        const phone = getValue(row, ['Phone', 'Phone Number', 'Mobile', 'Cell', 'cellPhone']);
        const company = getValue(row, ['Company Name', 'Company', 'Organization']);
        const tags = getValue(row, ['Tags', 'Tag']);
        const leadSource = getValue(row, ['Lead Source', 'Source']);
        const labelOrRole = [tags, leadSource || sourceName].filter(Boolean).join(' | ');

        return {
          fullName: fullName || '',
          email: email || '',
          phone: phone || '',
          company: company || '',
          address: address || '',
          type: 'Lead',
          labelOrRole: labelOrRole || sourceName,
        };
      })
      .filter((c) => c.fullName);

  const mapImportedOpportunityRows = (rows: Array<Record<string, string>>, sourceName: string) =>
    rows
      .map((row) => {
        const firstName = getValue(row, ['First Name', 'firstName', 'first_name']);
        const lastName = getValue(row, ['Last Name', 'lastName', 'last_name']);
        const fullName =
          `${firstName} ${lastName}`.trim() ||
          getValue(row, ['Contact Name', 'Customer Name', 'Full Name', 'Name']);

        const opportunityName =
          getValue(row, ['Opportunity Name', 'Opportunity', 'Name']) ||
          (fullName ? `${fullName} Opportunity` : '');

        const leadValueRaw = getValue(row, ['Lead Value', 'Value', 'Amount', 'Estimate / Total']);
        const leadValue = Number(String(leadValueRaw || '').replace(/[^0-9.-]/g, ''));
        const engagementRaw = getValue(row, ['Engagement Score']);
        const tagsText = getValue(row, ['Tags', 'Tag']);

        return {
          opportunity_name: opportunityName,
          contact_name: fullName || '',
          contact_phone: getValue(row, ['Phone', 'Phone Number', 'Mobile', 'Cell']),
          contact_email: getValue(row, ['Email', 'Email Address']),
          stage_name: getValue(row, ['Stage', 'Pipeline Stage', 'Lead status label', 'Status label']),
          stage_id: getValue(row, ['Pipeline Stage ID', 'stageId']),
          value: Number.isFinite(leadValue) ? leadValue : 0,
          source: getValue(row, ['Source', 'Lead Source', 'Customer / Lead source']) || sourceName,
          status: (getValue(row, ['Status']) || 'open').toLowerCase(),
          tags: tagsText ? tagsText.split(/[|,]/).map((t) => t.trim()).filter(Boolean) : [],
          notes: getValue(row, ['Notes', 'Last note message', 'Description']),
          engagement_score: Number.isFinite(Number(engagementRaw)) ? Number(engagementRaw) : 0,
          project_type: getValue(row, ['Project Type', 'Type']),
          budget_range: getValue(row, ['Budget Range']),
          timeline: getValue(row, ['Timeline']),
          contact_id: getValue(row, ['Contact ID', 'contactId']),
          lost_reason_id: getValue(row, ['lost reason ID', 'lostReasonId']),
          lost_reason_name: getValue(row, ['lost reason name', 'lostReasonName']),
          created_at: parseDateValue(getValue(row, ['Created on', 'Date created'])) || new Date().toISOString(),
          updated_at: parseDateValue(getValue(row, ['Updated on', 'Date last edited'])) || new Date().toISOString(),
        };
      })
      .filter((o) => o.opportunity_name);

  const uploadSelectedFile = async () => {
    if (!activeSource || !activeFile || !userId) return;
    const entity = selectedEntityBySource[activeSource.id] || 'contacts';

    try {
      const text = await activeFile.text();
      const rows = parseDelimitedFile(text);
      if (rows.length === 0) {
        alert('No rows found in file.');
        return;
      }

      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        alert('Admin token missing. Please login again.');
        return;
      }

      let response: Response;
      let expectedCount = 0;
      if (entity === 'jobs') {
        const jobs = mapImportedJobRows(rows, activeSource.name);
        expectedCount = jobs.length;
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/import/jobs`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ jobs }),
          }
        );
      } else if (entity === 'contacts') {
        const contacts = mapImportedContactRows(rows, activeSource.name);
        if (contacts.length === 0) {
          alert('No valid contacts found in file.');
          return;
        }
        expectedCount = contacts.length;
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/import/contacts`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ contacts }),
          }
        );
      } else {
        const opportunities = mapImportedOpportunityRows(rows, activeSource.name);
        if (opportunities.length === 0) {
          alert('No valid opportunities found in file.');
          return;
        }
        expectedCount = opportunities.length;
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/auth/admin/users/${userId}/import/opportunities`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ opportunities }),
          }
        );
      }

      const result = await response.json();
      if (!response.ok || !result?.success) {
        alert(result?.message || `Failed to import ${entity}`);
        return;
      }

      alert(`Imported ${result?.data?.imported || expectedCount} ${entity} successfully.`);
      setActiveSource(null);
      setActiveFile(null);
    } catch (error) {
      alert('Failed to process import file.');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Import User Data</h1>
        <p className="text-gray-600 mt-2">
          User ID: <span className="font-medium text-gray-900">{userId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOURCES.map((source) => (
          <div key={source.id} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{source.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{source.description}</p>
              </div>
              <UploadCloud className="w-5 h-5 text-gray-500" />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Import Type</label>
              <select
                value={selectedEntityBySource[source.id] || 'contacts'}
                onChange={(e) => handleEntityChange(source.id, e.target.value as ImportEntity)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="contacts">Contacts</option>
                <option value="jobs">Jobs</option>
                <option value="opportunities">Opportunities</option>
              </select>
            </div>

            <button
              onClick={() => handleImportClick(source)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Import from {source.name}
            </button>
          </div>
        ))}
      </div>

      {activeSource && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Import from {activeSource.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Type: {(selectedEntityBySource[activeSource.id] || 'contacts')}
                </p>
              </div>
              <button
                onClick={() => setActiveSource(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFilePick}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'
                }`}
              >
                <UploadCloud className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-sm font-medium text-gray-800">
                  Drag and drop file here, or click to upload
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV, XLSX, or JSON</p>
              </div>

              {activeFile && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">
                    Selected file: <span className="font-medium">{activeFile.name}</span>
                  </p>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setActiveSource(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
