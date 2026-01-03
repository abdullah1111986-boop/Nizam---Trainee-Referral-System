/**
 * Telegram Notification Service (Resilient Version)
 * Designed to bypass strict institutional firewalls using multiple fallback methods.
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
 * Method 1: Direct Fetch (Modern, but often blocked by firewalls)
 */
const tryDirectFetch = async (url: string) => {
  return fetch(url, { mode: 'no-cors', cache: 'no-cache' });
};

/**
 * Method 2: Script Tag Injection (Legacy trick, bypasses most XHR filters)
 */
const tryScriptInjection = (url: string) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => {
      document.body.removeChild(script);
      resolve(true);
    };
    script.onerror = () => {
      document.body.removeChild(script);
      resolve(false);
    };
    document.body.appendChild(script);
    setTimeout(() => resolve(false), 3000);
  });
};

/**
 * Method 3: Public Proxy (Bypasses DNS/Domain blocking)
 */
const tryViaProxy = async (chatId: string, message: string) => {
  const encodedMsg = encodeURIComponent(message);
  const target = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMsg}&parse_mode=HTML`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target)}`;
  
  try {
    const response = await fetch(proxyUrl);
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const sendTelegramNotification = async (chatId: string, message: string): Promise<boolean> => {
  if (!chatId || !BOT_TOKEN) return false;

  const encodedMessage = encodeURIComponent(message);
  const directUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

  console.log('📡 Attempting to send Telegram notification...');

  // محاولة الإرسال المباشر أولاً
  try {
    await tryDirectFetch(directUrl);
    // بما أن no-cors لا تعطي نتيجة حقيقية، نعتبرها نجحت مبدئياً في الخروج من المتصفح
  } catch (e) {
    console.warn('⚠️ Direct fetch blocked, trying script injection...');
  }

  // محاولة حقن السكريبت كبديل قوي
  await tryScriptInjection(directUrl);

  // المحاولة عبر البروكسي لضمان الوصول الفعلي في حال حظر الدومين
  const proxyResult = await tryViaProxy(chatId, message);
  
  return proxyResult;
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