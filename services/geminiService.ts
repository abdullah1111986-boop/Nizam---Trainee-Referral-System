
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CaseType, Repetition } from "../types";

/**
 * يحلل تفاصيل الحالة باستخدام ذكاء Gemini الاصطناعي ويقترح إجراءات تربوية.
 */
export const analyzeCaseWithGemini = async (
  caseDetails: string,
  caseTypes: CaseType[],
  repetition: Repetition,
  previousActions: string
): Promise<string> => {
  try {
    // إنشاء عميل جديد عند الحاجة لضمان استخدام أحدث مفتاح API من البيئة
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `أنت مستشار تربوي خبير في المؤسسة العامة للتدريب التقني والمهني بالسعودية. 
حلل الحالة التدريبية التالية وقدم توصية مهنية محددة للمرشد التدريبي. 
اجعل التوصية عملية، إجرائية، ومختصرة (لا تزيد عن 80 كلمة).`;

    const prompt = `
الحالة التدريبية للمتدرب:
- تصنيف المشكلة: ${caseTypes.join('، ')}
- مدى التكرار: ${repetition}
- تفاصيل المشكلة: ${caseDetails}
- ما تم اتخاذه من قبل المدرب: ${previousActions || 'لا توجد إجراءات سابقة'}

المطلوب: تقديم خطة عمل فورية للمرشد.`;

    // استخدام gemini-3-pro-preview للمهام التحليلية المعقدة
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        // يمكن تعطيل التفكير العميق لسرعة الاستجابة في هذا السياق
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    // الوصول المباشر لخاصية text كما هو محدد في إرشادات SDK
    return response.text || "لم نتمكن من تحليل الحالة حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "نعتذر، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي للتحليل.";
  }
};
