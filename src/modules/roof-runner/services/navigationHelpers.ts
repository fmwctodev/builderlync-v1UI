import { NavigateFunction } from 'react-router-dom';

/**
 * Navigation helper functions that use the dynamic org slug pattern
 * Usage: In any component with useNavigate and useParams hooks
 */

export const createNavigationHelpers = (navigate: NavigateFunction, orgSlug: string | undefined) => {
  const orgPrefix = orgSlug ? `/org/${orgSlug}` : '';

  return {
    toCalendars: () => navigate(`${orgPrefix}/calendars`),
    toJobs: () => navigate(`${orgPrefix}/jobs`),
    toDashboard: () => navigate(`${orgPrefix}/dashboard`),
    toContacts: () => navigate(`${orgPrefix}/contacts`),
    toConversations: () => navigate(`${orgPrefix}/conversations`),
    toPayments: () => navigate(`${orgPrefix}/payments`),
    toInstantEstimator: () => navigate(`${orgPrefix}/instant-estimator`),
    toMeasurements: () => navigate(`${orgPrefix}/measurements`),
    toProposals: () => navigate(`${orgPrefix}/proposals`),
    toMaterialOrders: () => navigate(`${orgPrefix}/material-orders`),
    toWorkOrders: () => navigate(`${orgPrefix}/work-orders`),
    toOpportunities: () => navigate(`${orgPrefix}/opportunities`),
    toMarketing: () => navigate(`${orgPrefix}/marketing`),
    toFileManager: () => navigate(`${orgPrefix}/file-manager`),
    toCatalog: () => navigate(`${orgPrefix}/catalog`),
    toSettings: () => navigate(`${orgPrefix}/settings`),
    toSupport: () => navigate(`${orgPrefix}/support`),
    toAiAgents: () => navigate(`${orgPrefix}/ai-agents`),
  };
};

/**
 * Example usage in a component:
 * 
 * const navigate = useNavigate();
 * const { orgSlug } = useParams<{ orgSlug: string }>();
 * const navHelpers = createNavigationHelpers(navigate, orgSlug);
 * 
 * const handleViewCalendar = () => {
 *   navHelpers.toCalendars();
 * };
 */
