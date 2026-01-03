/**
 * Telegram Notification Service (Browser-CORS-Safe Version)
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';

/**
 * Escapes HTML special characters to prevent Telegram API errors
 */
const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sends notification using a browser-safe method that bypasses CORS restrictions
 */
export const sendTelegramNotification = async (chatId: string, message: string) => {
  if (!chatId || !BOT_TOKEN) {
    console.warn('Telegram Notification: Chat ID or Token missing.');
    return;
  }

  // نقوم بتشفير الرسالة بشكل آمن للروابط
  const encodedMessage = encodeURIComponent(message);
  
  // نستخدم رابط الـ SendMessage الخاص بتيليجرام
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

  try {
    console.debug(`Browser: Dispatching Telegram request to ID ${chatId}...`);

    /**
     * الخدعة البرمجية:
     * نستخدم mode: 'no-cors'. هذا الوضع يسمح للمتصفح بإرسال الطلب (Request) 
     * حتى لو كان الموقع الآخر لا يدعم CORS. 
     * النتيجة ستكون "Opaque Response" (لا يمكننا قراءة الرد) 
     * ولكن الطلب سيصل إلى خوادم تيليجرام ويتم تنفيذه.
     */
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors', // لتجاوز خطأ Failed to fetch (CORS)
      cache: 'no-cache',
      credentials: 'omit',
    });

    // بما أننا في وضع no-cors لا يمكننا قراءة result = await response.json()
    // لذا نفترض النجاح إذا لم يحدث Error في الشبكة (Network Error)
    console.log('✅ Browser successfully dispatched the message to Telegram.');
    return { ok: true, note: 'opaque_success' };
    
  } catch (error) {
    console.error('❌ Network error during Telegram dispatch:', error);
    throw new Error('تعذر الاتصال بخوادم تيليجرام من متصفحك.');
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
🔔 <b>تحديث في نظام الإحالة</b>

👤 <b>الإجراء:</b> ${safeAction}
👨‍🎓 <b>المتدرب:</b> ${safeTrainee}
🔄 <b>الحالة:</b> ${safeStatus}
✍️ <b>بواسطة:</b> ${safeActor}
${safeComment ? `\n📝 <b>ملاحظات:</b> ${safeComment}` : ''}

🌐 <i>إشعار مباشر من المتصفح</i>
  `.trim();
};