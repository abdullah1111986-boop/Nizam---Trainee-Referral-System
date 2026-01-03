/**
 * Telegram Notification Service (CORS-Optimized)
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';

/**
 * Escapes HTML characters strictly for Telegram
 */
const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sends notification using fetch with 'no-cors' mode.
 * This ensures the GET request is dispatched even if the browser blocks the response.
 */
export const sendTelegramNotification = async (chatId: string, message: string): Promise<boolean> => {
  if (!chatId || !BOT_TOKEN) return false;

  const encodedMessage = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

  try {
    // نستخدم no-cors لضمان خروج الطلب من المتصفح دون حظر بسبب سياسات CORS
    await fetch(url, {
      mode: 'no-cors',
      cache: 'no-cache',
      credentials: 'omit'
    });
    console.log('📡 Telegram message dispatched via fetch (no-cors)');
    return true;
  } catch (error) {
    console.error('❌ Network error sending to Telegram:', error);
    return false;
  }
};

/**
 * Generates a direct link that the user can open to send a message (Fallback method)
 */
export const getTelegramDirectLink = (chatId: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;
};

/**
 * Professional Telegram Message Template
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

  return `
<b>🔔 إشعار من نظام الإحالة</b>
────────────────
<b>📌 الإجراء:</b> <code>${safeAction}</code>
<b>🔄 الحالة:</b> ${safeStatus}

<b>👤 المتدرب:</b> ${safeTrainee}
<b>✍️ بواسطة:</b> ${safeActor}

${safeComment ? `<b>📝 ملاحظات:</b>\n<i>${safeComment}</i>\n` : ''}
────────────────
📅 ${new Date().toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
  `.trim();
};