import React from 'react';
import {
  X,
  MapPin,
  ExternalLink,
  Layers,
  Sparkles,
  QrCode,
  Edit2,
  Calendar,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { Component, StockTransaction } from '../types';
import { formatNumber, formatCurrency, formatIsoDate } from '../utils/formatters';
import { getCategoryLabel } from '../data/categories';

interface ComponentDetailModalProps {
  component: Component | null;
  onClose: () => void;
  onEdit: (component: Component) => void;
  onOpenQrLabel: (component: Component) => void;
  onAskAi: (component: Component) => void;
  onOpenAdjustment: (component: Component) => void;
  transactions: StockTransaction[];
  onSelectTag?: (tag: string) => void;
  onSelectCategory?: (category: any) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  onClose,
  onEdit,
  onOpenQrLabel,
  onAskAi,
  onOpenAdjustment,
  transactions,
  onSelectTag,
  onSelectCategory,
}) => {
  if (!component) return null;

  const isLowStock = component.quantity <= component.minStock;
  const compTransactions = transactions.filter((t) => t.componentId === component.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-cyan-400 tracking-wide">
                {component.mpn}
              </span>
              <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {component.package}
              </span>
              <span className="text-xs text-slate-400">
                {component.mountingType === 'smd' ? 'SMD روبردی' : 'Through-Hole'}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-200 mt-1">
              {component.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(component)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="ویرایش قطعه"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenQrLabel(component)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="چاپ برچسب"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">موجودی فعلی</div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`font-mono text-lg font-bold ${
                    isLowStock ? 'text-amber-400' : 'text-slate-100'
                  }`}
                >
                  {formatNumber(component.quantity)}
                </span>
                <span className="text-xs text-slate-500">{component.unit}</span>
              </div>
              {isLowStock && (
                <div className="text-[10px] text-amber-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>کسری انبار (حداقل: {formatNumber(component.minStock)})</span>
                </div>
              )}
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">محل نگهداری</div>
              <div className="text-xs font-medium text-slate-200 truncate">
                {component.location.box}
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                {component.location.drawer} · {component.location.bin || '-'}
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">قیمت واحد تقریبی</div>
              <div className="font-mono text-sm font-semibold text-slate-200">
                {formatCurrency(component.unitPrice)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">ارزش در انبار</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400 mb-1">سازنده / برند</div>
              <div className="text-xs font-semibold text-slate-200 truncate">
                {component.manufacturer || 'نامشخص'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {getCategoryLabel(component.category)}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenAdjustment(component)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium transition-colors"
            >
              ثبت ورود / خروج کالا
            </button>

            <button
              onClick={() => onAskAi(component)}
              className="px-4 py-2 bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>تحلیل مدار و مشاوره هوش مصنوعی</span>
            </button>

            {component.datasheetUrl && (
              <a
                href={component.datasheetUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>مشاهده دیتاشیت قطعه</span>
              </a>
            )}
          </div>

          {/* Technical Specifications */}
          {component.specs && Object.keys(component.specs).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300">
                مشخصات فنی و الکتریکی
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(component.specs).map(([specKey, specVal]) => (
                  <div
                    key={specKey}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between"
                  >
                    <span className="text-slate-400">{specKey}</span>
                    <span className="font-mono font-medium text-slate-200 dir-ltr text-right">
                      {specVal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pinout Visualizer */}
          {component.pinout && component.pinout.pins?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-300">
                  راهنمای پایه‌ها و پین‌اوت ({formatNumber(component.pinout.pinCount || component.pinout.pins.length)} پایه)
                </h3>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {component.pinout.pins.map((pin) => (
                    <div
                      key={pin.num}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/50"
                    >
                      <span className="w-6 h-6 rounded bg-slate-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {pin.num}
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono font-bold text-slate-200 ml-2">
                          {pin.name}
                        </span>
                        <span className="text-slate-400 text-[11px] leading-relaxed">
                          {pin.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Equivalents and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {component.equivalents && component.equivalents.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>قطعات معادل و جایگزین در مدار</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {component.equivalents.map((eq, i) => (
                    <span
                      key={i}
                      className="font-mono text-xs bg-slate-900 text-purple-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {component.tags && component.tags.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  برچسب‌ها و تگ‌های قطعه (برای فیلتر انبار کلیک کنید)
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
                  {component.tags.map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectTag?.(t);
                      }}
                      className="bg-slate-900 hover:bg-purple-950 text-purple-300 hover:text-purple-100 px-2 py-0.5 rounded border border-purple-900/40 text-[11px] transition-colors"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {component.notes && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-400 block mb-1">یادداشت فنی:</span>
              {component.notes}
            </div>
          )}

          {/* Transaction History for this Component */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300">
              تاریخچه ورود و خروج این قطعه
            </h3>
            {compTransactions.length === 0 ? (
              <p className="text-xs text-slate-500">
                هنوز تراکنشی برای این قطعه ثبت نشده است.
              </p>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 text-xs">
                {compTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            tx.type === 'in'
                              ? 'text-emerald-400'
                              : tx.type === 'out'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {tx.type === 'in'
                            ? `+${formatNumber(tx.quantity)} (ورود)`
                            : tx.type === 'out'
                            ? `-${formatNumber(tx.quantity)} (خروج)`
                            : `اصلاح به ${formatNumber(tx.balanceAfter)}`}
                        </span>
                        <span className="text-slate-400">{tx.reason}</span>
                      </div>
                      {tx.projectName && (
                        <div className="text-[11px] text-cyan-400 mt-0.5">
                          پروژه: {tx.projectName}
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {formatIsoDate(tx.date)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
