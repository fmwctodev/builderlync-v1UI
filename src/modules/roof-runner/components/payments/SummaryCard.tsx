interface SummaryCardProps {
  title: string;
  value: string;
  count?: number;
}

export default function SummaryCard({ title, value, count }: SummaryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {count !== undefined && `${count} `}{title}
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
