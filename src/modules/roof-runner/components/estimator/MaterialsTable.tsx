import React from 'react';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import type { InstantEstimatorMaterial } from '../../types/instantEstimatorSettings';

interface MaterialsTableProps {
  materials: InstantEstimatorMaterial[];
  onAdd: () => void;
  onEdit: (material: InstantEstimatorMaterial) => void;
  onDelete: (materialId: string) => void;
  pricingType: 'per-square-foot' | 'per-square';
}

const MaterialsTable: React.FC<MaterialsTableProps> = ({
  materials,
  onAdd,
  onEdit,
  onDelete,
  pricingType,
}) => {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const formatPrice = (price: number | null): string => {
    if (price === null || price === undefined) return '-';
    return `$${price.toFixed(2)}`;
  };

  const getPriceUnit = () => {
    return pricingType === 'per-square-foot' ? '/sqft' : '/sq';
  };

  const getMaterialTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      Asphalt: 'bg-gray-600',
      Metal: 'bg-slate-500',
      Tile: 'bg-amber-600',
      Slate: 'bg-stone-600',
      'Wood Shake': 'bg-orange-700',
      Synthetic: 'bg-teal-600',
      'Flat/TPO': 'bg-blue-600',
      EPDM: 'bg-zinc-700',
      'Modified Bitumen': 'bg-neutral-600',
    };
    return colors[type] || 'bg-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Material options
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Low
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Moderate
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Steep
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Flat
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Multi-story surcharge
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {materials.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  <p className="mb-2">No materials added yet</p>
                  <button
                    onClick={onAdd}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Add your first material
                  </button>
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr
                  key={material.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${getMaterialTypeColor(
                          material.material_type
                        )} rounded flex items-center justify-center flex-shrink-0`}
                      >
                        {material.image_url ? (
                          <img
                            src={material.image_url}
                            alt={material.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-white text-sm font-medium">
                            {material.material_type.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {material.name || 'Unnamed material'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {material.material_type}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPrice(material.low_price)}
                      {material.low_price !== null && (
                        <span className="text-xs text-gray-500">{getPriceUnit()}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPrice(material.moderate_price)}
                      {material.moderate_price !== null && (
                        <span className="text-xs text-gray-500">{getPriceUnit()}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPrice(material.steep_price)}
                      {material.steep_price !== null && (
                        <span className="text-xs text-gray-500">{getPriceUnit()}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPrice(material.flat_price)}
                      {material.flat_price !== null && (
                        <span className="text-xs text-gray-500">{getPriceUnit()}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatPrice(material.multi_story_surcharge)}
                      {material.multi_story_surcharge !== null && (
                        <span className="text-xs text-gray-500">{getPriceUnit()}</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === material.id ? null : material.id)
                        }
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {openMenuId === material.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                            <button
                              onClick={() => {
                                onEdit(material);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDelete(material.id);
                                setOpenMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;
