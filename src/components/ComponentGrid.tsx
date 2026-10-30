import React from 'react';
import {
  MapPin,
  AlertTriangle,
  QrCode,
  FileText,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Cpu,
} from 'lucide-react';
import { Component } from '../types';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { getCategoryLabel } from '../data/categories';

interface ComponentGridProps {
  components: Component[];
  onSelectComponent: (component: Component) => void;
  onEditComponent: (component: Component) => void;
  onDeleteComponent: (componentId: string) => void;
  onQuickAdjustStock: (component: Component, delta: number) => void;
  onOpenAdjustmentModal: (component: Component) => void;
  onOpenQrLabel: (component: Component) => void;
  onSelectTag?: (tag: string) => void;
  onSelectCategory?: (category: any) => void;
}

export const ComponentGrid: React.FC<ComponentGridProps> = ({
  components,
  onSelectComponent,
  onEditComponent,
  onDeleteComponent,
  onQuickAdjustStock,
  onOpenAdjustmentModal,
  onOpenQrLabel,
  onSelectTag,
  onSelectCategory,
}) => {
  if (components.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <p className="text-base font-medium text-slate-200 mb-1">
          قطعه‌ای مطابق با فیلترهای انتخابی پیدا نشد.
        </p>
        <p className="text-xs text-slate-500">
          لطفاً کلمات کلیدی یا فیلتر دسته‌بندی را تغییر دهید.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {components.map((comp) => {
        const isLowStock = comp.quantity <= comp.minStock;
        const firstSpecs = Object.entries(comp.specs || {}).slice(0, 3);

        return (
          <div
            key={comp.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              {/* Header: MPN, Package and Category */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div
                    onClick={() => onSelectComponent(comp)}
                    className="font-mono text-sm font-bold text-cyan-400 hover:underline cursor-pointer tracking-tight truncate"
                  >
                    {comp.mpn}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(comp.category)}
                      className="hover:text-cyan-400 hover:underline"
                    >
                      {getCategoryLabel(comp.category)}
                    </button>{' '}
                    · {comp.package}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onOpenQrLabel(comp)}
                    title="برچسب بارکد / QR"
                    className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEditComponent(comp)}
                    title="ویرایش قطعه"
                    className="p-1 text-slate-500 hover:text-emerald-400 rounded transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title / Description */}
              <div
                onClick={() => onSelectComponent(comp)}
                className="text-xs font-medium text-slate-200 line-clamp-2 cursor-pointer hover:text-white mb-3 min-h-[32px]"
                title={comp.name}
              >
                {comp.name}
              </div>

              {/* Key Specs Preview (Clean unboxed layout) */}
              {firstSpecs.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 mb-3 space-y-1 text-xs">
                  {firstSpecs.map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 text-[11px] truncate">{k}:</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate dir-ltr">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags Row */}
              {comp.tags && comp.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mb-2.5">
                  {comp.tags.slice(0, 3).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onSelectTag?.(tag)}
                      className="text-[10px] text-purple-400 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-900/40 px-1.5 py-0.5 rounded transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                  {comp.tags.length > 3 && (
                    <span className="text-[10px] text-slate-500">
                      +{comp.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">
                  {comp.location?.box || 'جعبه نامشخص'} · {comp.location?.drawer || '-'}
                  {comp.location?.bin && ` · ${comp.location.bin}`}
                </span>
              </div>
            </div>

            {/* Bottom Row: Stock Quantity & Controls */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">موجودی:</div>
                <div
                  onClick={() => onOpenAdjustmentModal(comp)}
                  className="font-mono tabular-nums text-sm font-bold cursor-pointer hover:underline flex items-center gap-1"
                >
                  <span className={isLowStock ? 'text-amber-400' : 'text-slate-100'}>
                    {formatNumber(comp.quantity)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">{comp.unit}</span>
                </div>
                {isLowStock && (
                  <span className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    کسری انبار
                  </span>
                )}
              </div>

              {/* Quick +/- controls */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1">
                <button
                  onClick={() => onQuickAdjustStock(comp, -1)}
                  disabled={comp.quantity <= 0}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onQuickAdjustStock(comp, 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
