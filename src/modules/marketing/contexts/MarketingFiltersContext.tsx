import React, { createContext, useContext, useState } from 'react';

export interface MarketingFilters {
  dateRange: '7d' | '30d' | '90d' | 'mtd' | 'ytd';
  serviceType: string;
  channel: string;
}

interface MarketingFiltersContextValue {
  filters: MarketingFilters;
  setDateRange: (v: MarketingFilters['dateRange']) => void;
  setServiceType: (v: string) => void;
  setChannel: (v: string) => void;
}

const DEFAULT_FILTERS: MarketingFilters = {
  dateRange: '30d',
  serviceType: '',
  channel: '',
};

const MarketingFiltersContext = createContext<MarketingFiltersContextValue>({
  filters: DEFAULT_FILTERS,
  setDateRange: () => {},
  setServiceType: () => {},
  setChannel: () => {},
});

export const MarketingFiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<MarketingFilters>(DEFAULT_FILTERS);

  const setDateRange = (v: MarketingFilters['dateRange']) =>
    setFilters((f) => ({ ...f, dateRange: v }));
  const setServiceType = (v: string) =>
    setFilters((f) => ({ ...f, serviceType: v }));
  const setChannel = (v: string) =>
    setFilters((f) => ({ ...f, channel: v }));

  return (
    <MarketingFiltersContext.Provider value={{ filters, setDateRange, setServiceType, setChannel }}>
      {children}
    </MarketingFiltersContext.Provider>
  );
};

export function useMarketingFilters() {
  return useContext(MarketingFiltersContext);
}
