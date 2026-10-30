import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, RefreshCcw } from 'lucide-react';
import { Component, StockTransaction, TransactionType } from '../types';
import { formatNumber } from '../utils/formatters';

interface StockAdjustmentModalProps {
  component: Component | null;
  onClose: () => void;
  onConfirm: (
    componentId: string,
    type: TransactionType,
    quantity: number,
    reason: string,
    projectName?: string
  ) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  component,
  onClose,
  onConfirm,
}) => {
  if (!component) return null;

  const [type, setType] = useState<TransactionType>('in');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('');
  const [projectName, setProjectName] = useState('');

  const qtyNum = Math.max(1, parseInt(quantity, 10) || 0);

  let newBalance = component.quantity;
  if (type === 'in') {
    newBalance = component.quantity + qtyNum;
  } else if (type === 'out') {
    newBalance = Math.max(0, component.quantity - qtyNum);
  } else if (type === 'adjust') {
    newBalance = qtyNum;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('لطفاً علت تغییر موجودی یا شماره فاکتور/پروژه را وارد کنید.');
      return;
    }
    onConfirm(component.id, type, qtyNum, reason.trim(), projectName.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              ثبت عملیات انبار ({component.mpn})
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              موجودی فعلی: {formatNumber(component.quantity)} {component.unit}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('in');
                setReason('خرید جدید یا افزایش موجودی');
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                type === 'in'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>ورود (خرید)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('out');
                setReason('مصرف در پروژه یا آزمایش');
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                type === 'out'
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>خروج (مصرف)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('adjust');
                setReason('انبارگردانی و تطبیق فیزیکی');
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                type === 'adjust'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>انبارگردانی</span>
            </button>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {type === 'adjust' ? 'موجودی دقیق شمارش‌شده جدید' : 'تعداد قطعه'} ({component.unit})
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-base font-mono font-bold text-cyan-400 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Balance Preview */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">موجودی پس از این تراکنش:</span>
            <span className="font-mono text-sm font-bold text-slate-100">
              {formatNumber(newBalance)} {component.unit}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              شرح یا علت تغییر *
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثلاً: فاکتور خرید پایاالکترونیک یا مصرف در مونتاژ برد"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Project Reference (Optional) */}
          {type === 'out' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                نام پروژه مرتبط (اختیاری)
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثلاً: کنترلر هوشمند گلخانه"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                type === 'in'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : type === 'out'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              ثبت در کاردکس انبار
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
