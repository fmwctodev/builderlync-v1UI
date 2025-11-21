interface StatusBadgeProps {
  status: string;
  type?: 'invoice' | 'payment' | 'funding' | 'document' | 'coupon';
}

export default function StatusBadge({ status, type = 'invoice' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

    if (type === 'invoice') {
      const styles: Record<string, string> = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        due: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        received: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      };
      return styles[normalizedStatus] || styles.draft;
    }

    if (type === 'payment') {
      const styles: Record<string, string> = {
        approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        failed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        declined: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      };
      return styles[normalizedStatus] || styles.pending;
    }

    if (type === 'funding') {
      const styles: Record<string, string> = {
        funded: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        in_transit: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        not_funded: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        ach_return: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      };
      return styles[normalizedStatus] || styles.not_funded;
    }

    if (type === 'document') {
      const styles: Record<string, string> = {
        draft: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        waiting: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        payments: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        archived: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      };
      return styles[normalizedStatus] || styles.draft;
    }

    if (type === 'coupon') {
      const styles: Record<string, string> = {
        active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        expired: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      };
      return styles[normalizedStatus] || styles.active;
    }

    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getStatusStyles()}`}>
      {formatStatus(status)}
    </span>
  );
}
