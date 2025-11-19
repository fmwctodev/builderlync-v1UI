import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';

interface ProductCatalogProps {
  onBack: () => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const products = [
    { id: '1', sku: 'GAF-001', manufacturer: 'GAF', name: 'Timberline HD Shingles', description: 'Architectural shingles with advanced protection' },
    { id: '2', sku: 'OC-002', manufacturer: 'Owens Corning', name: 'Duration Shingles', description: 'Premium architectural shingles' },
    { id: '3', sku: 'CT-003', manufacturer: 'CertainTeed', name: 'Landmark Shingles', description: 'Designer shingles with enhanced durability' },
    { id: '4', sku: 'IKO-004', manufacturer: 'IKO', name: 'Cambridge Shingles', description: 'Dual-layered architectural shingles' },
    { id: '5', sku: 'TAM-005', manufacturer: 'Tamko', name: 'Heritage Shingles', description: 'Premium laminated shingles' }
  ];

  const handleAddToCart = (product: any) => {
    console.log('Added to cart:', product);
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button 
              onClick={onBack}
              className="text-white hover:text-white text-sm mb-2"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">Product Catalog</h1>
            <p className="text-white mt-1">Browse our complete selection of construction materials</p>
          </div>

          <form className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-primary-800 dark:bg-primary-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-primary-700 dark:bg-primary-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Category</h3>
                <div className="space-y-2">
                  {['Roofing', 'Siding', 'Gutters', 'Insulation'].map((category) => (
                    <label key={category} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-600 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-300">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-white mb-2">Manufacturer</h3>
                <div className="space-y-2">
                  {['GAF', 'Owens Corning', 'CertainTeed', 'IKO'].map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-600 text-primary-600 focus:ring-primary-500" />
                      <span className="ml-2 text-sm text-gray-300">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-primary-700 dark:bg-primary-600 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Family Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {products
                  .filter(product => 
                    searchQuery === '' || 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-primary-800 dark:hover:bg-primary-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{product.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.manufacturer}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{product.name}</span>
                          <span className="text-gray-400">{product.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-300">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;