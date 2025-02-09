import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "");
const app = express();

// Добавляем обработчик для healthcheck
app.get('/', (req: Request, res: Response) => {
  console.log('Health check requested');
  res.status(200).send('OK');
});

// Обработчик команды /start
bot.command("start", async (ctx) => {
  await ctx.reply("Приветствую тебя, смельчак! Осмелишься ли ты погрузиться в таинственный мир лагеря? Нажми кнопку, если готов узнать все его секреты...", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "🕯️ Войти в мир лагеря 🕯️",
          web_app: { 
            url: process.env.WEBAPP_URL || "https://blackcommunar.vercel.app"
          }
        }
      ]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });
});

// Игнорируем все сообщения и команды
bot.on("message", () => {});
bot.on("callback_query", () => {});

// Запуск бота
if (process.env.NODE_ENV === 'production' && process.env.DOMAIN) {
  const PORT = Number(process.env.PORT) || 3000;
  
  // Настраиваем webhook
  app.use(bot.webhookCallback('/webhook'));
  
  // Запускаем сервер
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Устанавливаем webhook с https
  const webhookUrl = `https://${process.env.DOMAIN}/webhook`;
  console.log(`Setting webhook to: ${webhookUrl}`);
  
  bot.telegram.setWebhook(webhookUrl)
    .then(() => {
      console.log('Webhook set successfully');
    })
    .catch((error) => {
      console.error('Failed to set webhook:', error);
    });
} else {
  // Запуск в режиме long polling для разработки
  bot.launch().then(() => {
    console.log('Bot started in polling mode');
  });
}

// Включаем graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 