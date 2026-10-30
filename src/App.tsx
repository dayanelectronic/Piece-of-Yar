/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  Coins,
  Search,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  Component,
  ComponentCategory,
  ProjectBOM,
  StockTransaction,
  TransactionType,
} from './types';
import {
  getInitialComponents,
  saveComponents,
  getInitialTransactions,
  saveTransactions,
  getInitialProjects,
  saveProjects,
  exportAllData,
  exportComponentsCSV,
} from './utils/storage';
import { INITIAL_COMPONENTS, INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from './data/initialData';
import { CATEGORIES } from './data/categories';
import { formatNumber, formatCurrency } from './utils/formatters';

import { Header } from './components/Header';
import { ComponentTable } from './components/ComponentTable';
import { ComponentGrid } from './components/ComponentGrid';
import { TagFilterSection } from './components/TagFilterSection';
import { SmartSearchSection } from './components/SmartSearchSection';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { ComponentFormModal } from './components/ComponentFormModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { BomManager } from './components/BomManager';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { PinoutLibraryModal } from './components/PinoutLibraryModal';
import { LabelPrintModal } from './components/LabelPrintModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export default function App() {
  // Primary datasets
  const [inventory, setInventory] = useState<Component[]>(() => getInitialComponents());
  const [transactions, setTransactions] = useState<StockTransaction[]>(() =>
    getInitialTransactions()
  );
  const [projects, setProjects] = useState<ProjectBOM[]>(() => getInitialProjects());

  // App Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('electrostock_theme') as 'dark' | 'light') || 'dark';
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<
    'inventory' | 'smart-search' | 'bom' | 'history' | 'pinouts'
  >('inventory');

  // Inventory View Mode (Table vs Grid)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Inventory Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ComponentCategory>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mountingFilter, setMountingFilter] = useState<'all' | 'smd' | 'through_hole'>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sortField, setSortField] = useState<keyof Component | 'location'>('mpn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [detailComponent, setDetailComponent] = useState<Component | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [adjustmentTarget, setAdjustmentTarget] = useState<Component | null>(null);
  const [qrLabelComponent, setQrLabelComponent] = useState<Component | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantTargetComp, setAssistantTargetComp] = useState<Component | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync theme class with HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('electrostock_theme', theme);
  }, [theme]);

  // Persist inventory
  useEffect(() => {
    saveComponents(inventory);
  }, [inventory]);

  // Persist transactions
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  // Persist projects
  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // KPI Calculations
  const lowStockCount = useMemo(() => {
    return inventory.filter((c) => c.quantity <= c.minStock).length;
  }, [inventory]);

  const totalQuantity = useMemo(() => {
    return inventory.reduce((sum, c) => sum + (c.quantity || 0), 0);
  }, [inventory]);

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce(
      (sum, c) => sum + (c.quantity || 0) * (c.unitPrice || 0),
      0
    );
  }, [inventory]);

  // Filtered & Sorted Inventory
  const filteredComponents = useMemo(() => {
    return inventory
      .filter((comp) => {
        // Search term
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchMpn = comp.mpn.toLowerCase().includes(q);
          const matchName = comp.name.toLowerCase().includes(q);
          const matchPkg = comp.package.toLowerCase().includes(q);
          const matchTags = (comp.tags || []).some((t) => t.toLowerCase().includes(q));
          const matchMfr = (comp.manufacturer || '').toLowerCase().includes(q);
          const matchLoc = `${comp.location?.box || ''} ${comp.location?.drawer || ''}`
            .toLowerCase()
            .includes(q);
          const matchSpecs = Object.values(comp.specs || {}).some((v) =>
            v.toLowerCase().includes(q)
          );
          if (
            !matchMpn &&
            !matchName &&
            !matchPkg &&
            !matchTags &&
            !matchMfr &&
            !matchLoc &&
            !matchSpecs
          ) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && comp.category !== selectedCategory) {
          return false;
        }

        // Custom Tags filter (component must include all selected tags)
        if (selectedTags.length > 0) {
          const compTagsLower = (comp.tags || []).map((t) => t.toLowerCase());
          const matchAllTags = selectedTags.every((t) =>
            compTagsLower.includes(t.toLowerCase())
          );
          if (!matchAllTags) {
            return false;
          }
        }

        // Mounting type filter
        if (mountingFilter !== 'all' && comp.mountingType !== mountingFilter) {
          return false;
        }

        // Low stock filter
        if (onlyLowStock && comp.quantity > comp.minStock) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof Component];
        let valB: any = b[sortField as keyof Component];

        if (sortField === 'location') {
          valA = `${a.location?.box || ''} ${a.location?.drawer || ''}`;
          valB = `${b.location?.box || ''} ${b.location?.drawer || ''}`;
        }

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB, 'fa')
            : valB.localeCompare(valA, 'fa');
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    inventory,
    searchQuery,
    selectedCategory,
    selectedTags,
    mountingFilter,
    onlyLowStock,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: keyof Component | 'location') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectDirectTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    if (currentTab !== 'inventory') {
      setCurrentTab('inventory');
    }
  };

  const handleSelectDirectCategory = (category: 'all' | ComponentCategory) => {
    setSelectedCategory(category);
    if (currentTab !== 'inventory') {
      setCurrentTab('inventory');
    }
  };

  // Stock operations
  const handleQuickAdjust = (comp: Component, delta: number) => {
    const newQty = Math.max(0, comp.quantity + delta);
    const updatedComp = { ...comp, quantity: newQty };
    setInventory((prev) => prev.map((c) => (c.id === comp.id ? updatedComp : c)));

    // Record transaction
    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      componentId: comp.id,
      componentMpn: comp.mpn,
      componentName: comp.name,
      type: delta > 0 ? 'in' : 'out',
      quantity: Math.abs(delta),
      balanceAfter: newQty,
      reason: delta > 0 ? 'افزایش سریع موجودی' : 'کاهش سریع موجودی',
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      `موجودی ${comp.mpn} ${delta > 0 ? 'افزایش' : 'کاهش'} یافت (${formatNumber(newQty)} عدد)`
    );
  };

  const handleFormalAdjust = (
    componentId: string,
    type: TransactionType,
    quantity: number,
    reason: string,
    projectName?: string
  ) => {
    const comp = inventory.find((c) => c.id === componentId);
    if (!comp) return;

    let newBalance = comp.quantity;
    if (type === 'in') {
      newBalance = comp.quantity + quantity;
    } else if (type === 'out') {
      newBalance = Math.max(0, comp.quantity - quantity);
    } else if (type === 'adjust') {
      newBalance = quantity;
    }

    const updated = { ...comp, quantity: newBalance, updatedAt: new Date().toISOString() };
    setInventory((prev) => prev.map((c) => (c.id === componentId ? updated : c)));

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      componentId: comp.id,
      componentMpn: comp.mpn,
      componentName: comp.name,
      type,
      quantity,
      balanceAfter: newBalance,
      reason,
      projectName,
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update detail view if currently open
    if (detailComponent && detailComponent.id === componentId) {
      setDetailComponent(updated);
    }

    showToast(`عملیات انبار برای قطعه ${comp.mpn} با موفقیت ثبت شد.`);
  };

  // Component save (create or update)
  const handleSaveComponent = (saved: Component) => {
    const exists = inventory.some((c) => c.id === saved.id);
    if (exists) {
      setInventory((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      showToast(`مشخصات قطعه ${saved.mpn} با موفقیت به‌روزرسانی شد.`);
    } else {
      setInventory((prev) => [saved, ...prev]);
      // Record initial stock transaction if quantity > 0
      if (saved.quantity > 0) {
        const newTx: StockTransaction = {
          id: `tx-${Date.now()}`,
          componentId: saved.id,
          componentMpn: saved.mpn,
          componentName: saved.name,
          type: 'in',
          quantity: saved.quantity,
          balanceAfter: saved.quantity,
          reason: 'موجودی اولیه ثبت قطعه',
          date: new Date().toISOString(),
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
      showToast(`قطعه جدید ${saved.mpn} در انبار ثبت گردید.`);
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    const comp = inventory.find((c) => c.id === componentId);
    setInventory((prev) => prev.filter((c) => c.id !== componentId));
    if (detailComponent && detailComponent.id === componentId) {
      setDetailComponent(null);
    }
    showToast(`قطعه ${comp?.mpn || ''} از انبار حذف شد.`);
  };

  // Deduct BOM for Project
  const handleDeductProjectBom = (project: ProjectBOM) => {
    const newInventory = [...inventory];
    const newTxs: StockTransaction[] = [];

    project.items.forEach((item) => {
      const idx = newInventory.findIndex((c) => c.id === item.componentId);
      if (idx !== -1) {
        const comp = newInventory[idx];
        const needed = item.quantityPerUnit * project.batchSize;
        const newQty = Math.max(0, comp.quantity - needed);
        newInventory[idx] = { ...comp, quantity: newQty };

        newTxs.push({
          id: `tx-${Date.now()}-${item.componentId}`,
          componentId: comp.id,
          componentMpn: comp.mpn,
          componentName: comp.name,
          type: 'out',
          quantity: needed,
          balanceAfter: newQty,
          reason: `تولید ${project.batchSize} عدد برد پروژه`,
          projectName: project.name,
          date: new Date().toISOString(),
        });
      }
    });

    setInventory(newInventory);
    setTransactions((prev) => [...newTxs, ...prev]);
    showToast(`قطعات مورد نیاز پروژه «${project.name}» از انبار کسر شد.`);
  };

  const handleResetData = () => {
    if (
      confirm(
        'آیا از بازنشانی داده‌ها به لیست اولیه قطعات الکترونیک اطمینان دارید؟ اطلاعات فعلی پاک خواهد شد.'
      )
    ) {
      setInventory(INITIAL_COMPONENTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setProjects(INITIAL_PROJECTS);
      showToast('داده‌های انبار به تنظیمات اولیه بازنشانی شد.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-cyan-500/50 shadow-xl rounded-xl px-4 py-3 text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract (Brand - Nav Links - Primary CTA) */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewComponentModal={() => {
          setEditingComponent(null);
          setIsFormOpen(true);
        }}
        onOpenSmartSearch={() => setCurrentTab('smart-search')}
        onOpenAssistant={() => {
          setAssistantTargetComp(null);
          setIsAssistantOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onExportBackup={() => exportAllData(inventory, transactions, projects)}
        onExportCSV={() => exportComponentsCSV(inventory)}
        onResetData={handleResetData}
        lowStockCount={lowStockCount}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Summary Metrics Strip (Clean single-elevation depth) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Unique Components */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>تنوع قطعات (Unique MPN)</span>
            </div>
            <div className="font-mono text-xl font-bold text-slate-100">
              {formatNumber(inventory.length)}
              <span className="text-xs font-sans text-slate-500 mr-1.5 font-normal">
                قلم کالا
              </span>
            </div>
          </div>

          {/* Card 2: Total Units in Stock */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>کل قطعات فیزیکی موجود</span>
            </div>
            <div className="font-mono text-xl font-bold text-slate-100">
              {formatNumber(totalQuantity)}
              <span className="text-xs font-sans text-slate-500 mr-1.5 font-normal">
                عدد در انبار
              </span>
            </div>
          </div>

          {/* Card 3: Low Stock Alerts */}
          <div
            onClick={() => {
              setOnlyLowStock(!onlyLowStock);
              if (currentTab !== 'inventory') setCurrentTab('inventory');
            }}
            className={`border rounded-xl p-4 cursor-pointer transition-colors ${
              onlyLowStock
                ? 'bg-amber-950/40 border-amber-600'
                : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>اقلام رو به اتمام (کسری)</span>
              </span>
              {onlyLowStock && (
                <span className="text-[10px] text-amber-400 font-medium">فیلتر فعال</span>
              )}
            </div>
            <div className="font-mono text-xl font-bold text-amber-400">
              {formatNumber(lowStockCount)}
              <span className="text-xs font-sans text-slate-400 mr-1.5 font-normal">
                قطعه نیازمند سفارش
              </span>
            </div>
          </div>

          {/* Card 4: Inventory Valuation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>ارزش کل موجودی قطعات</span>
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-slate-100 truncate">
              {formatCurrency(totalInventoryValue)}
            </div>
          </div>
        </div>

        {/* Tab 1: Inventory Catalog */}
        {currentTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Instant Search Input */}
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی سریع پارت‌نامبر، نام، پکیج، تگ یا کشو..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Right side controls: View switch & Quick filters */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  {/* Mounting Type Filter */}
                  <select
                    value={mountingFilter}
                    onChange={(e) => setMountingFilter(e.target.value as any)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
                  >
                    <option value="all">همه انواع مونتاژ</option>
                    <option value="smd">فقط SMD</option>
                    <option value="through_hole">فقط Through-Hole</option>
                  </select>

                  {/* Low Stock Toggle button */}
                  <button
                    onClick={() => setOnlyLowStock(!onlyLowStock)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      onlyLowStock
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>فقط کسری ({formatNumber(lowStockCount)})</span>
                  </button>

                  {/* View Mode Switcher (Table vs Grid) */}
                  <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setViewMode('table')}
                      title="نمای جدول متراکم"
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'table'
                          ? 'bg-slate-800 text-cyan-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="نمای کارت‌های بصری"
                      className={`p-1.5 rounded-md transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-slate-800 text-cyan-400'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Predefined Categories & Custom Tags Panel */}
            <TagFilterSection
              inventory={inventory}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedTags={selectedTags}
              onToggleTag={handleToggleTag}
              onClearTags={() => setSelectedTags([])}
            />

            {/* Results Counter and Active Filter Tags Reset */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <div className="flex items-center gap-2">
                <span>
                  نمایش {formatNumber(filteredComponents.length)} از {formatNumber(inventory.length)} قطعه
                </span>
                {selectedTags.length > 0 && (
                  <span className="text-[11px] text-purple-400">
                    (تگ‌های فیلتر: {selectedTags.map((t) => `#${t}`).join(' ')} )
                  </span>
                )}
              </div>
              {(searchQuery ||
                selectedCategory !== 'all' ||
                selectedTags.length > 0 ||
                mountingFilter !== 'all' ||
                onlyLowStock) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedTags([]);
                    setMountingFilter('all');
                    setOnlyLowStock(false);
                  }}
                  className="text-cyan-400 hover:underline"
                >
                  پاک کردن همه فیلترها
                </button>
              )}
            </div>

            {/* Views: Table or Grid */}
            {viewMode === 'table' ? (
              <ComponentTable
                components={filteredComponents}
                onSelectComponent={(c) => setDetailComponent(c)}
                onEditComponent={(c) => {
                  setEditingComponent(c);
                  setIsFormOpen(true);
                }}
                onDeleteComponent={handleDeleteComponent}
                onQuickAdjustStock={handleQuickAdjust}
                onOpenAdjustmentModal={(c) => setAdjustmentTarget(c)}
                onOpenQrLabel={(c) => setQrLabelComponent(c)}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
                onSelectTag={handleSelectDirectTag}
                onSelectCategory={handleSelectDirectCategory}
              />
            ) : (
              <ComponentGrid
                components={filteredComponents}
                onSelectComponent={(c) => setDetailComponent(c)}
                onEditComponent={(c) => {
                  setEditingComponent(c);
                  setIsFormOpen(true);
                }}
                onDeleteComponent={handleDeleteComponent}
                onQuickAdjustStock={handleQuickAdjust}
                onOpenAdjustmentModal={(c) => setAdjustmentTarget(c)}
                onOpenQrLabel={(c) => setQrLabelComponent(c)}
                onSelectTag={handleSelectDirectTag}
                onSelectCategory={handleSelectDirectCategory}
              />
            )}
          </div>
        )}

        {/* Tab 2: Smart AI Search */}
        {currentTab === 'smart-search' && (
          <SmartSearchSection
            inventory={inventory}
            onSelectComponent={(c) => setDetailComponent(c)}
            onQuickAdjustStock={(c) => setAdjustmentTarget(c)}
          />
        )}

        {/* Tab 3: BOM & Projects */}
        {currentTab === 'bom' && (
          <BomManager
            projects={projects}
            inventory={inventory}
            onSaveProject={(saved) => {
              setProjects((prev) => {
                const idx = prev.findIndex((p) => p.id === saved.id);
                if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = saved;
                  return copy;
                }
                return [saved, ...prev];
              });
              showToast(`پروژه «${saved.name}» ذخیره شد.`);
            }}
            onDeleteProject={(id) => {
              setProjects((prev) => prev.filter((p) => p.id !== id));
              showToast('پروژه با موفقیت حذف شد.');
            }}
            onDeductProjectBom={handleDeductProjectBom}
            onSelectComponent={(c) => setDetailComponent(c)}
          />
        )}

        {/* Tab 4: Stock Transaction History */}
        {currentTab === 'history' && (
          <TransactionHistoryView transactions={transactions} />
        )}

        {/* Tab 5: Pinout & Resistor Library */}
        {currentTab === 'pinouts' && <PinoutLibraryModal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 text-slate-500 text-xs py-4 px-6 text-center">
        قطعه‌یار · سامانه هوشمند مدیریت، دسته‌بندی و انبارداری قطعات الکترونیک
      </footer>

      {/* Modal: Component Details */}
      {detailComponent && (
        <ComponentDetailModal
          component={detailComponent}
          onClose={() => setDetailComponent(null)}
          onEdit={(comp) => {
            setDetailComponent(null);
            setEditingComponent(comp);
            setIsFormOpen(true);
          }}
          onOpenQrLabel={(comp) => setQrLabelComponent(comp)}
          onAskAi={(comp) => {
            setAssistantTargetComp(comp);
            setIsAssistantOpen(true);
          }}
          onOpenAdjustment={(comp) => setAdjustmentTarget(comp)}
          transactions={transactions}
          onSelectTag={handleSelectDirectTag}
          onSelectCategory={handleSelectDirectCategory}
        />
      )}

      {/* Modal: New / Edit Component */}
      {isFormOpen && (
        <ComponentFormModal
          isOpen={isFormOpen}
          initialData={editingComponent}
          onClose={() => {
            setIsFormOpen(false);
            setEditingComponent(null);
          }}
          onSave={handleSaveComponent}
        />
      )}

      {/* Modal: Stock Adjustment */}
      {adjustmentTarget && (
        <StockAdjustmentModal
          component={adjustmentTarget}
          onClose={() => setAdjustmentTarget(null)}
          onConfirm={handleFormalAdjust}
        />
      )}

      {/* Modal: QR and Drawer Label Print */}
      {qrLabelComponent && (
        <LabelPrintModal
          component={qrLabelComponent}
          onClose={() => setQrLabelComponent(null)}
        />
      )}

      {/* Drawer: AI Assistant */}
      {isAssistantOpen && (
        <AiAssistantDrawer
          isOpen={isAssistantOpen}
          selectedComponent={assistantTargetComp}
          onClose={() => {
            setIsAssistantOpen(false);
            setAssistantTargetComp(null);
          }}
        />
      )}
    </div>
  );
}
