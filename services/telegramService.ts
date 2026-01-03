/**
 * Telegram Notification Service (Extreme Resilience Version)
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
 * Proxy Method 1: AllOrigins (Common public proxy)
 */
const tryViaAllOrigins = async (chatId: string, message: string) => {
  const encodedMsg = encodeURIComponent(message);
  const target = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMsg}&parse_mode=HTML`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
  
  try {
    const response = await fetch(proxyUrl);
    const data = await response.json();
    return data.contents && data.contents.includes('"ok":true');
  } catch (e) {
    return false;
  }
};

/**
 * Proxy Method 2: Worker Proxy (Alternative endpoint)
 */
const tryViaAlternativeProxy = async (chatId: string, message: string) => {
  const encodedMsg = encodeURIComponent(message);
  const target = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMsg}&parse_mode=HTML`;
  // استخدام وكيل مختلف تماماً عن الأول
  const proxyUrl = `https://thingproxy.freeboard.io/fetch/${target}`;
  
  try {
    const response = await fetch(proxyUrl);
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const sendTelegramNotification = async (chatId: string, message: string): Promise<boolean> => {
  if (!chatId || !BOT_TOKEN) return false;

  console.log('📡 Starting Multi-Path Dispatch...');

  // 1. محاولة الوكيل الأول
  const res1 = await tryViaAllOrigins(chatId, message);
  if (res1) return true;

  // 2. محاولة الوكيل الثاني إذا فشل الأول
  const res2 = await tryViaAlternativeProxy(chatId, message);
  if (res2) return true;

  // 3. المحاولة المباشرة (كخيار أخير)
  try {
    const encodedMsg = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMsg}&parse_mode=HTML`;
    await fetch(url, { mode: 'no-cors' });
    return true; // نفترض النجاح في وضع no-cors
  } catch (e) {
    return false;
  }
};

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