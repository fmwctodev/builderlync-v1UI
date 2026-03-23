import React from 'react';
import { AIReportTable } from './AIReportTable';
import type { ReportComposeTable } from '../../../../types/aiReports';

interface Props {
  tables: ReportComposeTable[];
}

export function AIReportTableList({ tables }: Props) {
  if (!tables || tables.length === 0) return null;

  return (
    <div className="space-y-6">
      {tables.map((table) => (
        <AIReportTable key={table.table_id} table={table} />
      ))}
    </div>
  );
}
