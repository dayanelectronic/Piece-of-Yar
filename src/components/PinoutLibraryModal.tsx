import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  HelpCircle,
  Hash,
  Sliders,
  Check,
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

const POPULAR_CHIPS_PINOUTS = [
  {
    mpn: 'NE555P',
    name: 'تایمر ۵۵۵ (DIP-8)',
    package: 'DIP-8',
    pins: [
      { num: 1, name: 'GND', desc: 'زمین (0 ولت)' },
      { num: 2, name: 'TRIG', desc: 'پایه تحریک ولتاژ کم‌تر از 1/3 Vcc' },
      { num: 3, name: 'OUT', desc: 'خروجی پالس تایمر' },
      { num: 4, name: 'RESET', desc: 'ریست دستی (فعال با سطح صفر)' },
      { num: 5, name: 'CTRL', desc: 'کنترل ولتاژ مقایسه‌گر داخلی' },
      { num: 6, name: 'THRES', desc: 'پایه آستانه قطع بالا‌تر از 2/3 Vcc' },
      { num: 7, name: 'DISCH', desc: 'پایه تخلیه خازن زمان‌سنجی' },
      { num: 8, name: 'VCC', desc: 'تغذیه مثبت (4.5 تا 16 ولت)' },
    ],
  },
  {
    mpn: 'LM358',
    name: 'تقویت‌کننده عملیاتی دوگانه (SOIC-8 / DIP-8)',
    package: 'DIP-8',
    pins: [
      { num: 1, name: '1OUT', desc: 'خروجی تقویت‌کننده اول' },
      { num: 2, name: '1IN-', desc: 'ورودی معکوس‌کننده اول' },
      { num: 3, name: '1IN+', desc: 'ورودی غیرمعکوس‌کننده اول' },
      { num: 4, name: 'GND / V-', desc: 'تغذیه منفی یا زمین' },
      { num: 5, name: '2IN+', desc: 'ورودی غیرمعکوس‌کننده دوم' },
      { num: 6, name: '2IN-', desc: 'ورودی معکوس‌کننده دوم' },
      { num: 7, name: '2OUT', desc: 'خروجی تقویت‌کننده دوم' },
      { num: 8, name: 'VCC / V+', desc: 'تغذیه مثبت مدار' },
    ],
  },
  {
    mpn: 'LM7805',
    name: 'رگولاتور خطی ۵ ولت (TO-220)',
    package: 'TO-220',
    pins: [
      { num: 1, name: 'INPUT', desc: 'ورودی ولتاژ مثبت (7 تا 24 ولت)' },
      { num: 2, name: 'GND', desc: 'پایه زمین و متصل به بدنه فلزی' },
      { num: 3, name: 'OUTPUT', desc: 'خروجی پایدار ۵ ولت ۱.۵ آمپر' },
    ],
  },
  {
    mpn: 'IRF540N',
    name: 'ماسفت توان کانال N (TO-220)',
    package: 'TO-220',
    pins: [
      { num: 1, name: 'Gate (G)', desc: 'پایه گیت (کنترل با ولتاژ)' },
      { num: 2, name: 'Drain (D)', desc: 'پایه درین (خروجی متصل به بار)' },
      { num: 3, name: 'Source (S)', desc: 'پایه سورس (متصل به زمین)' },
    ],
  },
  {
    mpn: '2N2222A',
    name: 'ترانزیستور NPN سوئیچینگ (TO-92)',
    package: 'TO-92',
    pins: [
      { num: 1, name: 'Emitter (E)', desc: 'امیتر (خروجی جریان الکترون)' },
      { num: 2, name: 'Base (B)', desc: 'بیس (جریان تحریک پایه)' },
      { num: 3, name: 'Collector (C)', desc: 'کلکتور (ورودی جریان اصلی)' },
    ],
  },
  {
    mpn: 'PC817',
    name: 'اپتوکوپلر ایزولاتور (DIP-4)',
    package: 'DIP-4',
    pins: [
      { num: 1, name: 'Anode (A)', desc: 'آند دیود نوری فروسرخ داخلی' },
      { num: 2, name: 'Cathode (K)', desc: 'کاتد دیود نوری فروسرخ' },
      { num: 3, name: 'Emitter (E)', desc: 'امیتر فوتوترانزیستور خروجی' },
      { num: 4, name: 'Collector (C)', desc: 'کلکتور فوتوترانزیستور خروجی' },
    ],
  },
];

