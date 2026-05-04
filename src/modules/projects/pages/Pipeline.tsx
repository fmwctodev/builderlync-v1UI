import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Plus, RefreshCw, Sparkles } from 'lucide-react';
import {
  PageContainer, PageHeader, Section, Button, KpiTile, Tabs,
} from '../../../shared/components/ui';
import { usePipelineCards, DEFAULT_FILTERS, type PipelineFilters } from '../../../shared/lib/pipeline';
import { STAGE_ORDER } from '../../../shared/tokens';
import { PipelineKanban } from '../components/PipelineKanban';
import { PipelineList } from '../components/PipelineList';
import { PipelineFiltersBar } from '../components/PipelineFilters';
import { ProjectDrawer } from '../components/ProjectDrawer';
import { useSierraAssistant } from '../../../shared/context/SierraAssistantContext';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

type ViewMode = 'kanban' | 'list';

export default function Pipeline() {
  const { cards, loading, error, refetch } = usePipelineCards();
  const [filters, setFilters] = useState<PipelineFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const sierra = useSierraAssistant();

  const openCardKey = params.get('card');
  const openCard = useMemo(
    () => (openCardKey ? cards.find((c) => c.cardKey === openCardKey) ?? null : null),
    [cards, openCardKey],
  );

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return cards.filter((c) => {
      if (!filters.stages.includes(c.currentStage)) return false;
      if (filters.jobType && c.jobType !== filters.jobType) return false;
      if (filters.minValue !== null && c.estimatedValue < filters.minValue) return false;
      if (filters.maxValue !== null && c.estimatedValue > filters.maxValue) return false;
      if (q) {
        const hay = `${c.title} ${c.contactName} ${c.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // myProjectsOnly: simplified — match by ownerName containing "me"/current.
      // The legacy stack doesn't expose a stable currentUserName here.
      return true;
    });
  }, [cards, filters]);

  const kpis = useMemo(() => {
    const open = filtered.filter((c) => c.currentStage !== 'closed');
    const totalValue = open.reduce((s, c) => s + c.estimatedValue, 0);
    const proposalsOut = filtered.filter((c) => c.currentStage === 'proposal').length;
    const inProduction = filtered.filter((c) => c.currentStage === 'production').length;
    const wonThisMonth = filtered.filter((c) => {
      if (c.currentStage !== 'closed') return false;
      const t = Date.parse(c.updatedAt);
      if (Number.isNaN(t)) return false;
      const d = new Date(t);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { totalValue, proposalsOut, inProduction, wonThisMonth, openCount: open.length };
  }, [filtered]);

  // Keep document title in sync — small touch.
  useEffect(() => {
    const prev = document.title;
    document.title = 'Pipeline · BuilderLync';
    return () => {
      document.title = prev;
    };
  }, []);

  function openCardDrawer(cardKey: string) {
    const next = new URLSearchParams(params);
    next.set('card', cardKey);
    setParams(next, { replace: false });
  }

  function closeDrawer() {
    const next = new URLSearchParams(params);
    next.delete('card');
    setParams(next, { replace: false });
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Pipeline"
        subtitle="Lead to closed — every project across the workflow."
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<RefreshCw />}
              onClick={refetch}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="md"
              leadingIcon={<Sparkles />}
              onClick={() => sierra.setPanelOpen(true)}
            >
              Ask Sierra
            </Button>
            <Button
              variant="primary"
              size="md"
              leadingIcon={<Plus />}
              onClick={() => navigate('opportunities')}
            >
              New project
            </Button>
          </>
        }
      />

      <Section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile label="Open value" value={currency.format(kpis.totalValue)} description={`${kpis.openCount} open projects`} />
          <KpiTile label="Proposals out" value={kpis.proposalsOut} unit="awaiting decision" />
          <KpiTile label="In production" value={kpis.inProduction} unit="active jobs" />
          <KpiTile label="Closed this month" value={kpis.wonThisMonth} unit="wins" />
        </div>
      </Section>

      <Section>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <PipelineFiltersBar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
          <Tabs<ViewMode>
            value={viewMode}
            onChange={setViewMode}
            items={[
              { id: 'kanban', label: 'Kanban', icon: <LayoutGrid /> },
              { id: 'list',   label: 'List',   icon: <List /> },
            ]}
          />
        </div>
      </Section>

      {error && (
        <Section>
          <div className="rounded-studio-3 border border-signal-500/30 bg-signal-50 dark:bg-signal-500/10 p-4 studio-text-body">
            <strong className="font-semibold">Couldn&apos;t load pipeline.</strong>{' '}
            <span className="text-ink-2 dark:text-ink-d-2">{error}</span>{' '}
            <button onClick={refetch} className="underline ml-1">Retry</button>
          </div>
        </Section>
      )}

      <Section>
        {viewMode === 'kanban' ? (
          <PipelineKanban
            cards={filtered}
            visibleStages={[...STAGE_ORDER]}
            onOpenCard={openCardDrawer}
          />
        ) : (
          <PipelineList
            cards={filtered}
            visibleStages={[...STAGE_ORDER]}
            onOpenCard={openCardDrawer}
          />
        )}
      </Section>

      <ProjectDrawer open={Boolean(openCard)} onClose={closeDrawer} card={openCard} />
    </PageContainer>
  );
}
