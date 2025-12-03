import { useState, useEffect } from 'react';
import { FileText, DollarSign, ClipboardList, Plus, Unlink, Eye, Satellite } from 'lucide-react';
import { proposalsApi, Proposal } from '../../services/proposalsApi';
import { invoicesApi, Invoice } from '../../services/invoicesApi';
import { reportsApi, Report } from '../../services/reportsApi';

interface OpportunityAssociatedObjectsTabProps {
  opportunityId: string;
}

export default function OpportunityAssociatedObjectsTab({ opportunityId }: OpportunityAssociatedObjectsTabProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, [opportunityId]);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [proposalsData, invoicesData, reportsData] = await Promise.all([
        proposalsApi.getProposalsByOpportunity(opportunityId),
        invoicesApi.getInvoicesByOpportunity(opportunityId),
        reportsApi.getReportsByOpportunity(opportunityId),
      ]);
      setProposals(proposalsData);
      setInvoices(invoicesData);
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading associated objects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to unlink this proposal?')) return;
    try {
      await proposalsApi.unlinkProposalFromOpportunity(proposalId);
      await loadAll();
    } catch (error) {
      console.error('Error unlinking proposal:', error);
      alert('Failed to unlink proposal. Please try again.');
    }
  };

  const handleUnlinkInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to unlink this invoice?')) return;
    try {
      await invoicesApi.unlinkInvoiceFromOpportunity(invoiceId);
      await loadAll();
    } catch (error) {
      console.error('Error unlinking invoice:', error);
      alert('Failed to unlink invoice. Please try again.');
    }
  };

  const handleUnlinkReport = async (reportId: string, reportType: 'instant_estimate' | 'eagleview') => {
    if (!confirm('Are you sure you want to unlink this report?')) return;
    try {
      await reportsApi.unlinkReportFromOpportunity(reportId, reportType);
      await loadAll();
    } catch (error) {
      console.error('Error unlinking report:', error);
      alert('Failed to unlink report. Please try again.');
    }
  };

  const getProposalStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      payments: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getInvoiceStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getReportStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getReportTypeIcon = (reportType: string) => {
    return reportType === 'eagleview' ? (
      <Satellite className="h-4 w-4 text-purple-600" />
    ) : (
      <ClipboardList className="h-4 w-4 text-blue-600" />
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading associated objects...</div>
      </div>
    );
  }

  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Proposals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Proposals
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({proposals.length})
              </span>
            </h3>
          </div>
          <button
            onClick={() => alert('Link proposal functionality coming soon')}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Proposal
          </button>
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">No proposals linked to this opportunity</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{proposal.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{proposal.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProposalStatusBadge(proposal.status)}`}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      ${proposal.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="View proposal"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnlinkProposal(proposal.id)}
                          className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Unlink proposal"
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoices Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Invoices
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({invoices.length}) • Total: ${totalInvoiceAmount.toLocaleString()}
              </span>
            </h3>
          </div>
          <button
            onClick={() => alert('Link invoice functionality coming soon')}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Invoice
          </button>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">No invoices linked to this opportunity</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{invoice.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusBadge(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="View invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnlinkInvoice(invoice.id)}
                          className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Unlink invoice"
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ClipboardList className="h-5 w-5 mr-2 text-blue-600" />
              Reports
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({reports.length})
              </span>
            </h3>
          </div>
          <button
            onClick={() => alert('Link report functionality coming soon')}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Report
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <ClipboardList className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">No reports linked to this opportunity</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Report Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getReportTypeIcon(report.report_type)}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {report.report_type === 'eagleview' ? 'EagleView' : 'Instant Estimate'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{report.report_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {'property_address' in report ? report.property_address : report.job_address}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportStatusBadge(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                          title="View report"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnlinkReport(report.id, report.report_type)}
                          className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          title="Unlink report"
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
