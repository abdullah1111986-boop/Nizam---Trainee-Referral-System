/**
 * Telegram Notification Service (Diagnostic Version)
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramResponse {
  success: boolean;
  message?: string;
  errorCode?: number;
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
 * يتحقق من صحة التوكين وحالة البوت
 */
export const checkBotStatus = async (): Promise<TelegramResponse> => {
  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/getMe`);
    const data = await response.json();
    if (data.ok) {
      return { success: true, message: `البوت جاهز: @${data.result.username}` };
    }
    return { success: false, errorCode: data.error_code, description: data.description };
  } catch (e) {
    return { success: false, description: 'فشل الوصول لخوادم تيليجرام (ربما مشكلة في الإنترنت)' };
  }
};

/**
 * إرسال إشعار مع تحليل الأخطاء
 */
export const sendTelegramNotification = async (chatId: string, message: string): Promise<TelegramResponse> => {
  if (!chatId) return { success: false, description: 'المعرف الرقمي (ID) ناقص' };
  
  const endpoint = `${TELEGRAM_API_BASE}/sendMessage`;
  const payload = {
    chat_id: chatId.trim(),
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.ok) {
      return { success: true };
    } else {
      // تحليل الخطأ الصادر من تيليجرام
      let userFriendlyMsg = result.description;
      if (result.error_code === 403) userFriendlyMsg = 'المستخدم قام بحظر البوت أو لم يفعله بعد (أرسل /start للبوت أولاً)';
      if (result.error_code === 400) userFriendlyMsg = 'المعرف الرقمي (Chat ID) غير صحيح أو لم يسبق له التفاعل مع البوت';
      
      return { 
        success: false, 
        errorCode: result.error_code, 
        description: result.description,
        message: userFriendlyMsg
      };
    }
  } catch (e) {
    console.error('Network Error:', e);
    return { 
      success: false, 
      description: 'تعذر الاتصال بخادم تيليجرام من متصفحك. قد يكون السبب حماية الشبكة (CORS) أو انقطاع الإنترنت.' 
    };
  }
};

export const formatReferralMessage = (
  action: string,
  traineeName: string,
  status: string,
  actorName: string,
  comment?: string
) => {
  const safeAction = escapeHTML(action);
  const safeTrainee = escapeHTML(traineeName);
  const safeStatus = escapeHTML(status);
  const safeActor = escapeHTML(actorName);
  const safeComment = comment ? escapeHTML(comment) : '';

  return `
<b>🔔 إشعار من نظام الإحالة</b>
<b>────────────────</b>
<b>📌 الإجراء:</b> <code>${safeAction}</code>
<b>🔄 الحالة الحالية:</b> <b>${safeStatus}</b>
<b>👤 المتدرب:</b> <code>${safeTrainee}</code>
<b>✍️ بواسطة:</b> <i>${safeActor}</i>
${safeComment ? `\n<b>📝 ملاحظات الإجراء:</b>\n<blockquote>${safeComment}</blockquote>` : ''}
<b>────────────────</b>
📅 ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
  `.trim();
};