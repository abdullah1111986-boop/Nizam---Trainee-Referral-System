/**
 * Telegram Notification Service (Professional Format Version)
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';

/**
 * Escapes HTML special characters to prevent Telegram API errors
 * Telegram is very strict about unclosed tags or illegal entities.
 */
const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sends notification using "Image Beacon" technique.
 * This bypasses CORS and sends the message as a background request.
 */
export const sendTelegramNotification = (chatId: string, message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!chatId || !BOT_TOKEN) {
      resolve();
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;

    // Safety timeout
    setTimeout(() => resolve(), 2500);
  });
};

/**
 * Formats a professional and visually appealing message for Telegram
 */
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

  // القالب الجديد للرسالة
  return `
📝 <b>إشعار تحديث إحالة</b>
────────────────
📌 <b>الإجراء:</b> <code>${safeAction}</code>
🔄 <b>الحالة الحالية:</b> <b>${safeStatus}</b>

👤 <b>المتدرب:</b> <code>${safeTrainee}</code>
✍️ <b>بواسطة:</b> 👨‍🏫 ${safeActor}

${safeComment ? `💬 <b>ملاحظات:</b>\n<i>${safeComment}</i>\n` : ''}
────────────────
📅 <b>التوقيت:</b> ${new Date().toLocaleString('ar-SA', { hour12: true, hour: '2-digit', minute: '2-digit' })}
🌐 <b>نظام الإحالة الرقمي</b>
  `.trim();
};