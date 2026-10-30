import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Smart Search Endpoint
app.post('/api/smart-search', async (req, res) => {
  try {
    const { query, inventory } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'پرسش جستجو ارسال نشده است.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'کلید وب‌سرویس جمینای پیکربندی نشده است. لطفا در پنل Secrets بررسی کنید.',
      });
    }

    // Prepare a compact representation of the inventory to fit context efficiently
    const compactInventory = (inventory || []).slice(0, 150).map((c: any) => ({
      id: c.id,
      mpn: c.mpn,
      name: c.name,
      category: c.category,
      package: c.package,
      quantity: c.quantity,
      location: `${c.location?.box || ''} ${c.location?.drawer || ''}`.trim(),
      specs: c.specs,
      tags: c.tags,
      equivalents: c.equivalents,
    }));

    const systemInstruction = `شما یک مهندس الکترونیک و متخصص قطعه‌شناسی و انبارداری قطعات الکترونیک هستید.
وظیفه شما تحلیل درخواست جستجوی کاربر (به زبان فارسی یا انگلیسی) و یافتن بهترین قطعات از انبار کاربر، تشخیص پارامترهای فنی، و ارائه پیشنهادهای تخصصی و معادل‌یابی است.

پاسخ را دقیقا به صورت JSON با ساختار مشخص‌شده بازگردانید:
- queryAnalysis: تحلیل فنی نیاز کاربر به فارسی (مثلا: کاربر به دنبال یک رگولاتور ولتاژ با پکیج SMD است...).
- technicalSpecsExtracted: آبجکتی از مشخصات استخراج شده از پرسش (مثلا ولتاژ، جریان، مقاومت، توان، پکیج).
- matchedComponentIds: آرایه‌ای از شناسه (id) قطعاتی از موجودی ارائه‌شده که دقیقا یا تا حدودی با نیاز کاربر همخوانی دارند، به ترتیب اولویت تطابق.
- matchExplanations: آبجکتی که کلید آن شناسه قطعه (id) و مقدار آن علت پیشنهاد این قطعه به فارسی است.
- equivalentSuggestions: پیشنهاد قطعات معروف و استانداردی که برای این کاربرد عالی هستند (چه در انبار باشد یا نیاز به خرید داشته باشد)، همراه با مشخصات و دلیل.
- recommendationsText: توصیه‌های مهندسی در مورد مدار، خنک‌کاری، تلرانس یا ملاحظات طراحی مرتبط به فارسی.`;

    const prompt = `متن جستجوی کاربر:
"${query}"

لیست قطعات موجود در انبار:
${JSON.stringify(compactInventory, null, 2)}

لطفا تحلیل کنید و موارد منطبق یا معادل را از انبار بیابید.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            queryAnalysis: {
              type: Type.STRING,
              description: 'تحلیل فنی درخواست به زبان فارسی',
            },
            technicalSpecsExtracted: {
              type: Type.OBJECT,
              description: 'مشخصات فنی استخراج شده',
            },
            matchedComponentIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'شناسه‌های قطعات منطبق در انبار',
            },
            matchExplanations: {
              type: Type.OBJECT,
              description: 'توضیحات فارسی دلیل تطابق هر شناسه',
            },
            equivalentSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mpn: { type: Type.STRING },
                  description: { type: Type.STRING },
                  advantage: { type: Type.STRING },
                },
                required: ['mpn', 'description'],
              },
              description: 'پیشنهادات قطعات معادل استاندارد',
            },
            recommendationsText: {
              type: Type.STRING,
              description: 'نکات مهندسی و تجربی در طراحی مدار',
            },
          },
          required: ['queryAnalysis', 'matchedComponentIds', 'recommendationsText'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Smart search error:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در برقراری ارتباط با مدل هوش مصنوعی',
    });
  }
});

// AI Electronics Assistant (Q&A, Pinouts, Equivalents, Circuit Advice)
app.post('/api/ai-assistant', async (req, res) => {
  try {
    const { prompt, componentContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'متن پیام ارسال نشده است.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'کلید وب‌سرویس جمینای فعال نیست. لطفا در پنل تنظیمات Secrets بررسی کنید.',
      });
    }

    const systemInstruction = `شما دستیار ارشد مهندسی برق و الکترونیک در سامانه قطعه‌یار هستید.
شما به زبان فارسی روان، دقیق، تخصصی و ساختاریافته پاسخ می‌دهید.
پاسخ‌ها می‌توانند شامل:
- مشخصات قطعه و کاربردها
- پین‌اوت و نام پایه‌ها
- معادل‌های متداول در بازار ایران
- فرمول‌ها و محاسبات ساده (مانند مقاومت محدودکننده LED، دیوایدر ولتاژ، فرکانس تایمر ۵۵۵)
- نکات مونتاژ و نگهداری (ESD، هیت‌سینک، پکیج)
همیشه پاسخ‌ها را خوانا و با بولت‌پوینت‌های مرتب ارائه دهید.`;

    let userPrompt = prompt;
    if (componentContext) {
      userPrompt = `اطلاعات قطعه انتخابی:
پارت نامبر: ${componentContext.mpn}
نام: ${componentContext.name}
پکیج: ${componentContext.package}
دسته‌بندی: ${componentContext.category}
مشخصات: ${JSON.stringify(componentContext.specs || {})}

پرسش کاربر:
${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({ response: response.text });
  } catch (error: any) {
    console.error('AI assistant error:', error);
    return res.status(500).json({
      error: error?.message || 'خطا در ارتباط با سرور هوش مصنوعی',
    });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ ElectroStock server running on port ${PORT} [${isProduction ? 'Production' : 'Development'}]`);
  });
}

startServer();
