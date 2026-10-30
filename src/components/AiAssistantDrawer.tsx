import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Zap,
} from 'lucide-react';
import { Component } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedComponent?: Component | null;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  selectedComponent,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: selectedComponent
        ? `سلام! من دستیار هوش مصنوعی قطعه‌یار هستم. می‌توانید هر سوال فنی، معادل‌یابی، پین‌اوت یا نحوه بایاس و استفاده از قطعه **${selectedComponent.mpn}** در مدار را از من بپرسید.`
        : 'سلام! من دستیار تخصصی مهندسی برق و الکترونیک شما در سامانه قطعه‌یار هستم. در مورد انتخاب قطعات، معادل‌یابی، حل معادلات مدار یا طراحی شماتیک چه کمکی از دست من ساخته است؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          componentContext: selectedComponent || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'خطا در ارتباط با سرور هوش مصنوعی');
      }

      const data = await res.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.response || 'پاسخی دریافت نشد.' }]);
    } catch (e: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: `⚠️ متاسفانه در ارتباط با سرور مشکلی رخ داد: ${e.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = selectedComponent
    ? [
        `معادل‌های پرکاربرد و جایگزین ${selectedComponent.mpn} در بازار ایران چیست؟`,
        `پین‌اوت و نکات مهم در بایاس و منبع تغذیه ${selectedComponent.mpn}`,
        `محاسبه قطعات جانبی و خازن‌های فیلتر برای این قطعه`,
      ]
    : [
        'تفاوت ماسفت کانال N با ترانزیستور NPN و زمان استفاده از هرکدام',
        'فرمول محاسبه مقاومت محدودکننده جریان برای LED با ولتاژ ۵ ولت',
        'چگونه خازن دیکوپلینگ مناسب برای تغذیه میکروکنترلر انتخاب کنیم؟',
      ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col text-slate-100">
      {/* Drawer Header */}
      <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">دستیار مهندسی الکترونیک</h2>
            <div className="text-[11px] text-cyan-400 font-mono">Gemini 3.8 Flash</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Component Context Pill if present */}
      {selectedComponent && (
        <div className="bg-cyan-950/40 border-b border-cyan-900/50 px-4 py-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">قطعه انتخاب شده:</span>
          <span className="font-mono font-bold text-cyan-400">
            {selectedComponent.mpn} ({selectedComponent.package})
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-cyan-400'
              }`}
            >
              {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`rounded-2xl p-3.5 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tl-xs'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tr-xs'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>در حال پردازش و استخراج اطلاعات فنی...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 space-y-1.5">
        <div className="text-[10px] text-slate-500 font-medium">پرسش‌های آماده:</div>
        <div className="flex flex-col gap-1 text-[11px]">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-right px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition-colors truncate"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="سوال فنی خود را بنویسید..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
