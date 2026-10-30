import React from 'react';
import {
  Plus,
  Cpu,
  Moon,
  Sun,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'inventory' | 'smart-search' | 'bom' | 'history' | 'pinouts';
  onSelectTab: (tab: 'inventory' | 'smart-search' | 'bom' | 'history' | 'pinouts') => void;
  onOpenNewComponentModal: () => void;
  onOpenSmartSearch: () => void;
  onOpenAssistant: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onExportBackup: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewComponentModal,
  onOpenAssistant,
  theme,
  onToggleTheme,
  onExportBackup,
  onExportCSV,
  onResetData,
  lowStockCount,
}) => {
  const [showBackupMenu, setShowBackupMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-800 dark:border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand Wordmark (one line) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            قطعه‌یار
          </span>
        </div>

        {/* Zone 2: Navigation Links (single line, 1-2 word labels) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('inventory')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'inventory'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            فهرست قطعات
          </button>

          <button
            onClick={() => onSelectTab('smart-search')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'smart-search'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            جستجوی هوشمند
          </button>

          <button
            onClick={() => onSelectTab('bom')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'bom'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            پروژه‌ها و BOM
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'history'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            تاریخچه انبار
          </button>

          <button
            onClick={() => onSelectTab('pinouts')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'pinouts'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            راهنمای پین‌اوت
          </button>
        </nav>

        {/* Zone 3: Actions & Primary CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Assistant button */}
          <button
            onClick={onOpenAssistant}
            title="دستیار هوش مصنوعی مهندسی الکترونیک"
            className="p-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline whitespace-nowrap">دستیار مهندس</span>
          </button>

          {/* Backup dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              title="پشتیبان‌گیری و خروجی"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {showBackupMenu && (
              <div
                className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50 text-xs text-slate-200"
                onClick={() => setShowBackupMenu(false)}
              >
                <button
                  onClick={onExportBackup}
                  className="w-full text-right px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  دانلود فایل پشتیبان (JSON)
                </button>
                <button
                  onClick={onExportCSV}
                  className="w-full text-right px-3 py-2 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  خروجی اکسل و جدول (CSV)
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={onResetData}
                  className="w-full text-right px-3 py-2 hover:bg-slate-800 text-rose-400 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  بازنشانی به قطعات نمونه
                </button>
              </div>
            )}
          </div>

          {/* Theme switch */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewComponentModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت قطعه جدید</span>
          </button>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center overflow-x-auto gap-4 px-4 py-2 border-t border-slate-800 text-xs">
        <button
          onClick={() => onSelectTab('inventory')}
          className={`whitespace-nowrap ${currentTab === 'inventory' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          فهرست قطعات
        </button>
        <button
          onClick={() => onSelectTab('smart-search')}
          className={`whitespace-nowrap flex items-center gap-1 ${currentTab === 'smart-search' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          جستجوی هوشمند
        </button>
        <button
          onClick={() => onSelectTab('bom')}
          className={`whitespace-nowrap ${currentTab === 'bom' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          پروژه‌ها و BOM
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`whitespace-nowrap ${currentTab === 'history' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          تاریخچه انبار
        </button>
        <button
          onClick={() => onSelectTab('pinouts')}
          className={`whitespace-nowrap ${currentTab === 'pinouts' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
        >
          پین‌اوت‌ها
        </button>
      </div>
    </header>
  );
};
