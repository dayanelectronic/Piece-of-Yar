import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Package,
  Layers,
  MapPin,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Component, SmartSearchResult } from '../types';
import { formatNumber } from '../utils/formatters';

interface SmartSearchSectionProps {
  inventory: Component[];
  onSelectComponent: (component: Component) => void;
  onQuickAdjustStock: (component: Component) => void;
}

const PRESET_QUERIES = [
  'رگولاتور ولتاژ ۳.۳ ولت LDO با پکیج SMD برای تغذیه میکروکنترلر',
  'ترانزیستور سوئیچینگ NPN برای درایو رله با تحمل جریان حداقل ۵۰۰ میلی‌آمپر',
  'سنسور اندازه‌گیری دما و فشار اتمسفر با ارتباط دیجیتال I2C',
  'خازن الکترولیت برای فیلتر و صافی تغذیه مدار ۲۴ ولت',
  'دیود هرزگرد محافظ یا یکسوساز پرسرعت برای رله و سوئیچینگ',
  'میکروکنترلر ۳۲ بیتی برای پردازش بی‌سیم اینترنت اشیا (IoT)',
];

export const SmartSearchSection: React.FC<SmartSearchSectionProps> = ({
  inventory,
  onSelectComponent,
  onQuickAdjustStock,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SmartSearchResult | null>(null);

  const handleSearch = async (targetQuery?: string) => {
    const q = (targetQuery ?? query).trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          inventory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'خطا در ارتباط با سرور هوش مصنوعی');
      }

      const data: SmartSearchResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Smart search error:', err);
      setError(err?.message || 'خطا در اجرای جستجوی هوشمند');
    } finally {
      setIsLoading(false);
    }
  };

  // Find matched components from current inventory
  const matchedComponents = (result?.matchedComponentIds || [])
    .map((id) => inventory.find((c) => c.id === id))
    .filter((c): c is Component => Boolean(c));

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>موتور جستجوی مهندسی با هوش مصنوعی (Gemini 3.8 Flash)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
            جستجوی مفهومی و هوشمند قطعات الکترونیک
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            نیاز مدار خود را به زبان عامیانه یا با مشخصات فنی بنویسید (مثلاً «ماسفت برای موتور ۱۲ ولت»
            یا «رگولاتور ۳.۳ ولت smd»). سیستم قطعات منطبق در انبار، معادل‌های بازار و نکات طراحی را
            ارائه می‌دهد.
          </p>

          {/* Search Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-5 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="توصیف مدار یا قطعه مورد نظر را اینجا بنویسید..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  پاک کردن
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال تحلیل مدار...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>تحلیل و جستجو</span>
                </>
              )}
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 shrink-0">پرسش‌های نمونه:</span>
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(preset);
                  handleSearch(preset);
                }}
                className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-md px-2.5 py-1 text-slate-300 hover:text-white transition-colors text-right"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">خطا در جستجوی هوشمند</p>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* 1. Engineering Query Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>تحلیل فنی درخواست</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {result.queryAnalysis}
            </p>

            {/* Extracted Specs (Clean metadata layout) */}
            {result.technicalSpecsExtracted &&
              Object.keys(result.technicalSpecsExtracted).length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 font-medium">
                    پارامترهای فنی استخراج شده:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(result.technicalSpecsExtracted).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-slate-950/70 border border-slate-800/80 rounded-md p-2"
                      >
                        <div className="text-slate-400 text-[11px]">{key}</div>
                        <div className="font-mono font-medium text-slate-200 truncate mt-0.5">
                          {String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* 2. Matched Components in Current Inventory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>قطعات منطبق موجود در انبار شما ({formatNumber(matchedComponents.length)})</span>
              </div>
              <span className="text-xs text-slate-400">
                بر اساس موجودی فعلی انبار
              </span>
            </div>

            {matchedComponents.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-xl space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
                <p className="text-sm text-slate-200 font-medium">
                  قطعه‌ای با تطابق مستقیم در انبار فعلی شما یافت نشد.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  می‌توانید از پیشنهادات معادل هوش مصنوعی در زیر استفاده نموده یا قطعه را ثبت کنید.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchedComponents.map((comp) => {
                  const explanation = result.matchExplanations?.[comp.id];
                  const isLow = comp.quantity <= comp.minStock;

                  return (
                    <div
                      key={comp.id}
                      className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header: MPN & Package */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-mono text-sm font-bold text-cyan-400 tracking-wide">
                              {comp.mpn}
                            </span>
                            <div className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                              {comp.name}
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shrink-0">
                            {comp.package}
                          </span>
                        </div>

                        {/* Match Reason */}
                        {explanation && (
                          <div className="text-xs text-emerald-400/90 bg-emerald-950/30 border border-emerald-900/50 rounded-md p-2 mb-3 leading-relaxed">
                            {explanation}
                          </div>
                        )}

                        {/* Location & Quantity info */}
                        <div className="space-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">
                              {comp.location.box} · {comp.location.drawer} · {comp.location.bin}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span>موجودی فعلی:</span>
                            <span
                              className={`font-mono font-bold ${
                                isLow ? 'text-amber-400' : 'text-slate-200'
                              }`}
                            >
                              {formatNumber(comp.quantity)} {comp.unit}
                              {isLow && ' (کسری انبار)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => onSelectComponent(comp)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          <span>مشاهده پین‌اوت و مشخصات</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onQuickAdjustStock(comp)}
                          className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                        >
                          تغییر موجودی
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Industry Equivalent & Substitute Suggestions */}
          {result.equivalentSuggestions && result.equivalentSuggestions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>قطعات معادل و جایگزین‌های پیشنهادی استاندارد بازار</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.equivalentSuggestions.map((eq, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-1.5"
                  >
                    <div className="font-mono text-xs font-bold text-purple-400">
                      {eq.mpn}
                    </div>
                    <div className="text-xs text-slate-300 leading-snug">
                      {eq.description}
                    </div>
                    {eq.advantage && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                        مزیت: {eq.advantage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Circuit Design & Engineering Recommendations */}
          {result.recommendationsText && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <span>نکات طراحی مدار و ملاحظات تجربی مهندسی</span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                {result.recommendationsText}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
