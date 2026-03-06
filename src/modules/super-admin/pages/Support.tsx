import React, { useState, useEffect } from 'react';
import { LifeBuoy, RefreshCw, Plus, Download, Smile, Meh, Frown, TrendingUp, Activity, MessageSquare, Lightbulb, Bug, Heart, HelpCircle, AlertTriangle, CheckCircle, Lock, User, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { isJiraConfigured } from '../services/jira/jira-client';
import { syncAllJiraData, pushTicketToJira, updateJiraFromTicket } from '../services/jira/jira-sync-service';
import {
  SupportTicket,
  TicketComment,
  NpsResponse,
  ProductFeedback,
  AccountHealthSnapshot,
} from '../types/support';
import {
  getStatusColor,
  getStatusIcon,
  getPriorityColor,
  getPriorityIcon,
  getRiskColor,
  getRiskIcon,
  calculateNPS,
  categorizeNpsScore,
  getNpsScoreColor,
  getNpsIcon,
  formatTicketAge,
  formatResolutionTime,
  getHealthScoreColor,
  getHealthScoreTextColor,
  truncateComment,
  formatTimestamp,
} from '../utils/support-utils';
import { clsx } from 'clsx';

type Tab = 'tickets' | 'nps' | 'health';
type TicketSource = 'database' | 'jira';

export const Support: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [loading, setLoading] = useState(true);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [npsResponses, setNpsResponses] = useState<NpsResponse[]>([]);
  const [productFeedback, setProductFeedback] = useState<ProductFeedback[]>([]);
  const [accountHealth, setAccountHealth] = useState<AccountHealthSnapshot[]>([]);

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketComments, setTicketComments] = useState<TicketComment[]>([]);
  const [selectedHealth, setSelectedHealth] = useState<AccountHealthSnapshot | null>(null);

  const [jiraConfigured, setJiraConfigured] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [healthDetailOpen, setHealthDetailOpen] = useState(false);
  const [refreshingTicket, setRefreshingTicket] = useState(false);
  const [checkingJiraStatus, setCheckingJiraStatus] = useState(false);
  const [jiraStatusInfo, setJiraStatusInfo] = useState<{
    issueId?: string | null;
    issueKey?: string | null;
    status?: string | null;
    updatedAt?: string | null;
    summary?: string | null;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [npsFilter, setNpsFilter] = useState<string>('all');
  const [ticketSource, setTicketSource] = useState<TicketSource>('jira');
  const [ticketPage, setTicketPage] = useState(1);
  const ticketPageSize = 10;
  const [ticketPagination, setTicketPagination] = useState({ page: 1, limit: ticketPageSize, total: 0, totalPages: 1 });
  const [ticketSummary, setTicketSummary] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    loadData();
    setJiraConfigured(isJiraConfigured());
  }, [activeTab, ticketPage, statusFilter, priorityFilter, searchTerm, ticketSource]);

  const getAuthHeaders = () => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Admin token missing. Please login again.');
    }
    return {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };
  };

  const normalizeTicket = (ticket: any): SupportTicket => ({
    ...ticket,
    description: ticket?.description || ticket?.message || '',
    contact_email: ticket?.contact_email || ticket?.users?.email || 'N/A',
    contact_name: ticket?.contact_name || null,
  });

  const mapJiraStatusToLocal = (statusName: string): SupportTicket['status'] => {
    const s = String(statusName || '').toLowerCase();
    if (s.includes('done') || s.includes('resolve') || s.includes('close')) return 'resolved';
    if (s.includes('progress') || s.includes('doing')) return 'in_progress';
    if (s.includes('wait') || s.includes('review') || s.includes('hold')) return 'waiting';
    return 'open';
  };

  const mapJiraPriorityToLocal = (priorityName: string): SupportTicket['priority'] => {
    const p = String(priorityName || '').toLowerCase();
    if (p.includes('highest') || p.includes('urgent')) return 'urgent';
    if (p.includes('high')) return 'high';
    if (p.includes('low') || p.includes('lowest')) return 'low';
    return 'medium';
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const params = new URLSearchParams();
        params.set('page', String(ticketPage));
        params.set('limit', String(ticketPageSize));
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (priorityFilter !== 'all') params.set('priority', priorityFilter);
        if (searchTerm.trim()) params.set('search', searchTerm.trim());

        const endpoint =
          ticketSource === 'jira'
            ? `${apiBaseUrl}/support/admin/jira/tickets?${params.toString()}`
            : `${apiBaseUrl}/support/admin/tickets?${params.toString()}`;

        const response = await fetch(endpoint, {
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load tickets');
        }

        if (ticketSource === 'jira') {
          const jiraTickets = (result.data || []).map((issue: any) => {
            const status = mapJiraStatusToLocal(issue?.fields?.status?.name);
            const priority = mapJiraPriorityToLocal(issue?.fields?.priority?.name);
            const createdAt = issue?.fields?.created || new Date().toISOString();
            const updatedAt = issue?.fields?.updated || createdAt;
            return normalizeTicket({
              id: `jira-${issue.id}`,
              ticket_number: issue.key,
              subject: issue?.fields?.summary || '(No summary)',
              message: issue?.fields?.summary || '',
              description: issue?.fields?.summary || '',
              status,
              priority,
              created_at: createdAt,
              updated_at: updatedAt,
              contact_name: issue?.fields?.assignee?.displayName || 'Jira',
              contact_email: issue?.fields?.assignee?.emailAddress || 'jira@system.local',
              tags: issue?.fields?.labels || [],
              jira_issue_key: issue.key,
              jira_issue_id: issue.id,
            });
          });
          setTickets(jiraTickets);
          const apiPagination = result?.pagination || {};
          const effectiveTotal =
            Number(apiPagination?.total || 0) > 0
              ? Number(apiPagination.total)
              : (Number(result?.total || 0) > 0 ? Number(result.total) : jiraTickets.length);
          const effectiveTotalPages =
            Number(apiPagination?.totalPages || 0) > 0
              ? Number(apiPagination.totalPages)
              : Math.max(1, Math.ceil(effectiveTotal / ticketPageSize));
          setTicketPagination({
            page: Number(apiPagination?.page || ticketPage),
            limit: Number(apiPagination?.limit || ticketPageSize),
            total: effectiveTotal,
            totalPages: effectiveTotalPages,
          });
          const apiStats = result?.stats;
          const hasValidStats = apiStats && (
            (Number(apiStats.total) > 0) ||
            (Number(apiStats.open) > 0) ||
            (Number(apiStats.inProgress) > 0) ||
            (Number(apiStats.resolved) > 0)
          );
          setTicketSummary({
            total: hasValidStats ? Number(apiStats.total || 0) : effectiveTotal,
            open: hasValidStats ? Number(apiStats.open || 0) : jiraTickets.filter((t: SupportTicket) => t.status === 'open').length,
            inProgress: hasValidStats ? Number(apiStats.inProgress || 0) : jiraTickets.filter((t: SupportTicket) => t.status === 'in_progress').length,
            resolved: hasValidStats ? Number(apiStats.resolved || 0) : jiraTickets.filter((t: SupportTicket) => t.status === 'resolved' || t.status === 'closed').length,
          });
        } else {
          setTickets((result.data || []).map((ticket: any) => normalizeTicket(ticket)));
          setTicketPagination(result?.pagination || { page: ticketPage, limit: ticketPageSize, total: (result.data || []).length, totalPages: 1 });
          setTicketSummary({
            total: (result.data || []).length,
            open: (result.data || []).filter((t: any) => t.status === 'open').length,
            inProgress: (result.data || []).filter((t: any) => t.status === 'in_progress').length,
            resolved: (result.data || []).filter((t: any) => t.status === 'resolved' || t.status === 'closed').length,
          });
        }
      } else if (activeTab === 'nps') {
        const response = await fetch(`${apiBaseUrl}/support/admin/nps`, {
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load NPS/feedback');
        }
        setNpsResponses(result?.data?.npsResponses || []);
        setProductFeedback(result?.data?.productFeedback || []);
      } else if (activeTab === 'health') {
        const response = await fetch(`${apiBaseUrl}/support/admin/health`, {
          headers: getAuthHeaders(),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to load account health');
        }
        setAccountHealth(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketComments = async (ticketId: string) => {
    const response = await fetch(`${apiBaseUrl}/support/admin/tickets/${ticketId}/comments`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load ticket comments');
    }
    setTicketComments(result.data || []);
  };

  const handleViewTicket = async (ticket: SupportTicket) => {
    try {
      setTicketDetailOpen(true);
      setSelectedTicket(ticket);
      setJiraStatusInfo(null);
      if (String(ticket.id).startsWith('jira-')) {
        setTicketComments([]);
        return;
      }

      const [ticketResponse, commentsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/support/admin/tickets/${ticket.id}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${apiBaseUrl}/support/admin/tickets/${ticket.id}/comments`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const [ticketResult, commentsResult] = await Promise.all([
        ticketResponse.json(),
        commentsResponse.json(),
      ]);

      if (ticketResponse.ok && ticketResult.success) {
        setSelectedTicket(normalizeTicket(ticketResult.data));
      }
      if (commentsResponse.ok && commentsResult.success) {
        setTicketComments(commentsResult.data || []);
      }
    } catch (error) {
      console.error('Failed to open ticket details:', error);
    }
  };

  const handleRefreshTicketStatus = async () => {
    if (!selectedTicket?.id) return;
    if (String(selectedTicket.id).startsWith('jira-')) {
      await loadData();
      return;
    }
    try {
      setRefreshingTicket(true);

      const [ticketResponse, commentsResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/support/admin/tickets/${selectedTicket.id}`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${apiBaseUrl}/support/admin/tickets/${selectedTicket.id}/comments`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const [ticketResult, commentsResult] = await Promise.all([
        ticketResponse.json(),
        commentsResponse.json(),
      ]);

      if (ticketResponse.ok && ticketResult.success) {
        setSelectedTicket(normalizeTicket(ticketResult.data));
      }
      if (commentsResponse.ok && commentsResult.success) {
        setTicketComments(commentsResult.data || []);
      }

      await loadData();
    } catch (error) {
      console.error('Failed to refresh ticket status:', error);
    } finally {
      setRefreshingTicket(false);
    }
  };

  const handleCheckJiraStatus = async () => {
    if (!selectedTicket?.id) return;
    if (String(selectedTicket.id).startsWith('jira-')) {
      setJiraStatusInfo({
        issueId: (selectedTicket as any).jira_issue_id || null,
        issueKey: (selectedTicket as any).jira_issue_key || selectedTicket.ticket_number,
        status: selectedTicket.status,
        updatedAt: selectedTicket.updated_at,
        summary: selectedTicket.subject,
      });
      return;
    }
    try {
      setCheckingJiraStatus(true);
      const response = await fetch(`${apiBaseUrl}/support/admin/tickets/${selectedTicket.id}/jira-status`, {
        headers: getAuthHeaders(),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch Jira status');
      }
      setJiraStatusInfo(result.data || null);
    } catch (error: any) {
      setJiraStatusInfo({ status: error?.message || 'Failed to fetch Jira status' });
    } finally {
      setCheckingJiraStatus(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const response = await fetch(`${apiBaseUrl}/support/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update ticket');
      }

      loadData();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: status as any, ...updates });
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  const handleAddComment = async (ticketId: string, body: string, isInternal: boolean) => {
    try {
      const response = await fetch(`${apiBaseUrl}/support/admin/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          author_type: 'internal',
          author_name: 'Support Team',
          author_email: 'support@builderlync.com',
          body,
          is_internal_note: isInternal,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to add comment');
      }

      await loadTicketComments(ticketId);
      await loadData();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleSyncJiraData = async () => {
    if (!jiraConfigured) {
      setSyncMessage('Jira is not configured. Please set VITE_JIRA_DOMAIN, VITE_JIRA_EMAIL, VITE_JIRA_API_TOKEN, and VITE_JIRA_PROJECT_KEY.');
      setTimeout(() => setSyncMessage(''), 5000);
      return;
    }

    setSyncing(true);
    setSyncMessage('');

    try {
      const result = await syncAllJiraData();
      const issueMsg = `Issues: ${result.issues.created} created, ${result.issues.updated} updated, ${result.issues.errors} errors`;
      const commentMsg = `Comments: ${result.comments.created} created, ${result.comments.updated} updated`;
      setSyncMessage(`✓ Sync complete! ${issueMsg}. ${commentMsg}`);
      await loadData();
    } catch (error: any) {
      setSyncMessage(`✗ Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage(''), 8000);
    }
  };

  const handlePushToJira = async (ticketId: string) => {
    try {
      const issueKey = await pushTicketToJira(ticketId);
      setSyncMessage(`✓ Ticket pushed to Jira: ${issueKey}`);
      await loadData();
    } catch (error: any) {
      setSyncMessage(`✗ Failed to push: ${error.message}`);
    } finally {
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleUpdateJira = async (ticketId: string) => {
    try {
      await updateJiraFromTicket(ticketId);
      setSyncMessage('✓ Ticket synced to Jira');
      await loadData();
    } catch (error: any) {
      setSyncMessage(`✗ Failed to sync: ${error.message}`);
    } finally {
      setTimeout(() => setSyncMessage(''), 5000);
    }
  };

  const handleUpdateHealthNotes = async (healthId: string, notes: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/support/admin/health/${healthId}/notes`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update notes');
      }
      loadData();
      if (selectedHealth?.id === healthId) {
        setSelectedHealth({ ...selectedHealth, notes });
      }
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const filteredTickets = (ticketSource === 'jira' ? tickets : tickets.filter(ticket => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !ticket.subject.toLowerCase().includes(search) &&
        !(ticket.contact_email || '').toLowerCase().includes(search) &&
        !(ticket.enterprise_accounts as any)?.name?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
    return true;
  }));
  const totalTicketPages = ticketSource === 'jira'
    ? Math.max(1, ticketPagination.totalPages || 1)
    : Math.max(1, Math.ceil(filteredTickets.length / ticketPageSize));
  const pagedTickets = ticketSource === 'jira'
    ? filteredTickets
    : filteredTickets.slice((ticketPage - 1) * ticketPageSize, ticketPage * ticketPageSize);
  const totalTicketItems = ticketSource === 'jira'
    ? (ticketPagination.total > 0 ? ticketPagination.total : filteredTickets.length)
    : filteredTickets.length;

  useEffect(() => {
    setTicketPage(1);
  }, [statusFilter, priorityFilter, activeTab, ticketSource]);

  const filteredNps = npsResponses.filter(nps => {
    if (npsFilter === 'promoters' && nps.score < 9) return false;
    if (npsFilter === 'passives' && (nps.score < 7 || nps.score > 8)) return false;
    if (npsFilter === 'detractors' && nps.score > 6) return false;
    return true;
  });

  const filteredHealth = accountHealth.filter(health => {
    if (riskFilter !== 'all' && health.risk_level !== riskFilter) return false;
    return true;
  });

  const npsScore = calculateNPS(npsResponses);
  const promoters = npsResponses.filter(r => r.score >= 9).length;
  const passives = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
  const detractors = npsResponses.filter(r => r.score <= 6).length;

  const ticketStats = ticketSource === 'jira'
    ? {
        total: ticketSummary.total > 0 ? ticketSummary.total : filteredTickets.length,
        open: ticketSummary.total > 0 ? ticketSummary.open : filteredTickets.filter(t => t.status === 'open').length,
        inProgress: ticketSummary.total > 0 ? ticketSummary.inProgress : filteredTickets.filter(t => t.status === 'in_progress').length,
        resolved: ticketSummary.total > 0 ? ticketSummary.resolved : filteredTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      }
    : {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      };

  const healthStats = {
    highRisk: accountHealth.filter(h => h.risk_level === 'high').length,
    mediumRisk: accountHealth.filter(h => h.risk_level === 'medium').length,
    lowRisk: accountHealth.filter(h => h.risk_level === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LifeBuoy className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Support & Feedback</h1>
            <p className="text-gray-600 mt-1">Triage issues, track sentiment, and protect at-risk accounts</p>
          </div>
        </div>
        <div className="flex gap-2">
          {jiraConfigured && activeTab === 'tickets' && (
            <button
              onClick={handleSyncJiraData}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Jira'}
            </button>
          )}
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {activeTab === 'tickets' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          )}
          {activeTab === 'nps' && (
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Download className="w-4 h-4" />
              Export NPS
            </button>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className={`rounded-lg p-4 ${syncMessage.startsWith('✓') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {syncMessage}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <TabButton
              active={activeTab === 'tickets'}
              onClick={() => setActiveTab('tickets')}
              icon={LifeBuoy}
              label="Tickets"
              count={ticketStats.open}
            />
            <TabButton
              active={activeTab === 'nps'}
              onClick={() => setActiveTab('nps')}
              icon={MessageSquare}
              label="NPS & Feedback"
              count={productFeedback.filter(f => f.status === 'new').length}
            />
            <TabButton
              active={activeTab === 'health'}
              onClick={() => setActiveTab('health')}
              icon={Activity}
              label="Account Health"
              count={healthStats.highRisk}
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'tickets' && (
            <TicketsTab
              tickets={pagedTickets}
              loading={loading}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onSearchChange={setSearchTerm}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              ticketSource={ticketSource}
              onTicketSourceChange={setTicketSource}
              onViewTicket={handleViewTicket}
              onUpdateStatus={handleUpdateTicketStatus}
              onPushToJira={handlePushToJira}
              onUpdateJira={handleUpdateJira}
              jiraConfigured={jiraConfigured}
              stats={ticketStats}
              page={ticketPage}
              totalPages={totalTicketPages}
              totalItems={totalTicketItems}
              pageSize={ticketPageSize}
              onPageChange={setTicketPage}
            />
          )}

          {activeTab === 'nps' && (
            <NpsTab
              npsResponses={filteredNps}
              productFeedback={productFeedback}
              loading={loading}
              npsFilter={npsFilter}
              onNpsFilterChange={setNpsFilter}
              npsScore={npsScore}
              promoters={promoters}
              passives={passives}
              detractors={detractors}
            />
          )}

          {activeTab === 'health' && (
            <HealthTab
              accountHealth={filteredHealth}
              loading={loading}
              riskFilter={riskFilter}
              onRiskFilterChange={setRiskFilter}
              onViewDetail={(health) => {
                setSelectedHealth(health);
                setHealthDetailOpen(true);
              }}
              stats={healthStats}
            />
          )}
        </div>
      </div>

      {ticketDetailOpen && selectedTicket && (
        <TicketDetailDrawer
          ticket={selectedTicket}
          comments={ticketComments}
          refreshingStatus={refreshingTicket}
          onRefreshStatus={handleRefreshTicketStatus}
          checkingJiraStatus={checkingJiraStatus}
          jiraStatusInfo={jiraStatusInfo}
          onCheckJiraStatus={handleCheckJiraStatus}
          onClose={() => {
            setTicketDetailOpen(false);
            setSelectedTicket(null);
            setJiraStatusInfo(null);
          }}
          onUpdateStatus={handleUpdateTicketStatus}
          onAddComment={handleAddComment}
        />
      )}

      {healthDetailOpen && selectedHealth && (
        <HealthDetailDrawer
          health={selectedHealth}
          onClose={() => {
            setHealthDetailOpen(false);
            setSelectedHealth(null);
          }}
          onUpdateNotes={handleUpdateHealthNotes}
        />
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors',
      active ? 'border-red-600 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count !== undefined && count > 0 && (
      <span className={clsx('px-2 py-0.5 text-xs rounded-full', active ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700')}>
        {count}
      </span>
    )}
  </button>
);

interface TicketsTabProps {
  tickets: SupportTicket[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onSearchChange: (term: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  ticketSource: TicketSource;
  onTicketSourceChange: (source: TicketSource) => void;
  onViewTicket: (ticket: SupportTicket) => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onPushToJira?: (ticketId: string) => void;
  onUpdateJira?: (ticketId: string) => void;
  jiraConfigured?: boolean;
  stats: { total: number; open: number; inProgress: number; resolved: number };
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const TicketsTab: React.FC<TicketsTabProps> = ({
  tickets,
  loading,
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  ticketSource,
  onTicketSourceChange,
  onViewTicket,
  onUpdateStatus,
  onPushToJira,
  onUpdateJira,
  jiraConfigured,
  stats,
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Total Tickets</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Open</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.open}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={ticketSource}
          onChange={(e) => onTicketSourceChange(e.target.value as TicketSource)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="jira">Jira Live</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              {jiraConfigured && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jira</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tickets.map((ticket) => {
              const StatusIcon = getStatusIcon(ticket.status);
              const PriorityIcon = getPriorityIcon(ticket.priority);
              return (
                <tr
                  key={ticket.id}
                  className={clsx(
                    'hover:bg-gray-50',
                    ticket.priority === 'urgent' && 'border-l-4 border-red-500'
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-gray-900">{ticket.ticket_number}</div>
                    <div className="text-xs text-gray-500">{ticket.category || 'General'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                    <div className="text-xs text-gray-500">{ticket.contact_name || ticket.contact_email}</div>
                  </td>
                  {jiraConfigured && (
                    <td className="px-6 py-4">
                      {(ticket as any).jira_issue_key ? (
                        <a
                          href={`https://${import.meta.env.VITE_JIRA_DOMAIN}/browse/${(ticket as any).jira_issue_key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LinkIcon className="w-3 h-3" />
                          {(ticket as any).jira_issue_key}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPushToJira?.(ticket.id);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Push to Jira
                        </button>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', getStatusColor(ticket.status))}>
                      <StatusIcon className="w-3 h-3" />
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', getPriorityColor(ticket.priority))}>
                      {ticket.priority === 'urgent' || ticket.priority === 'high' ? <PriorityIcon className="w-3 h-3" /> : null}
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatTicketAge(ticket.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {jiraConfigured && (ticket as any).jira_issue_key && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateJira?.(ticket.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-xs"
                          title="Sync to Jira"
                        >
                          Sync
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewTicket(ticket);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {ticketSource === 'jira' ? (
        <div className="text-sm text-gray-600 border border-gray-200 rounded-lg px-4 py-3">
          Showing all {totalItems} Jira tickets
        </div>
      ) : (
        <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
          <div className="text-sm text-gray-600">
            Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface NpsTabProps {
  npsResponses: NpsResponse[];
  productFeedback: ProductFeedback[];
  loading: boolean;
  npsFilter: string;
  onNpsFilterChange: (filter: string) => void;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
}

const NpsTab: React.FC<NpsTabProps> = ({
  npsResponses,
  productFeedback,
  loading,
  npsFilter,
  onNpsFilterChange,
  npsScore,
  promoters,
  passives,
  detractors,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const total = npsResponses.length;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Promoter Score</h3>
        <div className="grid grid-cols-5 gap-4">
          <div className={clsx('rounded-lg p-4', npsScore >= 0 ? 'bg-green-50' : 'bg-red-50')}>
            <div className="flex items-center gap-2">
              <TrendingUp className={clsx('w-5 h-5', npsScore >= 0 ? 'text-green-600' : 'text-red-600')} />
              <div className="text-sm text-gray-600">NPS Score</div>
            </div>
            <div className={clsx('text-3xl font-bold mt-2', npsScore >= 0 ? 'text-green-600' : 'text-red-600')}>{npsScore}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-green-600" />
              <div className="text-sm text-gray-600">Promoters</div>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">{promoters}</div>
            <div className="text-xs text-gray-600">{total > 0 ? Math.round((promoters / total) * 100) : 0}%</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Meh className="w-5 h-5 text-red-600" />
              <div className="text-sm text-gray-600">Passives</div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-2">{passives}</div>
            <div className="text-xs text-gray-600">{total > 0 ? Math.round((passives / total) * 100) : 0}%</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Frown className="w-5 h-5 text-red-600" />
              <div className="text-sm text-gray-600">Detractors</div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-2">{detractors}</div>
            <div className="text-xs text-gray-600">{total > 0 ? Math.round((detractors / total) * 100) : 0}%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{total}</div>
            <div className="text-xs text-gray-600">responses</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">NPS Responses</h3>
          <select
            value={npsFilter}
            onChange={(e) => onNpsFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Responses</option>
            <option value="promoters">Promoters (9-10)</option>
            <option value="passives">Passives (7-8)</option>
            <option value="detractors">Detractors (0-6)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {npsResponses.map((nps) => {
                const NpsIcon = getNpsIcon(nps.score);
                return (
                  <tr key={nps.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTimestamp(nps.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold', getNpsScoreColor(nps.score))}>
                        <NpsIcon className="w-4 h-4" />
                        {nps.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{(nps.enterprise_accounts as any)?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{nps.contact_email || 'Anonymous'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{truncateComment(nps.comment || '', 80)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Feedback</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productFeedback.map((feedback) => {
                const TypeIcon = feedback.type === 'bug' ? Bug : feedback.type === 'idea' ? Lightbulb : feedback.type === 'praise' ? Heart : HelpCircle;
                const typeColor = feedback.type === 'bug' ? 'text-red-600' : feedback.type === 'idea' ? 'text-yellow-600' : feedback.type === 'praise' ? 'text-green-600' : 'text-blue-600';
                return (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TypeIcon className={clsx('w-4 h-4', typeColor)} />
                        <span className="text-sm font-medium text-gray-900">{feedback.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{feedback.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{feedback.area || 'General'}</td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', {
                        'bg-red-100 text-red-800': ['new', 'reviewing', 'planned'].includes(feedback.status),
                        'bg-amber-100 text-amber-800': feedback.status === 'in_progress',
                        'bg-green-100 text-green-800': feedback.status === 'done',
                        'bg-gray-100 text-gray-800': feedback.status === 'rejected',
                      })}>
                        {feedback.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTimestamp(feedback.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface HealthTabProps {
  accountHealth: AccountHealthSnapshot[];
  loading: boolean;
  riskFilter: string;
  onRiskFilterChange: (filter: string) => void;
  onViewDetail: (health: AccountHealthSnapshot) => void;
  stats: { highRisk: number; mediumRisk: number; lowRisk: number };
}

const HealthTab: React.FC<HealthTabProps> = ({
  accountHealth,
  loading,
  riskFilter,
  onRiskFilterChange,
  onViewDetail,
  stats,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const avgScore = accountHealth.length > 0
    ? Math.round(accountHealth.reduce((sum, h) => sum + h.health_score, 0) / accountHealth.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Avg Health</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{avgScore}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">High Risk</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.highRisk}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Medium Risk</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{stats.mediumRisk}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600">Low Risk</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.lowRisk}</div>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={riskFilter}
          onChange={(e) => onRiskFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Risk Levels</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Tickets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NPS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accountHealth.map((health) => {
              const RiskIcon = getRiskIcon(health.risk_level);
              return (
                <tr
                  key={health.id}
                  className={clsx(
                    'hover:bg-gray-50 cursor-pointer',
                    health.risk_level === 'high' && 'border-l-4 border-red-500',
                    health.risk_level === 'medium' && 'border-l-4 border-amber-500'
                  )}
                  onClick={() => onViewDetail(health)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {(health.enterprise_accounts as any)?.name}
                    </div>
                    <div className="text-xs text-gray-500">{(health.enterprise_accounts as any)?.plan}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-lg font-bold', getHealthScoreTextColor(health.health_score))}>
                        {health.health_score}
                      </span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full transition-all', getHealthScoreColor(health.health_score))}
                          style={{ width: `${health.health_score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', getRiskColor(health.risk_level))}>
                      <RiskIcon className="w-3 h-3" />
                      {health.risk_level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', health.tickets_open > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800')}>
                      {health.tickets_open}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {health.nps_latest !== null ? (
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getNpsScoreColor(health.nps_latest))}>
                        {health.nps_latest}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {health.usage_score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{health.usage_score}</span>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full', getHealthScoreColor(health.usage_score))}
                            style={{ width: `${health.usage_score}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(health);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TicketDetailDrawerProps {
  ticket: SupportTicket;
  comments: TicketComment[];
  refreshingStatus: boolean;
  onRefreshStatus: () => void;
  checkingJiraStatus: boolean;
  jiraStatusInfo: {
    issueId?: string | null;
    issueKey?: string | null;
    status?: string | null;
    updatedAt?: string | null;
    summary?: string | null;
  } | null;
  onCheckJiraStatus: () => void;
  onClose: () => void;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onAddComment: (ticketId: string, body: string, isInternal: boolean) => void;
}

const TicketDetailDrawer: React.FC<TicketDetailDrawerProps> = ({
  ticket,
  comments,
  refreshingStatus,
  onRefreshStatus,
  checkingJiraStatus,
  jiraStatusInfo,
  onCheckJiraStatus,
  onClose,
  onUpdateStatus,
  onAddComment,
}) => {
  const [commentBody, setCommentBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const isJiraOnly = String(ticket.id).startsWith('jira-');

  const handleSubmitComment = () => {
    if (isJiraOnly) return;
    if (!commentBody.trim()) return;
    onAddComment(ticket.id, commentBody, isInternal);
    setCommentBody('');
    setIsInternal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">{ticket.ticket_number}</h2>
              <span className={clsx('px-2 py-0.5 rounded text-xs font-medium border', getStatusColor(ticket.status))}>
                {ticket.status}
              </span>
              <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', getPriorityColor(ticket.priority))}>
                {ticket.priority}
              </span>
            </div>
            <div className="text-gray-600 mt-1">{ticket.subject}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStatus}
              disabled={refreshingStatus}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshingStatus ? 'Refreshing...' : 'Refresh Status'}
            </button>
            <button
              onClick={onCheckJiraStatus}
              disabled={checkingJiraStatus}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {checkingJiraStatus ? 'Checking Jira...' : 'Check Jira Status'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Description</div>
            <div className="text-gray-900">{ticket.description}</div>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <div>Contact: {ticket.contact_name || ticket.contact_email}</div>
              <div>Created: {formatTimestamp(ticket.created_at)}</div>
              {ticket.resolved_at && <div>Resolution: {formatResolutionTime(ticket.created_at, ticket.resolved_at)}</div>}
            </div>
            {jiraStatusInfo && (
              <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-white text-sm text-gray-700">
                <div className="font-medium text-gray-900 mb-1">Jira Verification</div>
                <div>Status: {jiraStatusInfo.status || 'N/A'}</div>
                {jiraStatusInfo.issueKey && <div>Issue Key: {jiraStatusInfo.issueKey}</div>}
                {jiraStatusInfo.issueId && <div>Issue ID: {jiraStatusInfo.issueId}</div>}
                {jiraStatusInfo.updatedAt && <div>Updated: {formatTimestamp(jiraStatusInfo.updatedAt)}</div>}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Conversation ({comments.length})</div>
            {isJiraOnly && (
              <div className="text-xs text-gray-500 mb-2">Live Jira issue: comments are managed in Jira.</div>
            )}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={clsx(
                    'rounded-lg p-4 border',
                    comment.is_internal_note
                      ? 'bg-yellow-50 border-yellow-200'
                      : comment.author_type === 'internal'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {comment.is_internal_note ? (
                      <Lock className="w-4 h-4 text-yellow-600 mt-0.5" />
                    ) : comment.author_type === 'internal' ? (
                      <CheckCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.author_name}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(comment.created_at)}</span>
                        {comment.is_internal_note && (
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded">Internal Note</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700">{comment.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Add Reply</div>
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Type your response..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Internal note only</span>
              </label>
              <button
                onClick={handleSubmitComment}
                disabled={!commentBody.trim() || isJiraOnly}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Quick Actions</div>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateStatus(ticket.id, 'in_progress')}
                disabled={isJiraOnly}
                className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 text-sm"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => onUpdateStatus(ticket.id, 'waiting')}
                disabled={isJiraOnly}
                className="px-3 py-1.5 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
              >
                Mark Waiting
              </button>
              <button
                onClick={() => onUpdateStatus(ticket.id, 'resolved')}
                disabled={isJiraOnly}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => onUpdateStatus(ticket.id, 'closed')}
                disabled={isJiraOnly}
                className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface HealthDetailDrawerProps {
  health: AccountHealthSnapshot;
  onClose: () => void;
  onUpdateNotes: (healthId: string, notes: string) => void;
}

const HealthDetailDrawer: React.FC<HealthDetailDrawerProps> = ({ health, onClose, onUpdateNotes }) => {
  const [notes, setNotes] = useState(health.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    await onUpdateNotes(health.id, notes);
    setSaving(false);
  };

  const RiskIcon = getRiskIcon(health.risk_level);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{(health.enterprise_accounts as any)?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx('px-2 py-0.5 rounded text-xs font-medium border', getRiskColor(health.risk_level))}>
                <RiskIcon className="w-3 h-3 inline mr-1" />
                {health.risk_level} risk
              </span>
              <span className="text-sm text-gray-600">Health Snapshot - {new Date(health.period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <div className={clsx('text-6xl font-bold mb-2', getHealthScoreTextColor(health.health_score))}>
                {health.health_score}
              </div>
              <div className="text-lg text-gray-600 mb-4">Health Score</div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full transition-all', getHealthScoreColor(health.health_score))}
                  style={{ width: `${health.health_score}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Open Tickets</div>
              <div className="text-2xl font-bold text-gray-900">{health.tickets_open}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Latest NPS</div>
              {health.nps_latest !== null ? (
                <div className="text-2xl font-bold text-gray-900">{health.nps_latest}</div>
              ) : (
                <div className="text-2xl text-gray-400">N/A</div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Usage Score</div>
              {health.usage_score !== null ? (
                <div className="text-2xl font-bold text-gray-900">{health.usage_score}</div>
              ) : (
                <div className="text-2xl text-gray-400">N/A</div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Internal Notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this account's health..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving || notes === health.notes}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Close
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Open Account Details
          </button>
        </div>
      </div>
    </div>
  );
};
