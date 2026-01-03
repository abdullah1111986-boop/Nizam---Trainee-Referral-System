/**
 * Telegram Notification Service (Browser-CORS-Safe via Image Beacon)
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
 * Sends notification using "Image Beacon" technique.
 * This is the most robust way to bypass CORS in browsers.
 */
export const sendTelegramNotification = (chatId: string, message: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!chatId || !BOT_TOKEN) {
      console.warn('Telegram Notification: Chat ID or Token missing.');
      resolve();
      return;
    }

    const encodedMessage = encodeURIComponent(message);
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=HTML`;

    console.debug(`Browser Beacon: Sending notification to ${chatId}...`);

    /**
     * استخدام عنصر Image هو الطريقة المثلى لتجاوز CORS.
     * المتصفح يسمح بتحميل الصور من أي نطاق (Domain) آخر دون قيود.
     */
    const img = new Image();
    
    // عند نجاح الإرسال (حتى لو لم تكن صورة، وصول الطلب يكفي)
    img.onload = () => {
      console.log('✅ Telegram request delivered successfully.');
      resolve();
    };

    // في معظم الحالات، تليجرام سيرد بـ JSON وليس صورة، لذا سيحدث "Error" في تحميل الصورة
    // ولكن هذا الخطأ يحدث *بعد* وصول الطلب لتليجرام وتنفيذه.
    img.onerror = () => {
      // نعتبرها نجاحاً لأن الطلب GET تم إرساله بالفعل للخادم
      console.log('📡 Telegram request dispatched (Image error expected but message sent).');
      resolve();
    };

    // إطلاق الطلب
    img.src = url;

    // مهلة زمنية للأمان
    setTimeout(() => resolve(), 2000);
  });
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

🌐 <i>مرسل عبر متصفح آمن</i>
  `.trim();
};