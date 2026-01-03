/**
 * Telegram Notification Service (Pure Direct Version)
 * Sends notifications directly from the client browser to Telegram API.
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o';

const escapeHTML = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Sends a message directly to Telegram Bot API.
 * Note: Browser security (CORS) or local firewalls may block this if not permitted.
 */
export const sendTelegramNotification = async (chatId: string, message: string): Promise<boolean> => {
  if (!chatId || !BOT_TOKEN) return false;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=HTML`;

  console.log('📡 Attempting direct connection to Telegram API...');

  try {
    // محاولة الإرسال المباشر
    const response = await fetch(url, {
      method: 'GET',
      // نستخدم 'no-cors' كخيار احتياطي إذا رفض المتصفح قراءة الرد، 
      // لكن 'cors' هو الأفضل للتأكد من وصول الرسالة فعلياً.
      mode: 'cors', 
      cache: 'no-cache'
    });

    if (response.ok) {
      console.log('✅ Notification sent successfully (Direct Path)');
      return true;
    }
    
    // في بعض الأحيان ينجح الإرسال لكن المتصفح يمنع قراءة الرد (CORS)
    // نعتبر أن المحاولة تمت.
    return response.status === 0 || response.ok;
  } catch (e) {
    console.error('❌ Direct connection failed. Likely blocked by local network/firewall:', e);
    return false;
  }
};

/**
 * Generates a direct URL that can be opened in a new tab.
 */
export const getTelegramDirectLink = (chatId: string, message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;
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
<b>🔔 إشعار نظام الإحالة</b>
────────────────
<b>📌 الإجراء:</b> <code>${safeAction}</code>
<b>🔄 الحالة:</b> ${safeStatus}
<b>👤 المتدرب:</b> ${safeTrainee}
<b>✍️ بواسطة:</b> ${safeActor}
${safeComment ? `\n<b>📝 ملاحظات:</b>\n<i>${safeComment}</i>` : ''}
────────────────
📅 ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
  `.trim();
};