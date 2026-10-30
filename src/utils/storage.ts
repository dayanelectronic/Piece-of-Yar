import { Component, ProjectBOM, StockTransaction } from '../types';
import { INITIAL_COMPONENTS, INITIAL_PROJECTS, INITIAL_TRANSACTIONS } from '../data/initialData';

const STORAGE_KEYS = {
  COMPONENTS: 'electrostock_components_v1',
  TRANSACTIONS: 'electrostock_transactions_v1',
  PROJECTS: 'electrostock_projects_v1',
  THEME: 'electrostock_theme',
};

export function getInitialComponents(): Component[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPONENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load components from storage:', e);
  }
  return INITIAL_COMPONENTS;
}

export function saveComponents(components: Component[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPONENTS, JSON.stringify(components));
  } catch (e) {
    console.error('Failed to save components:', e);
  }
}

export function getInitialTransactions(): StockTransaction[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load transactions:', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(txs: StockTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

export function getInitialProjects(): ProjectBOM[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load projects:', e);
  }
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: ProjectBOM[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects:', e);
  }
}

export function exportAllData(
  components: Component[],
  transactions: StockTransaction[],
  projects: ProjectBOM[]
): void {
  const exportPayload = {
    app: 'GhetehYar',
    appNameFa: 'قطعه‌یار',
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    components,
    transactions,
    projects,
  };

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ghetehyar_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportComponentsCSV(components: Component[]): void {
  const headers = [
    'MPN',
    'نام قطعه',
    'دسته‌بندی',
    'پکیج',
    'نوع مونتاژ',
    'موجودی',
    'حداقل هشدار',
    'واحد',
    'محل نگهداری',
    'قیمت واحد (تومان)',
    'سازنده',
    'تگ‌ها',
    'قطعات معادل',
  ];

  const rows = components.map((c) => [
    `"${c.mpn.replace(/"/g, '""')}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.package}"`,
    `"${c.mountingType}"`,
    c.quantity,
    c.minStock,
    `"${c.unit}"`,
    `"${c.location?.box || ''} - ${c.location?.drawer || ''} - ${c.location?.bin || ''}"`,
    c.unitPrice || 0,
    `"${c.manufacturer || ''}"`,
    `"${(c.tags || []).join(', ')}"`,
    `"${(c.equivalents || []).join(', ')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ghetehyar_components_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
