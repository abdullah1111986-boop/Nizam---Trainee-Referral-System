import { GoogleGenAI } from "@google/genai";
import { CaseType, Repetition } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini Client
// Note: In a real production app, ensure API keys are not exposed on the client side.
// This is for demonstration using the provided environment variable pattern.
const ai = new GoogleGenAI({ apiKey });

export const analyzeCaseWithGemini = async (
  caseDetails: string,
  caseTypes: CaseType[],
  repetition: Repetition,
  previousActions: string
): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return "الخدمة الذكية غير متوفرة حالياً (مفتاح API مفقود).";
  }

  try {
    const prompt = `
      بصفتك مستشاراً تربوياً وتدريبياً خبيراً، قم بتحليل حالة المتدرب التالية واقترح حلولاً عملية ومهنية للمرشد الطلابي.
      
      بيانات الحالة:
      - نوع المشكلة: ${caseTypes.join(', ')}
      - تكرار المشكلة: ${repetition}
      - تفاصيل الحالة: ${caseDetails}
      - الإجراءات السابقة التي اتخذها المدرب: ${previousActions}

      المطلوب:
      قدم توصية موجزة ومهنية (لا تتجاوز 100 كلمة) تتضمن خطوات إجرائية يمكن للمرشد التدريبي اتخاذها لحل هذه المشكلة وتعديل سلوك المتدرب أو تحسين مستواه.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم يتم إنشاء تحليل.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "حدث خطأ أثناء تحليل الحالة بواسطة الذكاء الاصطناعي.";
  }
};