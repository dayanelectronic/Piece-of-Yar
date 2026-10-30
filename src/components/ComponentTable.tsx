import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  AlertTriangle,
  QrCode,
  FileText,
  Plus,
  Minus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Component } from '../types';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { getCategoryLabel } from '../data/categories';

interface ComponentTableProps {
  components: Component[];
  onSelectComponent: (component: Component) => void;
  onEditComponent: (component: Component) => void;
  onDeleteComponent: (componentId: string) => void;
  onQuickAdjustStock: (component: Component, delta: number) => void;
  onOpenAdjustmentModal: (component: Component) => void;
  onOpenQrLabel: (component: Component) => void;
  sortField: keyof Component | 'location';
  sortOrder: 'asc' | 'desc';
  onSort: (field: keyof Component | 'location') => void;
  onSelectTag?: (tag: string) => void;
  onSelectCategory?: (category: any) => void;
}

export const ComponentTable: React.FC<ComponentTableProps> = ({
  components,
  onSelectComponent,
  onEditComponent,
  onDeleteComponent,
  onQuickAdjustStock,
  onOpenAdjustmentModal,
  onOpenQrLabel,
  sortField,
  sortOrder,
  onSort,
  onSelectTag,
  onSelectCategory,
}) => {
  const renderSortIndicator = (field: keyof Component | 'location') => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 inline-block text-cyan-400 mr-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline-block text-cyan-400 mr-1" />
    );
  };

  if (components.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        <p className="text-base font-medium text-slate-200 mb-1">
          قطعه‌ای مطابق با فیلترهای انتخابی پیدا نشد.
        </p>
        <p className="text-xs text-slate-500">
          لطفاً کلمات کلیدی یا فیلتر دسته‌بندی را تغییر دهید یا قطعه جدیدی اضافه کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium select-none">
              <th
                onClick={() => onSort('mpn')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                کد فنی (MPN) {renderSortIndicator('mpn')}
              </th>
              <th
                onClick={() => onSort('name')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                نام و شرح قطعه {renderSortIndicator('name')}
              </th>
              <th
                onClick={() => onSort('category')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                دسته‌بندی {renderSortIndicator('category')}
              </th>
              <th
                onClick={() => onSort('package')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                پکیج / فوت‌پرینت {renderSortIndicator('package')}
              </th>
              <th
                onClick={() => onSort('location')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                محل نگهداری {renderSortIndicator('location')}
              </th>
              <th
                onClick={() => onSort('quantity')}
                className="py-3 px-4 text-center cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                موجودی {renderSortIndicator('quantity')}
              </th>
              <th
                onClick={() => onSort('unitPrice')}
                className="py-3 px-4 text-left cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
              >
                قیمت واحد {renderSortIndicator('unitPrice')}
              </th>
              <th className="py-3 px-4 text-center whitespace-nowrap">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {components.map((comp) => {
              const isLowStock = comp.quantity <= comp.minStock;

              return (
                <tr
                  key={comp.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* MPN / Part Number */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                    <button
                      onClick={() => onSelectComponent(comp)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5"
                    >
                      <span>{comp.mpn}</span>
                      {comp.datasheetUrl && (
                        <FileText className="w-3 h-3 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                  </td>

                  {/* Name and tags */}
                  <td className="py-3 px-4 max-w-xs">
                    <div
                      onClick={() => onSelectComponent(comp)}
                      className="cursor-pointer text-slate-200 font-medium truncate"
                      title={comp.name}
                    >
                      {comp.name}
                    </div>
                    {comp.tags && comp.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {comp.tags.slice(0, 3).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTag?.(tag);
                            }}
                            className="text-[10px] text-purple-400 hover:text-purple-200 hover:underline"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSelectCategory?.(comp.category)}
                      className="text-slate-400 hover:text-cyan-400 hover:underline transition-colors"
                    >
                      {getCategoryLabel(comp.category)}
                    </button>
                  </td>

                  {/* Package & Mount type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-mono text-slate-300">{comp.package}</div>
                    <div className="text-[11px] text-slate-500">
                      {comp.mountingType === 'smd' ? 'SMD روبردی' : 'Through-Hole پایه‌دار'}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                    <div className="flex items-center gap-1.5 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {comp.location?.box || 'نامشخص'} · {comp.location?.drawer || '-'}
                      </span>
                    </div>
                    {comp.location?.bin && (
                      <div className="text-[11px] text-slate-500 mr-5">
                        {comp.location.bin}
                      </div>
                    )}
                  </td>

                  {/* Stock Quantity with Quick +/- */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdjustStock(comp, -1);
                        }}
                        disabled={comp.quantity <= 0}
                        title="کاهش یک عدد"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onOpenAdjustmentModal(comp)}
                        title="ثبت ورود یا خروج دقیق انبار"
                        className="px-2 font-mono tabular-nums font-bold text-xs cursor-pointer hover:text-cyan-400 transition-colors"
                      >
                        <span className={isLowStock ? 'text-amber-400' : 'text-slate-100'}>
                          {formatNumber(comp.quantity)}
                        </span>
                        <span className="text-[10px] text-slate-500 mr-1 font-sans">
                          {comp.unit}
                        </span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAdjustStock(comp, 1);
                        }}
                        title="افزایش یک عدد"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {isLowStock && (
                      <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>کسری (حداقل: {formatNumber(comp.minStock)})</span>
                      </div>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="py-3 px-4 text-left font-mono tabular-nums text-slate-300 whitespace-nowrap">
                    {formatCurrency(comp.unitPrice)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onOpenQrLabel(comp)}
                        title="چاپ برچسب و QR کشو"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditComponent(comp)}
                        title="ویرایش قطعه"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف قطعه ${comp.mpn} اطمینان دارید؟`)) {
                            onDeleteComponent(comp.id);
                          }
                        }}
                        title="حذف قطعه"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
