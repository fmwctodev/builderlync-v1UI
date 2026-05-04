import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageContainer, Button } from '../../../shared/components/ui';
import { usePipelineCards } from '../../../shared/lib/pipeline';
import { ProjectDrawer } from '../components/ProjectDrawer';

/**
 * Full-page variant of the project drawer, mounted at /org/:orgSlug/projects/:cardKey.
 * Renders the same drawer component as a modal-overlay-on-page so users can
 * deep-link / share the URL and the drawer composition stays identical.
 */
export default function ProjectFullPage() {
  const { cardKey } = useParams<{ cardKey: string }>();
  const navigate = useNavigate();
  const { cards } = usePipelineCards();

  const card = useMemo(
    () => (cardKey ? cards.find((c) => c.cardKey === decodeURIComponent(cardKey)) ?? null : null),
    [cards, cardKey],
  );

  return (
    <PageContainer>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        Back
      </Button>

      {/* Drawer content rendered always-open; close → navigate back. */}
      <ProjectDrawer open card={card} onClose={() => navigate(-1)} />
    </PageContainer>
  );
}
