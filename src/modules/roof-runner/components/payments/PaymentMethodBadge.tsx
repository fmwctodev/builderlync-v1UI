interface PaymentMethodBadgeProps {
  method: string;
}

export default function PaymentMethodBadge({ method }: PaymentMethodBadgeProps) {
  const getMethodStyles = () => {
    const normalizedMethod = method.toLowerCase().replace(/\s+/g, '_');

    const styles: Record<string, string> = {
      credit_card: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      ach: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      check: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      cash: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      financing: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
    };

    return styles[normalizedMethod] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const formatMethod = (method: string) => {
    if (method.toLowerCase() === 'ach') return 'ACH';
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${getMethodStyles()}`}>
      {formatMethod(method)}
    </span>
  );
}
