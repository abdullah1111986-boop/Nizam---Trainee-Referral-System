
/**
 * Telegram Notification Service
 * To use this, you need a Bot Token from @BotFather
 */

const BOT_TOKEN = '8589128782:AAEvXaKJxFipipYhbX8TJ9u9rBzEN_FHr4o'; // Updated with user provided Token

export const sendTelegramNotification = async (chatId: string, message: string) => {
  if (!chatId || !BOT_TOKEN || BOT_TOKEN.includes('REPLACE')) return;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Telegram notification failed', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
};

export const formatReferralMessage = (
  action: string,
  traineeName: string,
  status: string,
  actorName: string,
  comment?: string
) => {
  return `
🔔 <b>تحديث جديد في نظام الإحالة</b>

👤 <b>الإجراء:</b> ${action}
👨‍🎓 <b>المتدرب:</b> ${traineeName}
🔄 <b>الحالة الحالية:</b> ${status}
✍️ <b>بواسطة:</b> ${actorName}
${comment ? `\n📝 <b>ملاحظات:</b>\n${comment}` : ''}

📅 <i>تم الإرسال تلقائياً من نظام إحالة المتدربين</i>
  `.trim();
};
