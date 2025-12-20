
import { GoogleGenAI } from "@google/genai";
import { CaseType, Repetition } from "../types";

// Initialize Gemini Client
// The API key is obtained exclusively from the environment variable process.env.API_KEY.
// Following the guideline to use the named parameter and direct process.env access.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeCaseWithGemini = async (
  caseDetails: string,
  caseTypes: CaseType[],
  repetition: Repetition,
  previousActions: string
): Promise<string> => {
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

    // Using gemini-3-pro-preview for complex reasoning and analysis tasks as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Access the text property directly as per Gemini API guidelines (not a method call)
    return response.text || "لم يتم إنشاء تحليل.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "حدث خطأ أثناء تحليل الحالة بواسطة الذكاء الاصطناعي.";
  }
};