// Resistor colors
const COLOR_CODES = [
  { name: 'سیاه (Black)', color: '#1e293b', val: 0, mult: 1, textDark: false },
  { name: 'قهوه‌ای (Brown)', color: '#854d0e', val: 1, mult: 10, textDark: false },
  { name: 'قرمز (Red)', color: '#dc2626', val: 2, mult: 100, textDark: false },
  { name: 'نارنجی (Orange)', color: '#ea580c', val: 3, mult: 1000, textDark: false },
  { name: 'زرد (Yellow)', color: '#ca8a04', val: 4, mult: 10000, textDark: true },
  { name: 'سبز (Green)', color: '#16a34a', val: 5, mult: 100000, textDark: false },
  { name: 'آبی (Blue)', color: '#2563eb', val: 6, mult: 1000000, textDark: false },
  { name: 'بنفش (Violet)', color: '#9333ea', val: 7, mult: 10000000, textDark: false },
  { name: 'خاکستری (Gray)', color: '#64748b', val: 8, mult: 100000000, textDark: false },
  { name: 'سفید (White)', color: '#f8fafc', val: 9, mult: 1000000000, textDark: true },
];

export const PinoutLibraryModal: React.FC = () => {
  const [selectedChipIndex, setSelectedChipIndex] = useState(0);

  // Resistor calculator state
  const [band1, setBand1] = useState(1); // Brown (1)
  const [band2, setBand2] = useState(0); // Black (0)
  const [band3, setBand3] = useState(2); // Red (*100) -> 10 * 100 = 1000 = 1k

  const calcResistance = (COLOR_CODES[band1].val * 10 + COLOR_CODES[band2].val) * COLOR_CODES[band3].mult;

  const formatOhm = (r: number) => {
    if (r >= 1000000) return `${(r / 1000000).toFixed(1)} MΩ (مگااهم)`;
    if (r >= 1000) return `${(r / 1000).toFixed(1)} kΩ (کیلو‌اهم)`;
    return `${r} Ω (اهم)`;
  };

  // SMD Code Decoder
  const [smdCode, setSmdCode] = useState('103');
  const decodeSmd = (code: string) => {
    const trimmed = code.trim();
    if (/^\d{3}$/.test(trimmed)) {
      const val = parseInt(trimmed.substring(0, 2), 10) * Math.pow(10, parseInt(trimmed[2], 10));
      return formatOhm(val);
    }
    if (/^\d{4}$/.test(trimmed)) {
      const val = parseInt(trimmed.substring(0, 3), 10) * Math.pow(10, parseInt(trimmed[3], 10));
      return formatOhm(val);
    }
    if (/^[0-9R]+$/i.test(trimmed) && trimmed.includes('R')) {
      return `${trimmed.replace(/R/i, '.')} Ω (اهم)`;
    }
    return 'کد نامعتبر (مثلاً ۱۰۳ یا ۴۷۰۲ یا ۲R۲ وارد کنید)';
  };

  const currentChip = POPULAR_CHIPS_PINOUTS[selectedChipIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
          <Cpu className="w-4 h-4" />
          <span>مرجع و راهنمای پایه‌های قطعات و کدهای الکترونیک</span>
        </div>
        <h1 className="text-xl font-bold text-white">
          راهنمای بصری پین‌اوت آی‌سی‌ها و ماشین‌حساب مقاومت
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          مرجع استاندارد پایه‌های آی‌سی‌های متداول، محاسبه رنگ مقاومت‌ها و دیکودر کدهای SMD.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Popular Chips Pinouts (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>پین‌اوت آی‌سی‌ها و نیمه‌هادی‌های پرکاربرد</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              پکیج: {currentChip.package}
            </span>
          </div>

          {/* Chips Selector */}
          <div className="flex flex-wrap gap-2">
            {POPULAR_CHIPS_PINOUTS.map((chip, idx) => (
              <button
                key={chip.mpn}
                onClick={() => setSelectedChipIndex(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                  selectedChipIndex === idx
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {chip.mpn}
              </button>
            ))}
          </div>

          {/* Active Chip Details */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div>
                <span className="font-mono text-base font-bold text-cyan-400">
                  {currentChip.mpn}
                </span>
                <div className="text-xs text-slate-300 mt-0.5">{currentChip.name}</div>
              </div>
            </div>

            {/* Pins Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentChip.pins.map((pin) => (
                <div
                  key={pin.num}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/60 flex items-start gap-2.5"
                >
                  <span className="w-6 h-6 rounded bg-slate-800 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {pin.num}
                  </span>
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-slate-200 ml-1">
                      {pin.name}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                      {pin.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Resistor Tools (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Color Code Calculator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>محاسبه مقدار مقاومت از روی کدهای رنگی</span>
            </h2>

            {/* Visual Resistor Graphic */}
            <div className="py-4 flex items-center justify-center">
              <div className="relative w-64 h-12 bg-amber-100 rounded-full flex items-center justify-around px-8 shadow-inner border-2 border-amber-300/40">
                <div
                  className="w-4 h-12 rounded-sm shadow-sm"
                  style={{ backgroundColor: COLOR_CODES[band1].color }}
                  title={COLOR_CODES[band1].name}
                />
                <div
                  className="w-4 h-12 rounded-sm shadow-sm"
                  style={{ backgroundColor: COLOR_CODES[band2].color }}
                  title={COLOR_CODES[band2].name}
                />
                <div
                  className="w-4 h-12 rounded-sm shadow-sm"
                  style={{ backgroundColor: COLOR_CODES[band3].color }}
                  title={COLOR_CODES[band3].name}
                />
                <div
                  className="w-4 h-12 rounded-sm shadow-sm bg-yellow-500"
                  title="تلرانس طلایی ۵٪"
                />
              </div>
            </div>

            {/* Result Value */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-[11px] text-slate-400">مقدار محاسبه شده:</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5 dir-ltr">
                {formatOhm(calcResistance)} ±5%
              </div>
            </div>

            {/* Band Selectors */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  نوار اول (رقم اول):
                </label>
                <select
                  value={band1}
                  onChange={(e) => setBand1(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {COLOR_CODES.slice(1).map((c, i) => (
                    <option key={c.name} value={i + 1}>
                      {c.name} ({c.val})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  نوار دوم (رقم دوم):
                </label>
                <select
                  value={band2}
                  onChange={(e) => setBand2(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {COLOR_CODES.map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} ({c.val})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  نوار سوم (ضریب ضریب‌دهی ۱۰):
                </label>
                <select
                  value={band3}
                  onChange={(e) => setBand3(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {COLOR_CODES.slice(0, 8).map((c, i) => (
                    <option key={c.name} value={i}>
                      {c.name} (x10^{c.val})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SMD Code Decoder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-400" />
              <span>دیکودر کدهای مقاومت و خازن SMD</span>
            </h2>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                کد ۳ یا ۴ رقمی روی قطعه SMD:
              </label>
              <input
                type="text"
                value={smdCode}
                onChange={(e) => setSmdCode(e.target.value)}
                placeholder="مثلاً 103 یا 4702 یا 2R2"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-purple-400 text-center tracking-widest focus:border-purple-500 focus:outline-hidden"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
              <div className="text-[11px] text-slate-400">مقدار الکتریکی معادل:</div>
              <div className="text-base font-mono font-bold text-purple-300 mt-0.5 dir-ltr">
                {decodeSmd(smdCode)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
