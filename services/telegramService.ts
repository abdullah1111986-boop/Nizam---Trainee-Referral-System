/**
 * Telegram Notification Service
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

export const sendTelegramNotification = async (chatId: string, message: string) => {
  if (!chatId || !BOT_TOKEN || BOT_TOKEN.includes('REPLACE')) return;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const sendRequest = async (useHtml: boolean) => {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: useHtml ? 'HTML' : undefined,
      }),
    });
  };

  try {
    let response = await sendRequest(true);

    // If HTML parsing fails (often due to unmatched tags or entities), fallback to plain text
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Telegram HTML send failed, trying plain text fallback...', errorData);
      
      // Strip HTML tags for plain text delivery as a last resort
      const plainMessage = message.replace(/<[^>]*>/g, ''); 
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainMessage,
        }),
      });
    }

    if (!response.ok) {
      console.error('Telegram notification completely failed:', await response.text());
    }
  } catch (error) {
    console.error('Network error during Telegram notification send:', error);
  }
};

export const formatReferralMessage = (
  action: string,
  traineeName: string,
  status: string,
  actorName: string,
  comment?: string
) => {
  // Use escaped versions for user-generated content to prevent HTML injection/errors
  const safeAction = escapeHTML(action);
  const safeTrainee = escapeHTML(traineeName);
  const safeStatus = escapeHTML(status);
  const safeActor = escapeHTML(actorName);
  const safeComment = comment ? escapeHTML(comment) : '';

  return `
🔔 <b>تحديث جديد في نظام الإحالة</b>

👤 <b>الإجراء:</b> ${safeAction}
👨‍🎓 <b>المتدرب:</b> ${safeTrainee}
🔄 <b>الحالة الحالية:</b> ${safeStatus}
✍️ <b>بواسطة:</b> ${safeActor}
${safeComment ? `\n📝 <b>ملاحظات:</b>\n${safeComment}` : ''}

📅 <i>تم الإرسال تلقائياً من نظام إحالة المتدربين</i>
  `.trim();
};
