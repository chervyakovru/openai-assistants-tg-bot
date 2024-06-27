import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { code } from "telegraf/format";
import config from "config";
import { openai } from "./openai.js";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

bot.command("start", async (ctx) => {
  await ctx.reply("Жду вашего текстового сообщения");
});

bot.on(message("text"), async (ctx) => {
  try {
    await ctx.reply(code("Сообщение принял. Жду ответ от сервера"));
    const responseText = await getResponseFromOpenAi(
      ctx.message.chat.id,
      ctx.message.text
    );
    await ctx.reply(responseText);
  } catch (error) {
    console.log("error: ", error);
    await ctx.reply("Произошла ошибка во время запроса к openAI.");
  }
});

const getResponseFromOpenAi = async (chatId, text) => {
  const threadId = await openai.getOrCreateThreadId(chatId);
  await openai.createMessage(threadId, text);
  const run = await openai.run(threadId);
  await openai.awaitRun(threadId, run.id);
  const messageText = await openai.getLastMessageText(threadId);

  if (process.env.NODE_ENV === "development") {
    console.log("date: ", new Date().toLocaleString());
    console.log("text: ", text);
    console.log("messageText: ", messageText);
  }

  return messageText;
};

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
