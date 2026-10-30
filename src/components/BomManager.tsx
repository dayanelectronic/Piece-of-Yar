import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Trash2,
  Edit2,
  X,
  Package,
} from 'lucide-react';
import { Component, ProjectBOM, BOMItem } from '../types';
import { formatNumber, formatCurrency, formatIsoDate } from '../utils/formatters';

interface BomManagerProps {
  projects: ProjectBOM[];
  inventory: Component[];
  onSaveProject: (project: ProjectBOM) => void;
  onDeleteProject: (projectId: string) => void;
  onDeductProjectBom: (project: ProjectBOM) => void;
  onSelectComponent: (component: Component) => void;
}

export const BomManager: React.FC<BomManagerProps> = ({
  projects,
  inventory,
  onSaveProject,
  onDeleteProject,
  onDeductProjectBom,
  onSelectComponent,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectBOM | null>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Helper to calculate BOM stats
  const calculateBomStats = (project: ProjectBOM) => {
    let totalCostPerUnit = 0;
    let shortageCount = 0;

    const itemsAnalysis = project.items.map((item) => {
      const comp = inventory.find((c) => c.id === item.componentId);
      const needed = item.quantityPerUnit * project.batchSize;
      const available = comp ? comp.quantity : 0;
      const isShortage = available < needed;
      const missing = isShortage ? needed - available : 0;
      const unitCost = comp ? comp.unitPrice || 0 : 0;
      const totalItemCost = unitCost * item.quantityPerUnit;

      totalCostPerUnit += totalItemCost;
      if (isShortage) shortageCount++;

      return {
        ...item,
        component: comp,
        needed,
        available,
        isShortage,
        missing,
        totalItemCost,
      };
    });

    const totalBatchCost = totalCostPerUnit * project.batchSize;

    return {
      itemsAnalysis,
      totalCostPerUnit,
      totalBatchCost,
      shortageCount,
      isFullyFeasible: shortageCount === 0,
    };
  };

  const handleStartNewProject = () => {
    const newProj: ProjectBOM = {
      id: `proj-${Date.now()}`,
      name: 'پروژه جدید الکترونیک',
      description: '',
      batchSize: 1,
      items: [],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };
    setEditingProject(newProj);
    setIsEditing(true);
  };

  const handleStartEditProject = (proj: ProjectBOM) => {
    setEditingProject(JSON.parse(JSON.stringify(proj)));
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar for Projects */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>مدیریت لیست قطعات پروژه (BOM: Bill of Materials)</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            برنامه‌ریزی تولید و امکان‌سنجی موجودی قطعات
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            لیست قطعات برد را تعریف کرده، تیراژ را مشخص کنید و کسری انبار را قبل از مونتاژ بررسی نمایید.
          </p>
        </div>

        <button
          onClick={handleStartNewProject}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف پروژه جدید BOM</span>
        </button>
      </div>

      {/* Projects Tabs / Selector */}
      {projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedProjectId === proj.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <span>{proj.name}</span>
              <span className="font-mono text-[11px] text-slate-500">
                ({formatNumber(proj.items.length)} قطعه)
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Active Project Details */}
      {activeProject ? (
        (() => {
          const stats = calculateBomStats(activeProject);

          return (
            <div className="space-y-6">
              {/* Project Overview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white">
                        {activeProject.name}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                        تیراژ تولید: {formatNumber(activeProject.batchSize)} برد
                      </span>
                    </div>
                    {activeProject.description && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {activeProject.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStartEditProject(activeProject)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ویرایش پروژه</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`آیا از حذف پروژه «${activeProject.name}» اطمینان دارید؟`)) {
                          onDeleteProject(activeProject.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="حذف پروژه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 mb-1">وضعیت انبار</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {stats.isFullyFeasible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">تمام قطعات موجود است</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span className="text-rose-400">
                            {formatNumber(stats.shortageCount)} قلم کسری انبار
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 mb-1">هزینه قطعات هر برد</div>
                    <div className="font-mono text-sm font-bold text-slate-200">
                      {formatCurrency(stats.totalCostPerUnit)}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 mb-1">
                      کل هزینه قطعات ({formatNumber(activeProject.batchSize)} برد)
                    </div>
                    <div className="font-mono text-sm font-bold text-cyan-400">
                      {formatCurrency(stats.totalBatchCost)}
                    </div>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
                    <div className="text-[11px] text-slate-400 mb-1">تنوع قطعات BOM</div>
                    <div className="font-mono text-sm font-bold text-slate-200">
                      {formatNumber(activeProject.items.length)} ردیف
                    </div>
                  </div>
                </div>

                {/* Deduct Stock Action Button */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    با کسر موجودی، تعداد مورد نیاز قطعات به صورت خودکار از انبار کسر و در کاردکس ثبت می‌شود.
                  </div>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `آیا مایل به کسر قطعات برای تولید ${activeProject.batchSize} عدد از پروژه «${activeProject.name}» از انبار هستید؟`
                        )
                      ) {
                        onDeductProjectBom(activeProject);
                      }
                    }}
                    disabled={!stats.isFullyFeasible}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>کسر خودکار قطعات پروژه از انبار</span>
                  </button>
                </div>
              </div>

              {/* BOM Items Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    اقلام و مشخصات قطعات پروژه
                  </h3>
                  <span className="text-xs text-slate-400">
                    تیراژ محاسبه: {formatNumber(activeProject.batchSize)} عدد
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-medium">
                        <th className="py-3 px-4">کد فنی (MPN)</th>
                        <th className="py-3 px-4">نام قطعه</th>
                        <th className="py-3 px-4 text-center">تعداد در هر برد</th>
                        <th className="py-3 px-4 text-center">کل مورد نیاز</th>
                        <th className="py-3 px-4 text-center">موجودی انبار</th>
                        <th className="py-3 px-4 text-center">وضعیت تأمین</th>
                        <th className="py-3 px-4 text-left">هزینه واحد</th>
                        <th className="py-3 px-4">محل در انبار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {stats.itemsAnalysis.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                            {item.component ? (
                              <button
                                onClick={() => onSelectComponent(item.component!)}
                                className="hover:underline"
                              >
                                {item.component.mpn}
                              </button>
                            ) : (
                              <span className="text-rose-400">قطعه حذف شده</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-200">
                            {item.component?.name || '-'}
                            {item.notes && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {item.notes}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-semibold text-slate-300">
                            {formatNumber(item.quantityPerUnit)}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-100">
                            {formatNumber(item.needed)}
                          </td>

                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span
                              className={
                                item.isShortage ? 'text-rose-400' : 'text-slate-200'
                              }
                            >
                              {formatNumber(item.available)}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {item.isShortage ? (
                              <span className="text-rose-400 font-medium flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>کسری {formatNumber(item.missing)} عدد</span>
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-medium flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>موجود</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-left font-mono tabular-nums text-slate-300 whitespace-nowrap">
                            {formatCurrency(item.component?.unitPrice || 0)}
                          </td>

                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                            {item.component ? (
                              <span>
                                {item.component.location.box} · {item.component.location.drawer}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          <p className="text-sm font-medium text-slate-200 mb-2">
            هنوز پروژه‌ای ثبت نشده است.
          </p>
          <button
            onClick={handleStartNewProject}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            تعریف اولین پروژه
          </button>
        </div>
      )}

      {/* Project Edit / Create Modal */}
      {isEditing && editingProject && (
        <ProjectEditModal
          project={editingProject}
          inventory={inventory}
          onClose={() => {
            setIsEditing(false);
            setEditingProject(null);
          }}
          onSave={(saved) => {
            onSaveProject(saved);
            setSelectedProjectId(saved.id);
            setIsEditing(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

interface ProjectEditModalProps {
  project: ProjectBOM;
  inventory: Component[];
  onClose: () => void;
  onSave: (project: ProjectBOM) => void;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  inventory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [batchSize, setBatchSize] = useState(project.batchSize.toString());
  const [items, setItems] = useState<BOMItem[]>(project.items);
  const [selectedCompId, setSelectedCompId] = useState<string>(
    inventory[0]?.id || ''
  );
  const [qtyPerUnit, setQtyPerUnit] = useState('1');
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    if (!selectedCompId) return;
    const exists = items.find((i) => i.componentId === selectedCompId);
    if (exists) {
      alert('این قطعه قبلاً به لیست BOM افزوده شده است.');
      return;
    }

    setItems([
      ...items,
      {
        componentId: selectedCompId,
        quantityPerUnit: Math.max(1, parseInt(qtyPerUnit, 10) || 1),
        notes: notes.trim() || undefined,
      },
    ]);
    setNotes('');
    setQtyPerUnit('1');
  };

  const handleRemoveItem = (compId: string) => {
    setItems(items.filter((i) => i.componentId !== compId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('لطفاً عنوان پروژه را وارد کنید.');
      return;
    }

    onSave({
      ...project,
      name: name.trim(),
      description: description.trim(),
      batchSize: Math.max(1, parseInt(batchSize, 10) || 1),
      items,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">ویرایش پروژه و لیست BOM</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                نام پروژه *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                تیراژ تولید (تعداد برد)
              </label>
              <input
                type="number"
                min="1"
                required
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              توضیحات پروژه
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200"
            />
          </div>

          {/* Add Item Row */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300">
              افزودن قطعه به لیست BOM
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6">
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100"
                >
                  {inventory.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.mpn} — {c.name} ({c.package})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  value={qtyPerUnit}
                  onChange={(e) => setQtyPerUnit(e.target.value)}
                  placeholder="تعداد"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-center font-mono text-cyan-400"
                />
              </div>

              <div className="sm:col-span-3">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="یادداشت موقعیت مثلاً R1, R2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full h-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center justify-center transition-colors"
                  title="افزودن"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Current Items List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300">
              قطعات انتخاب شده ({formatNumber(items.length)})
            </h3>
            {items.length === 0 ? (
              <p className="text-xs text-slate-500">هنوز قطعه‌ای افزوده نشده است.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {items.map((it) => {
                  const comp = inventory.find((c) => c.id === it.componentId);
                  return (
                    <div
                      key={it.componentId}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">
                          {comp?.mpn || 'نامشخص'}
                        </span>
                        <span className="text-slate-300">{comp?.name}</span>
                        {it.notes && (
                          <span className="text-slate-500 text-[11px]">({it.notes})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-200">
                          {formatNumber(it.quantityPerUnit)} عدد در برد
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.componentId)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
            >
              ذخیره پروژه BOM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
