import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../store/services/api';
import Toast from '../../../shared/components/Toast';
import { StagingBanner } from '../components/common';
import {
  PageContainer, PageHeader, Section, Button, Card, EmptyState, Modal,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, IconButton,
} from '../../../shared/components/ui';

interface Material {
  id: string;
  name: string;
  materialType: string;
  price: number;
  multiStoryPrice?: number;
  description: string;
  unit: string;
  category: string;
}

const MaterialsList: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getInstantEstimator(parseInt(id));
      const materialsData = response?.data?.materials || [];
      setMaterials(materialsData);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load materials. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDeleteMaterial = async () => {
    if (!showDeleteConfirm || !id) return;

    try {
      setDeleting(true);
      await apiService.deleteInstantEstimatorMaterial(parseInt(id), showDeleteConfirm);
      setMaterials(prev => prev.filter(m => m.id !== showDeleteConfirm));
      setToast({ message: 'Material deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to delete material:', err);
      setToast({ message: 'Failed to delete material. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(null);
    }
  };

  const getMaterialToDelete = () => {
    if (!showDeleteConfirm) return null;
    return materials.find(m => m.id === showDeleteConfirm);
  };

  if (loading) {
    return (
      <>
        <StagingBanner />
        <PageContainer>
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-signal-500 mx-auto mb-4" />
              <p className="studio-text-muted">Loading materials…</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <StagingBanner />
        <PageContainer>
          <PageHeader
            eyebrow={
              <button
                onClick={() => navigate(`/instant-estimator/${id}/manage`)}
                className="inline-flex items-center gap-1.5 studio-text-label text-signal-500 hover:underline"
              >
                <ArrowLeft className="w-3 h-3" /> Back to manage
              </button>
            }
            title="Materials"
          />
          <Section>
            <Card>
              <div className="text-center py-10">
                <AlertCircle className="w-10 h-10 text-signal-500 mx-auto mb-3" />
                <div className="studio-text-title-2 mb-1">Unable to load materials</div>
                <p className="studio-text-muted mb-5">{error}</p>
                <Button variant="primary" leadingIcon={<RefreshCw />} onClick={fetchMaterials}>
                  Try again
                </Button>
              </div>
            </Card>
          </Section>
        </PageContainer>
      </>
    );
  }

  const materialToDelete = getMaterialToDelete();

  return (
    <>
      <StagingBanner />
      <PageContainer>
        <PageHeader
          eyebrow={
            <button
              onClick={() => navigate(`/instant-estimator/${id}/manage`)}
              className="inline-flex items-center gap-1.5 studio-text-label text-signal-500 hover:underline"
            >
              <ArrowLeft className="w-3 h-3" /> Back to manage
            </button>
          }
          title="Materials"
          subtitle="Manage materials for your instant estimator."
          actions={
            <Button
              variant="primary"
              leadingIcon={<Plus />}
              onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
            >
              Add material
            </Button>
          }
        />

        <Section>
          <div className="max-w-6xl mx-auto">
            {materials.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Plus />}
                  title="No materials added yet"
                  description="Add materials you offer along with their pricing. Customers will see these options when getting estimates."
                  primaryAction={
                    <Button
                      variant="primary"
                      leadingIcon={<Plus />}
                      onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                    >
                      Add your first material
                    </Button>
                  }
                />
              </Card>
            ) : (
              <Card flush>
                <div className="px-5 py-4 border-b border-edge-soft dark:border-edge-d-soft flex items-center justify-between">
                  <div>
                    <div className="studio-text-title-2">Material options ({materials.length})</div>
                    <p className="studio-text-muted mt-0.5">
                      Add the materials you offer along with their approximate prices, including tear-off, waste, and markup.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    leadingIcon={<Plus />}
                    onClick={() => navigate(`/instant-estimator/${id}/manage/materials/new`)}
                  >
                    Add
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead numeric>Low</TableHead>
                      <TableHead numeric>Moderate</TableHead>
                      <TableHead numeric>Steep</TableHead>
                      <TableHead numeric>Flat</TableHead>
                      <TableHead numeric>Multi-story surcharge</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-signal-500 rounded-studio-1 flex items-center justify-center">
                              <span className="text-white text-caption font-medium">
                                {material.materialType?.charAt(0) || 'M'}
                              </span>
                            </div>
                            <div>
                              <div className="studio-text-body-strong">{material.name}</div>
                              <div className="studio-text-caption text-ink-3 dark:text-ink-d-3">
                                {material.materialType || 'Material'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell numeric>${material.price.toFixed(2)}/sqft</TableCell>
                        <TableCell numeric>${(material.price * 1.1).toFixed(2)}/sqft</TableCell>
                        <TableCell numeric>${(material.price * 1.3).toFixed(2)}/sqft</TableCell>
                        <TableCell numeric>${(material.price * 1.1).toFixed(2)}/sqft</TableCell>
                        <TableCell numeric>${(material.multiStoryPrice || 0).toFixed(2)}/sqft</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton
                              label="Edit material"
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/instant-estimator/${id}/manage/materials/${material.id}/edit`)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              label="Delete material"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(material.id)}
                            >
                              <Trash2 />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        </Section>
      </PageContainer>

      <Modal
        open={Boolean(showDeleteConfirm)}
        onClose={() => !deleting && setShowDeleteConfirm(null)}
        title="Delete material"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDeleteMaterial} loading={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="studio-text-body text-ink-2 dark:text-ink-d-2 mb-3">
          Are you sure you want to delete this material?
        </p>
        {materialToDelete && (
          <div className="rounded-studio-2 bg-surface-2 dark:bg-surface-d-2 p-3">
            <div className="studio-text-body-strong">{materialToDelete.name}</div>
            <div className="studio-text-caption text-ink-3 dark:text-ink-d-3">
              {materialToDelete.materialType} — ${materialToDelete.price.toFixed(2)}/sqft
            </div>
          </div>
        )}
        <p className="studio-text-caption text-ink-3 dark:text-ink-d-3 mt-3">
          This action cannot be undone.
        </p>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default MaterialsList;
