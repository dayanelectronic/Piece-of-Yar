import React, { useState } from 'react';
import {
  History,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCcw,
  Search,
  Filter,
} from 'lucide-react';
import { StockTransaction, TransactionType } from '../types';
import { formatNumber, formatIsoDate } from '../utils/formatters';

interface TransactionHistoryViewProps {
  transactions: StockTransaction[];
  onSelectComponentMpn?: (mpn: string) => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  onSelectComponentMpn,
}) => {
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchMpn = tx.componentMpn.toLowerCase().includes(term);
      const matchName = tx.componentName?.toLowerCase().includes(term);
      const matchReason = tx.reason?.toLowerCase().includes(term);
      const matchProject = tx.projectName?.toLowerCase().includes(term);
      if (!matchMpn && !matchName && !matchReason && !matchProject) return false;
    }
    return true;
  });

  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <History className="w-4 h-4" />
              <span>کاردکس انبار و ثبت رویدادهای فیزیکی</span>
            </div>
            <h1 className="text-xl font-bold text-white">
              تاریخچه ورود، خروج و انبارگردانی قطعات
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ردگیری دقیق هر قطعه، تاریخ مصرف، شماره فاکتور و پروژه متناظر.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <div className="text-[11px] text-emerald-400">کل ورودی به انبار</div>
              <div className="font-mono text-sm font-bold text-slate-100">
                +{formatNumber(totalIn)} عدد
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-center">
              <div className="text-[11px] text-rose-400">کل خروجی و مصرف</div>
              <div className="font-mono text-sm font-bold text-slate-100">
                -{formatNumber(totalOut)} عدد
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجو در شرح، پارت‌نامبر یا پروژه..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 pr-9 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Type filters (allowed functional button segment) */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ({formatNumber(transactions.length)})
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'in'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ورود کالا
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'out'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              خروج و مصرف
            </button>
            <button
              onClick={() => setFilterType('adjust')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterType === 'adjust'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              انبارگردانی
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">نوع عملیات</th>
                <th className="py-3 px-4">کد قطعه (MPN)</th>
                <th className="py-3 px-4">نام قطعه</th>
                <th className="py-3 px-4 text-center">تعداد تراکنش</th>
                <th className="py-3 px-4 text-center">موجودی پس از تراکنش</th>
                <th className="py-3 px-4">علت و توضیحات</th>
                <th className="py-3 px-4">پروژه مرتبط</th>
                <th className="py-3 px-4 text-left">تاریخ و ساعت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    موردی یافت نشد.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Operation Type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.type === 'in' ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>ورود (خرید)</span>
                        </span>
                      ) : tx.type === 'out' ? (
                        <span className="text-rose-400 font-medium flex items-center gap-1.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>خروج (مصرف)</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium flex items-center gap-1.5">
                          <RefreshCcw className="w-3.5 h-3.5" />
                          <span>انبارگردانی</span>
                        </span>
                      )}
                    </td>

                    {/* MPN */}
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {tx.componentMpn}
                    </td>

                    {/* Component Name */}
                    <td className="py-3 px-4 text-slate-200">
                      {tx.componentName || '-'}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-center font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'in'
                            ? 'text-emerald-400'
                            : tx.type === 'out'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }
                      >
                        {tx.type === 'in'
                          ? `+${formatNumber(tx.quantity)}`
                          : tx.type === 'out'
                          ? `-${formatNumber(tx.quantity)}`
                          : formatNumber(tx.quantity)}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-300 whitespace-nowrap">
                      {formatNumber(tx.balanceAfter)}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-slate-300 max-w-xs">
                      {tx.reason}
                    </td>

                    {/* Project */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {tx.projectName ? (
                        <span className="text-cyan-400 font-medium">{tx.projectName}</span>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-left font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {formatIsoDate(tx.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
