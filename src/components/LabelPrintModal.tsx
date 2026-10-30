import React from 'react';
import { X, Printer, MapPin, Tag } from 'lucide-react';
import { Component } from '../types';
import { formatNumber } from '../utils/formatters';
import { generateQrMatrix } from '../utils/qrHelper';

interface LabelPrintModalProps {
  component: Component | null;
  onClose: () => void;
}

export const LabelPrintModal: React.FC<LabelPrintModalProps> = ({
  component,
  onClose,
}) => {
  if (!component) return null;

  const qrText = `ELECTROSTOCK|${component.mpn}|${component.location.box}|${component.location.drawer}|${component.location.bin}`;
  const matrix = generateQrMatrix(qrText, 21);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl text-slate-100 overflow-hidden no-print">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">
              برچسب بارکد و QR کشوی قطعات
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              مناسب پرینت برای چسباندن روی جعبه یا قفسه انبار
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label Preview (What actually gets printed) */}
        <div className="p-6 space-y-4">
          <div
            id="printable-label"
            className="bg-white text-slate-900 p-4 rounded-xl border-2 border-dashed border-slate-300 shadow-md font-sans"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Left/Right Text Info */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  قطعه‌یار · انبار قطعات الکترونیک
                </div>
                <div className="font-mono text-lg font-black text-black tracking-tight truncate">
                  {component.mpn}
                </div>
                <div className="text-xs font-bold text-slate-800 truncate">
                  {component.name}
                </div>
                <div className="text-[11px] font-mono text-slate-600">
                  {component.package} · {component.mountingType === 'smd' ? 'SMD' : 'DIP/TH'}
                </div>

                {/* Storage Location Badge */}
                <div className="pt-2 border-t border-slate-200 mt-2 text-xs font-bold text-black flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                  <span className="truncate">
                    {component.location.box} · {component.location.drawer}
                    {component.location.bin ? ` · ${component.location.bin}` : ''}
                  </span>
                </div>
              </div>

              {/* QR Code SVG */}
              <div className="shrink-0 bg-white p-1 border border-slate-200 rounded">
                <svg
                  width="84"
                  height="84"
                  viewBox="0 0 21 21"
                  className="shape-rendering-crispEdges"
                >
                  {matrix.map((row, r) =>
                    row.map((filled, c) =>
                      filled ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width="1"
                          height="1"
                          fill="#000000"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            برچسب با ابعاد استاندارد برای لیبل پرینترهای حرارتی و کاغذ A4 آماده‌سازی شده است.
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            بستن
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ برچسب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
