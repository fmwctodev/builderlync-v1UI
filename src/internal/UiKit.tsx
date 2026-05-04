import { useState } from 'react';
import {
  ArrowRight, Plus, Sparkles, MapPin, Phone,
  Mail, Calendar as CalendarIcon, Trash2, ExternalLink, FileText, Ruler,
} from 'lucide-react';
import {
  Avatar, AvatarStack, Button, Card, CardBody, CardFooter, CardHeader, Chip,
  Combobox, EmptyState, Field, IconButton, Input, KBD, KBDSequence, KpiTile,
  Modal, PageContainer, PageHeader, Section, SectionHeader, Select,
  StageChip, Switch, Table, TableBody, TableCell, TableHead, TableHeader,
  TableRow, Tabs, Textarea, Tooltip, useToast,
} from '../shared/components/ui';
import { STAGE_ORDER, type PipelineStage } from '../shared/tokens';

/**
 * Internal UiKit demo route — render every Studio primitive in one place
 * so the design system can be visually verified at a glance.
 *
 * Mount under /org/:orgSlug/internal/uikit (or anywhere convenient).
 */
export default function UiKit() {
  const [tab, setTab] = useState<'overview' | 'forms' | 'data' | 'overlay'>('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [comboValue, setComboValue] = useState<string>('claude');
  const [selectValue, setSelectValue] = useState<string>('residential');
  const toast = useToast();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Internal · Studio system"
        title="Studio UI kit"
        subtitle="Every primitive, in one place. Use this page to spot regressions during the rollout."
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon={<Sparkles />}
              onClick={() => toast.push({ tone: 'info', title: 'Hello from Sierra', description: 'AI assistant ready.' })}
            >
              Toast demo
            </Button>
            <Button variant="primary" leadingIcon={<Plus />}>
              Primary CTA
            </Button>
          </>
        }
      />

      <Section>
        <SectionHeader title="At-a-glance KPIs" description="Mono numerics, optional trend." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile label="Open pipeline" value="$412,800" delta={12.4} description="vs last 30 days" />
          <KpiTile label="Estimates booked" value="48" unit="this month" delta={-3.1} />
          <KpiTile label="Avg days to close" value="14.2" unit="days" delta={1.8} />
          <KpiTile label="Win rate" value="38" unit="%" delta={4.0} />
        </div>
      </Section>

      <Section>
        <SectionHeader title="Tabs" />
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'overview', label: 'Overview' },
            { id: 'forms', label: 'Forms', count: 6 },
            { id: 'data', label: 'Data' },
            { id: 'overlay', label: 'Overlays', disabled: false },
          ]}
        />
      </Section>

      {tab === 'overview' && (
        <>
          <Section>
            <SectionHeader title="Buttons" />
            <Card>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="primary" leadingIcon={<Plus />}>With icon</Button>
                <Button variant="primary" trailingIcon={<ArrowRight />}>Continue</Button>
                <Button variant="primary" loading>Loading</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="quiet">Quiet</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
                <IconButton label="Add" variant="primary"><Plus /></IconButton>
                <IconButton label="Open" variant="secondary"><ExternalLink /></IconButton>
                <IconButton label="Delete" variant="ghost"><Trash2 /></IconButton>
              </div>
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Cards" description="Hairline + s1; interactive variant lifts on hover." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader title="Static card" description="Default surface." />
                <CardBody>Used everywhere lists, dashboards, and detail surfaces sit. The hairline border + s1 shadow combination is the Studio default.</CardBody>
              </Card>
              <Card interactive>
                <CardHeader title="Interactive" description="Hover to see lift." />
                <CardBody>Cursor pointer; translateY(-1px) and s2 shadow on hover.</CardBody>
                <CardFooter>
                  <Button variant="ghost" size="sm">Cancel</Button>
                  <Button variant="primary" size="sm">Open</Button>
                </CardFooter>
              </Card>
              <Card sunken>
                <CardHeader title="Sunken" description="For nesting inside drawers." />
                <CardBody>No shadow; sits on the page. Use in drawers, modals, or section bodies.</CardBody>
              </Card>
            </div>
          </Section>

          <Section>
            <SectionHeader title="Stage chips" description="Pipeline stage badges." />
            <Card>
              <div className="flex flex-wrap gap-2">
                {STAGE_ORDER.map((stage: PipelineStage) => (
                  <StageChip key={stage} stage={stage} />
                ))}
              </div>
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Chips" description="Tones for tags, counts, statuses." />
            <Card>
              <div className="flex flex-wrap gap-2">
                <Chip>Default</Chip>
                <Chip tone="signal">Signal</Chip>
                <Chip tone="ok">OK</Chip>
                <Chip tone="warn">Warning</Chip>
                <Chip tone="info">Info</Chip>
                <Chip leadingIcon={<MapPin />}>Boulder, CO</Chip>
              </div>
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Avatars" />
            <Card>
              <div className="flex items-center gap-4">
                <Avatar name="Marcus Hill" size="xs" />
                <Avatar name="Sasha Lee" size="sm" />
                <Avatar name="Jamal Ortega" size="md" />
                <Avatar name="Robin Park" size="lg" />
                <AvatarStack names={['Marcus Hill', 'Sasha Lee', 'Jamal Ortega', 'Robin Park', 'Avery Stone']} max={3} />
              </div>
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Keyboard" />
            <Card>
              <div className="flex items-center gap-4">
                <KBD>⌘</KBD>
                <KBDSequence keys={['⌘', 'K']} />
                <KBDSequence keys={['Ctrl', 'Shift', 'P']} />
              </div>
            </Card>
          </Section>
        </>
      )}

      {tab === 'forms' && (
        <Section>
          <SectionHeader title="Form primitives" />
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Project name" required>
                {(props) => <Input {...props} placeholder="Smith — Re-roof" />}
              </Field>

              <Field label="Job type" description="Affects pricing template defaults">
                {() => (
                  <Select
                    value={selectValue}
                    onChange={setSelectValue}
                    options={[
                      { value: 'residential', label: 'Residential' },
                      { value: 'commercial', label: 'Commercial' },
                      { value: 'insurance', label: 'Insurance' },
                    ]}
                  />
                )}
              </Field>

              <Field label="Owner" description="Assigned rep on the account">
                {() => (
                  <Combobox
                    value={comboValue}
                    onChange={setComboValue}
                    options={[
                      { value: 'claude', label: 'Claude Anthropic', description: 'Account exec' },
                      { value: 'jamal', label: 'Jamal Ortega', description: 'Estimator' },
                      { value: 'sasha', label: 'Sasha Lee', description: 'Production lead' },
                    ]}
                  />
                )}
              </Field>

              <Field label="Address">
                {(props) => <Input {...props} leadingIcon={<MapPin />} placeholder="1234 Maple St" />}
              </Field>

              <Field label="Phone">
                {(props) => <Input {...props} numeric leadingIcon={<Phone />} placeholder="(555) 555-1234" />}
              </Field>

              <Field label="Email">
                {(props) => <Input {...props} type="email" leadingIcon={<Mail />} placeholder="owner@example.com" />}
              </Field>

              <Field label="Visit date">
                {(props) => <Input {...props} type="date" leadingIcon={<CalendarIcon />} />}
              </Field>

              <Field label="Notes" description="Visible to your team only">
                {(props) => <Textarea {...props} placeholder="Storm damage; insurance claim filed; follow up Tuesday." />}
              </Field>

              <div className="md:col-span-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Switch checked={switchOn} onChange={setSwitchOn} label="Enable AI suggestions" />
                  <span className="studio-text-body">Enable AI suggestions on this project</span>
                </div>
                <Button variant="primary" leadingIcon={<Plus />}>Save draft</Button>
              </div>
            </div>
          </Card>
        </Section>
      )}

      {tab === 'data' && (
        <>
          <Section>
            <SectionHeader title="Table" description="Hairline rows; mono numerics." />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead numeric>Value</TableHead>
                  <TableHead numeric>Days in stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { p: 'Smith — Re-roof',     s: 'proposal',    c: 'Drew Smith',     v: '$24,500', d: 3 },
                  { p: 'Patel — Storm claim', s: 'measurement', c: 'Anika Patel',    v: '$18,200', d: 8 },
                  { p: 'Garcia — New build',  s: 'job',         c: 'Mateo Garcia',   v: '$92,800', d: 12 },
                  { p: 'Lee — Tear-off',      s: 'invoice',     c: 'Hyo Lee',        v: '$31,400', d: 1 },
                ].map((row) => (
                  <TableRow key={row.p} interactive>
                    <TableCell>{row.p}</TableCell>
                    <TableCell><StageChip stage={row.s as PipelineStage} /></TableCell>
                    <TableCell muted>{row.c}</TableCell>
                    <TableCell numeric>{row.v}</TableCell>
                    <TableCell numeric>{row.d}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section>
            <SectionHeader title="Empty states" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card flush>
                <EmptyState
                  icon={<FileText />}
                  title="No proposals yet"
                  description="Drafts and sent proposals show up here once you generate one."
                  primaryAction={<Button variant="primary" leadingIcon={<Sparkles />}>Generate with AI</Button>}
                  secondaryAction={<Button variant="secondary">New blank</Button>}
                />
              </Card>
              <Card flush>
                <EmptyState
                  inline
                  icon={<Ruler />}
                  title="No measurement orders"
                  description="Order EagleView reports or capture DIY measurements."
                  primaryAction={<Button variant="primary" size="sm">Order measurement</Button>}
                />
              </Card>
            </div>
          </Section>
        </>
      )}

      {tab === 'overlay' && (
        <Section>
          <SectionHeader title="Overlays" />
          <Card>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={() => setModalOpen(true)}>Open modal</Button>
              <Tooltip content="Tooltip on hover (240ms delay)">
                <Button variant="secondary">Hover me</Button>
              </Tooltip>
              <Button
                variant="ghost"
                onClick={() => toast.push({ tone: 'ok', title: 'Saved', description: 'Project moved to Proposal stage.' })}
              >
                Toast: success
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast.push({ tone: 'warn', title: 'Heads up', description: 'Measurement still pending.' })}
              >
                Toast: warning
              </Button>
              <Button
                variant="ghost"
                onClick={() => toast.push({ tone: 'error', title: 'Could not advance', description: 'Proposal must be signed first.', action: { label: 'Open proposal', onClick: () => null } })}
              >
                Toast: error
              </Button>
            </div>
          </Card>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm advance"
            description="Move Smith — Re-roof from Proposal to Job?"
            footer={
              <>
                <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={() => { setModalOpen(false); toast.push({ tone: 'ok', title: 'Stage advanced' }); }}>
                  Confirm
                </Button>
              </>
            }
          >
            <p className="studio-text-body">
              This will create a Job linked to Proposal #P-204. The signed PDF will be attached automatically.
            </p>
          </Modal>
        </Section>
      )}
    </PageContainer>
  );
}
