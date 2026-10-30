import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Cpu, Tag, Sparkles } from 'lucide-react';
import { Component, ComponentCategory, ComponentPin } from '../types';
import { CATEGORIES, POPULAR_PACKAGES, POPULAR_TAGS } from '../data/categories';

interface ComponentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: Component) => void;
  initialData?: Component | null;
}

export const ComponentFormModal: React.FC<ComponentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  if (!isOpen) return null;

  const [mpn, setMpn] = useState(initialData?.mpn || '');
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ComponentCategory>(
    initialData?.category || 'resistor'
  );
  const [packageType, setPackageType] = useState(initialData?.package || 'SMD 0805');
  const [mountingType, setMountingType] = useState<'smd' | 'through_hole'>(
    initialData?.mountingType || 'smd'
  );
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '10');
  const [minStock, setMinStock] = useState(initialData?.minStock?.toString() || '5');
  const [unit, setUnit] = useState(initialData?.unit || 'عدد');
  const [unitPrice, setUnitPrice] = useState(
    initialData?.unitPrice?.toString() || '5000'
  );
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '');
  const [box, setBox] = useState(initialData?.location?.box || 'جعبه ۱');
  const [drawer, setDrawer] = useState(initialData?.location?.drawer || 'کشو ۱');
  const [bin, setBin] = useState(initialData?.location?.bin || 'خانه ۱');
  const [datasheetUrl, setDatasheetUrl] = useState(initialData?.datasheetUrl || '');

  // Tag list state
  const [tags, setTags] = useState<string[]>(initialData?.tags || ['SMD']);
  const [tagInput, setTagInput] = useState('');

  const [equivalentsInput, setEquivalentsInput] = useState(
    initialData?.equivalents?.join(', ') || ''
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Specs as dynamic list of [key, value]
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>(() => {
    if (initialData?.specs && Object.keys(initialData.specs).length > 0) {
      return Object.entries(initialData.specs).map(([key, value]) => ({ key, value }));
    }
    const catMeta = CATEGORIES.find((c) => c.id === (initialData?.category || 'resistor'));
    return (catMeta?.defaultSpecs || ['مشخصه اصلی']).map((k) => ({ key: k, value: '' }));
  });

  // Pins for pinout diagram
  const [pinsList, setPinsList] = useState<ComponentPin[]>(
    initialData?.pinout?.pins || []
  );

  // When category changes on a new item, suggest appropriate default specs
  const handleCategoryChange = (newCat: ComponentCategory) => {
    setCategory(newCat);
    if (!initialData) {
      const meta = CATEGORIES.find((c) => c.id === newCat);
      if (meta && meta.defaultSpecs) {
        setSpecsList(meta.defaultSpecs.map((k) => ({ key: k, value: '' })));
      }
    }
  };

  const handleAddSpec = () => {
    setSpecsList([...specsList, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecsList(specsList.filter((_, i) => i !== idx));
  };

  const handleAddPin = () => {
    const nextNum = pinsList.length + 1;
    setPinsList([...pinsList, { num: nextNum, name: `PIN_${nextNum}`, desc: '' }]);
  };

  const handleRemovePin = (idx: number) => {
    setPinsList(pinsList.filter((_, i) => i !== idx));
  };

  // Tag handlers
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpn.trim() || !name.trim()) {
      alert('لطفاً پارت‌نامبر (MPN) و نام قطعه را وارد کنید.');
      return;
    }

    const specsObj: Record<string, string> = {};
    specsList.forEach((s) => {
      if (s.key.trim()) {
        specsObj[s.key.trim()] = s.value.trim();
      }
    });

    const equivalents = equivalentsInput
      .split(/[,،]/)
      .map((e) => e.trim())
      .filter(Boolean);

    const savedComponent: Component = {
      id: initialData?.id || `comp-${Date.now()}`,
      mpn: mpn.trim(),
      name: name.trim(),
      category,
      package: packageType.trim(),
      mountingType,
      quantity: Math.max(0, parseInt(quantity, 10) || 0),
      minStock: Math.max(0, parseInt(minStock, 10) || 0),
      unit: unit.trim() || 'عدد',
      location: {
        box: box.trim(),
        drawer: drawer.trim(),
        bin: bin.trim(),
      },
      specs: specsObj,
      pinout:
        pinsList.length > 0
          ? {
              pinCount: pinsList.length,
              pins: pinsList,
            }
          : undefined,
      manufacturer: manufacturer.trim(),
      unitPrice: Math.max(0, parseInt(unitPrice, 10) || 0),
      datasheetUrl: datasheetUrl.trim() || undefined,
      tags,
      equivalents,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(savedComponent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-base font-bold text-white">
              {initialData ? 'ویرایش مشخصات قطعه' : 'ثبت قطعه جدید در انبار'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              مشخصات فنی، دسته‌بندی و تگ‌های سفارشی قطعه را تعیین کنید.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: MPN & Descriptive Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                کد فنی / پارت‌نامبر (MPN) *
              </label>
              <input
                type="text"
                required
                value={mpn}
                onChange={(e) => setMpn(e.target.value)}
                placeholder="مثلاً: LM358DR یا ESP32-WROOM-32"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                نام و شرح قطعه به فارسی *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: رگولاتور ولتاژ ۳.۳ ولت ۱ آمپر"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 2: Predefined Category & Package */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                دسته‌بندی استاندارد *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as ComponentCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                پکیج / فوت‌پرینت (Package)
              </label>
              <input
                type="text"
                list="packages-list"
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                placeholder="مثلاً: DIP-8, SOIC-8, SMD 0805"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-hidden"
              />
              <datalist id="packages-list">
                {POPULAR_PACKAGES.map((pkg) => (
                  <option key={pkg} value={pkg} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                نوع مونتاژ
              </label>
              <select
                value={mountingType}
                onChange={(e) => setMountingType(e.target.value as 'smd' | 'through_hole')}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              >
                <option value="smd">SMD (نصب سطحی)</option>
                <option value="through_hole">Through-Hole (پایه‌دار روبردی)</option>
              </select>
            </div>
          </div>

          {/* Dedicated Custom Tags Management Section */}
          <div className="bg-slate-950/70 border border-purple-900/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>برچسب‌ها و تگ‌های سفارشی (Custom Tags)</span>
              </label>
              <span className="text-[11px] text-slate-500">
                با زدن Enter یا کاما تگ اضافه کنید
              </span>
            </div>

            {/* Current Tags Badges List */}
            <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-slate-900/90 rounded-lg border border-slate-800">
              {tags.length === 0 ? (
                <span className="text-xs text-slate-500">هنوز تگی اضافه نشده است.</span>
              ) : (
                tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-purple-950 text-purple-200 border border-purple-800/80 px-2 py-0.5 rounded text-xs"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-purple-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Tag Input Field & Add Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="تگ دلخواه بنویسید (مثلاً: High-Power، Audio، 12V) و Enter بزنید..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                + افزودن تگ
              </button>
            </div>

            {/* Suggested Popular Tags Quick-Click */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-1.5">
                تگ‌های پیشنهادی مهندسی (برای افزودن کلیک کنید):
              </span>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.slice(0, 14).map((ptag) => {
                  const isAdded = tags.includes(ptag);
                  return (
                    <button
                      key={ptag}
                      type="button"
                      onClick={() => (isAdded ? handleRemoveTag(ptag) : handleAddTag(ptag))}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                        isAdded
                          ? 'bg-purple-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {isAdded ? `✓ ${ptag}` : `+ ${ptag}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Quantities and Price */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                موجودی فعلی انبار
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                حداقل هشدار کسری
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                واحد شمارش
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="عدد، رول، پک"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                قیمت واحد (تومان)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Row 4: Physical Location */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300">
              محل فیزیکی نگهداری در کارگاه / انبار
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  نام جعبه یا قفسه
                </label>
                <input
                  type="text"
                  value={box}
                  onChange={(e) => setBox(e.target.value)}
                  placeholder="مثلاً: قفسه A یا جعبه قطعات DIP"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  شماره کشو یا طبقه
                </label>
                <input
                  type="text"
                  value={drawer}
                  onChange={(e) => setDrawer(e.target.value)}
                  placeholder="مثلاً: کشو ۲ یا طبقه ۳"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  شماره خانه / بن (Bin)
                </label>
                <input
                  type="text"
                  value={bin}
                  onChange={(e) => setBin(e.target.value)}
                  placeholder="مثلاً: خانه ۴ یا ردیف B"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Dynamic Technical Specs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300">
                مشخصات فنی و الکتریکی
              </h3>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن مشخصه</span>
              </button>
            </div>

            <div className="space-y-2">
              {specsList.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => {
                      const updated = [...specsList];
                      updated[idx].key = e.target.value;
                      setSpecsList(updated);
                    }}
                    placeholder="عنوان (مثلاً ولتاژ کاری)"
                    className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specsList];
                      updated[idx].value = e.target.value;
                      setSpecsList(updated);
                    }}
                    placeholder="مقدار (مثلاً 3.3V تا 5V)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 dir-ltr font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Row 6: Pinout Configuration (Optional) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-300">
                  تعریف پایه‌ها و پین‌اوت (اختیاری)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddPin}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن پایه</span>
              </button>
            </div>

            {pinsList.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pinsList.map((pin, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      value={pin.num}
                      onChange={(e) => {
                        const copy = [...pinsList];
                        copy[idx].num = parseInt(e.target.value, 10) || 1;
                        setPinsList(copy);
                      }}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-cyan-400 text-center"
                    />
                    <input
                      type="text"
                      value={pin.name}
                      onChange={(e) => {
                        const copy = [...pinsList];
                        copy[idx].name = e.target.value;
                        setPinsList(copy);
                      }}
                      placeholder="نام پایه (مثلاً GND)"
                      className="w-1/4 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200"
                    />
                    <input
                      type="text"
                      value={pin.desc}
                      onChange={(e) => {
                        const copy = [...pinsList];
                        copy[idx].desc = e.target.value;
                        setPinsList(copy);
                      }}
                      placeholder="توضیحات عملکرد پایه"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePin(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 7: Equivalents, Datasheet and Manufacturer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                سازنده / برند (Manufacturer)
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="مثلاً: Texas Instruments, ST, Yageo"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                آدرس وب دیتاشیت (Datasheet URL)
              </label>
              <input
                type="url"
                value={datasheetUrl}
                onChange={(e) => setDatasheetUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 dir-ltr focus:border-cyan-500 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                قطعات معادل (با کاما جدا کنید)
              </label>
              <input
                type="text"
                value={equivalentsInput}
                onChange={(e) => setEquivalentsInput(e.target.value)}
                placeholder="مثلاً: 2N3904, BC547, PN2222"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              یادداشت‌های کاربردی و مهندسی
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="نکات مونتاژ، خنک‌کاری یا کاربرد در بردهای پروژه..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              {initialData ? 'ذخیره تغییرات' : 'ثبت قطعه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
