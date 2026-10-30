import React from 'react';
import { Tag, X, Check, Filter } from 'lucide-react';
import { Component, ComponentCategory } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatNumber } from '../utils/formatters';

interface TagFilterSectionProps {
  inventory: Component[];
  selectedCategory: 'all' | ComponentCategory;
  onSelectCategory: (category: 'all' | ComponentCategory) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export const TagFilterSection: React.FC<TagFilterSectionProps> = ({
  inventory,
  selectedCategory,
  onSelectCategory,
  selectedTags,
  onToggleTag,
  onClearTags,
}) => {
  // Aggregate all unique tags with count
  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    inventory.forEach((comp) => {
      (comp.tags || []).forEach((t) => {
        const cleanTag = t.trim();
        if (cleanTag) {
          counts[cleanTag] = (counts[cleanTag] || 0) + 1;
        }
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [inventory]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Categories Row */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>دسته‌بندی‌های استاندارد قطعات</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {CATEGORIES.length} دسته‌بندی پیش‌فرض
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>همه دسته‌ها</span>
            <span className="text-[10px] opacity-75 font-mono">
              ({formatNumber(inventory.length)})
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = inventory.filter((c) => c.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70 font-mono">
                  ({formatNumber(count)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags Row / Cloud */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-bold text-slate-300">
              برچسب‌ها و تگ‌های سفارشی (Custom Tags)
            </span>
            {selectedTags.length > 0 && (
              <span className="text-[11px] font-mono text-purple-400 bg-purple-950/70 border border-purple-800 px-2 py-0.5 rounded">
                {formatNumber(selectedTags.length)} تگ فعال
              </span>
            )}
          </div>

          {selectedTags.length > 0 && (
            <button
              onClick={onClearTags}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>حذف فیلتر تگ‌ها</span>
            </button>
          )}
        </div>

        {tagCounts.length === 0 ? (
          <p className="text-xs text-slate-500">
            هنوز تگی ثبت نشده است. هنگام افزودن قطعه می‌توانید تگ‌های دلخواه بنویسید.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto pr-1">
            {tagCounts.map(([tag, count]) => {
              const isActive = selectedTags.includes(tag);

              return (
                <button
                  key={tag}
                  onClick={() => onToggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-purple-600 text-white font-medium shadow-xs scale-102'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>#{tag}</span>
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {formatNumber(count)}
                  </span>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
