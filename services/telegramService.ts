/**
 * Telegram Notification Service (Browser-Optimized)
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
 * Sends notification via GET request which is more browser-friendly for cross-origin requests
 */
export const sendTelegramNotification = async (chatId: string, message: string) => {
  if (!chatId || !BOT_TOKEN) {
    console.warn('Telegram Notification: Chat ID or Token missing.');
    return;
  }

  // استخدام GET بدلاً من POST لتجنب مشاكل CORS المعقدة في المتصفحات
  // نقوم بتشفير الرسالة بشكل كامل للتأكد من وصولها للمتصفح
  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

  try {
    console.debug(`Attempting to send Telegram notification to Chat ID: ${chatId} from browser...`);
    
    // استخدام mode: 'no-cors' قد يكون ضرورياً في بعض المتصفحات إذا كان التيليجرام لا يسمح بـ Origin معين
    // لكننا سنبدأ بالوضع العادي لنتمكن من قراءة الرد
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Telegram notification sent successfully from browser.');
      return result;
    } else {
      console.error('❌ Telegram API error:', result);
      throw new Error(result.description || 'فشل في إرسال الإشعار');
    }
  } catch (error) {
    console.error('❌ Browser-side Telegram delivery failed:', error);
    throw error;
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

  // تنسيق الرسالة بشكل مبسط لضمان التوافق مع المتصفحات
  return `
🔔 <b>تحديث في نظام الإحالة</b>

👤 <b>الإجراء:</b> ${safeAction}
👨‍🎓 <b>المتدرب:</b> ${safeTrainee}
🔄 <b>الحالة:</b> ${safeStatus}
✍️ <b>بواسطة:</b> ${safeActor}
${safeComment ? `\n📝 <b>ملاحظات:</b> ${safeComment}` : ''}

🌐 <i>مرسل من متصفح المستخدم</i>
  `.trim();
};