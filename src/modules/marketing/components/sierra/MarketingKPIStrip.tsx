import React from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, FileText, Briefcase, DollarSign, Target } from 'lucide-react';
import type { MarketingKPIs } from '../../types/marketing';

interface KPICardProps {
  label: string;
  value: string;
  change?: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, icon, onClick }) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${onClick ? 'cursor-pointer hover:border-red-300 hover:shadow-sm transition-all' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{label}</span>
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
          {isPositive ? <TrendingUp size={11} /> : isNegative ? <TrendingDown size={11} /> : null}
          <span>{isPositive ? '+' : ''}{change}% vs last period</span>
        </div>
      )}
    </div>
  );
};

interface MarketingKPIStripProps {
  kpis: MarketingKPIs;
}

export const MarketingKPIStrip: React.FC<MarketingKPIStripProps> = ({ kpis }) => {
  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const fmtCurrency = (n: number) =>
    n >= 1000
      ? `$${(n / 1000).toFixed(0)}K`
      : `$${n.toFixed(0)}`;
  const fmtDollar = (n: number) => `$${n.toFixed(0)}`;

  const cards: KPICardProps[] = [
    { label: 'Leads', value: fmt(kpis.leads), change: kpis.leads_change, icon: <Users size={14} /> },
    { label: 'Booked Appointments', value: fmt(kpis.booked_appointments), change: kpis.booked_appointments_change, icon: <Calendar size={14} /> },
    { label: 'Estimates Sent', value: fmt(kpis.estimates_sent), change: kpis.estimates_sent_change, icon: <FileText size={14} /> },
    { label: 'Jobs Won', value: fmt(kpis.jobs_won), change: kpis.jobs_won_change, icon: <Briefcase size={14} /> },
    { label: 'Revenue Influenced', value: fmtCurrency(kpis.revenue_influenced), change: kpis.revenue_influenced_change, icon: <DollarSign size={14} /> },
    { label: 'Close Rate', value: `${kpis.close_rate}%`, change: kpis.close_rate_change, icon: <Target size={14} /> },
    { label: 'Cost Per Lead', value: fmtDollar(kpis.cost_per_lead), icon: <TrendingUp size={14} /> },
    { label: 'Cost Per Appointment', value: fmtDollar(kpis.cost_per_appointment), icon: <Calendar size={14} /> },
    { label: 'Cost Per Won Job', value: fmtDollar(kpis.cost_per_won_job), icon: <Briefcase size={14} /> },
    { label: 'Total Spend', value: fmtCurrency(kpis.total_spend), icon: <DollarSign size={14} /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-3">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} />
      ))}
    </div>
  );
};
