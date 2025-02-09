import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || "");

// Добавим обработчик для проверки работоспособности
bot.command("ping", (ctx) => ctx.reply("pong"));

// Обработчик команды /start
bot.command("start", async (ctx) => {
  await ctx.reply("Добро пожаловать! Нажмите кнопку, чтобы открыть приложение.", {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "▢ Launch App",
          web_app: { 
            url: process.env.WEBAPP_URL || "https://blackcommunar.vercel.app"
          }
        }
      ]]
    }
  });
});

// Игнорируем все остальные сообщения
bot.on("message", () => {});

// Запуск бота
if (process.env.NODE_ENV === 'production' && process.env.DOMAIN) {
  // Запуск в режиме webhook для Railway
  const PORT = process.env.PORT || 3000;
  bot.launch({
    webhook: {
      domain: process.env.DOMAIN,
      port: Number(PORT),
      hookPath: '/webhook'
    }
  }).then(() => {
    console.log('Bot started in webhook mode');
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