import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Copy, Search, SlidersHorizontal, GripVertical, Eye, X, RotateCcw, ChevronDown, Link, Download, Upload } from 'lucide-react';
import { getCatalogItems, getCatalogItemById, createCatalogItem, updateCatalogItemType, deleteCatalogItem, bulkDeleteCatalogItems, duplicateCatalogItem, updateCatalogItem, CatalogItem, exportCatalogCsv, importCatalogCsv } from '../../../shared/store/services/catalogApi';
import Toast from '../../../shared/components/Toast';
import CatalogItemSidebar from '../components/catalog/CatalogItemSidebar';
import { abcSupplyService } from '../services/abcSupplyService';
import { srsService } from '../services/srsService';

interface ColumnVisibility {
  itemType: boolean;
  name: boolean;
  description: boolean;
  measurements: boolean;
  coverage: boolean;
  supplier: boolean;
  preTaxCost: boolean;
  waste: boolean;
  unit: boolean;
  salesTax: boolean;
  materialPurchaseTax: boolean;
}

export default function Catalog() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showFilterSortModal, setShowFilterSortModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [tempFilterTypes, setTempFilterTypes] = useState<string[]>([]);
  const [accordionOpen, setAccordionOpen] = useState<{sort: boolean; itemType: boolean}>({ sort: true, itemType: false });
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [abcSupplyIntegrated, setAbcSupplyIntegrated] = useState<boolean | null>(null);
  const [srsIntegrated, setSrsIntegrated] = useState<boolean | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    itemType: true,
    name: true,
    description: true,
    measurements: true,
    coverage: true,
    supplier: true,
    preTaxCost: true,
    waste: true,
    unit: true,
    salesTax: true,
    materialPurchaseTax: true,
  });

  const [sortOption, setSortOption] = useState<'name-asc' | 'name-desc' | 'date-new' | 'date-old'>('name-asc');
  const [tempSortOption, setTempSortOption] = useState<'name-asc' | 'name-desc' | 'date-new' | 'date-old'>('name-asc');

  const newItemDefaults = {
    itemType: 'Material' as const,
    name: 'New Item',
    description: '',
    measurements: '',
    coverage: 0,
    supplier: '',
    preTaxCost: 0,
    waste: 0,
    unit: 'square',
    salesTax: 0,
    materialPurchaseTax: 0,
  };

  useEffect(() => {
    loadItems();
    checkAbcSupplyIntegration();
    checkSrsIntegration();
  }, [searchQuery, filterTypes, sortOption]);

  const checkAbcSupplyIntegration = async () => {
    try {
      const status = await abcSupplyService.getStatus();
      setAbcSupplyIntegrated(status.connected);
    } catch (error) {
      setAbcSupplyIntegrated(false);
    }
  };

  const checkSrsIntegration = async () => {
    try {
      const isConnected = await srsService.validateConnection();
      setSrsIntegrated(isConnected);
    } catch (error) {
      setSrsIntegrated(false);
    }
  };
