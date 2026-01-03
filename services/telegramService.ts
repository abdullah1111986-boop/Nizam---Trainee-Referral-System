/**
 * Telegram Notification Service (Advanced Direct POST Version)
 * Optimized for 100% compatibility with Telegram Bot API.
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sends a message to Telegram using the POST method with JSON body.
 * This is the most reliable way to interact with Telegram API from a browser.
 */
export const sendTelegramNotification = async (chatId: string, message: string): Promise<boolean> => {
  if (!chatId || !BOT_TOKEN) return false;

  const endpoint = `${TELEGRAM_API_BASE}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    disable_notification: false
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors'
    });

    const result = await response.json();

    if (result.ok) {
      console.log(`✅ Telegram: Message delivered to ${chatId}`);
      return true;
    } else {
      console.error(`❌ Telegram API Error: ${result.description}`);
      return false;
    }
  } catch (e) {
    console.error('❌ Network Error: Connection to Telegram failed. Check internet/firewall.', e);
    return false;
  }
};

/**
 * Enhanced formatter for Telegram messages with better visual hierarchy.
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