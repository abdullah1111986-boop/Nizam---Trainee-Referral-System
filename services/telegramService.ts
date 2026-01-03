/**
 * Telegram Notification Service (CORS-Optimized)
 * يستخدم طريقة Simple Requests لتجاوز قيود CORS في المتصفحات
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramResponse {
  success: boolean;
  message?: string;
  description?: string;
}

const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * يتحقق من حالة البوت باستخدام طلب GET بسيط
 */
export const checkBotStatus = async (): Promise<TelegramResponse> => {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return { success: true, message: `البوت نشط: @${data.result.username}` };
    }
    return { success: false, description: data.description };
  } catch (e) {
    return { success: false, description: 'فشل الوصول للخادم (تحقق من اتصال الإنترنت)' };
  }
};

/**
 * إرسال الإشعار باستخدام x-www-form-urlencoded لتجنب preflight CORS
 */
export const sendTelegramNotification = async (chatId: string, message: string): Promise<TelegramResponse> => {
  if (!chatId) return { success: false, description: 'المعرف الرقمي (ID) مطلوب' };
  
  // استخدام URLSearchParams يجعل المتصفح يتعامل معه كـ Simple Request
  const params = new URLSearchParams();
  params.append('chat_id', chatId.trim());
  params.append('text', message);
  params.append('parse_mode', 'HTML');

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      body: params, // هذا يضبط الـ Content-Type تلقائياً إلى application/x-www-form-urlencoded
      mode: 'cors'
    });

    const result = await response.json();
    if (result.ok) return { success: true };

    let errorMsg = result.description;
    if (result.error_code === 403) errorMsg = 'تأكد من إرسال كلمة (Start) للبوت في تيليجرام أولاً.';
    if (result.error_code === 400) errorMsg = 'المعرف الرقمي غير صحيح، يرجى مراجعته.';
    
    return { success: false, description: errorMsg };
  } catch (e) {
    // في حال فشل الـ fetch تماماً (حظر من الشبكة)
    return { 
      success: false, 
      description: 'تعذر الاتصال بخوادم تيليجرام. يرجى التحقق من إعدادات الشبكة أو البروكسي في الكلية.' 
    };
  }
};

export const formatReferralMessage = (action: string, traineeName: string, status: string, actorName: string, comment?: string) => {
  const safeAction = escapeHTML(action);
  const safeTrainee = escapeHTML(traineeName);
  const safeStatus = escapeHTML(status);
  const safeActor = escapeHTML(actorName);
  const safeComment = comment ? escapeHTML(comment) : '';

  return `
<b>🔔 إشعار نظام الإحالة</b>
<b>────────────────</b>
<b>📌 الإجراء:</b> <code>${safeAction}</code>
<b>🔄 الحالة:</b> <b>${safeStatus}</b>
<b>👤 المتدرب:</b> <code>${safeTrainee}</code>
<b>✍️ بواسطة:</b> <i>${safeActor}</i>
${safeComment ? `\n<b>📝 ملاحظات:</b>\n<blockquote>${safeComment}</blockquote>` : ''}
<b>────────────────</b>
📅 ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
  `.trim();
};