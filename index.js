const { Telegraf } = require("telegraf");
const fs = require("fs");

const BOT_TOKEN = "8006015641:AAHMiqhkmtvRmdLMN1Rbz2EnwsIrsGfH8qU";
const ADMIN_ID = 1858324638;
const SHORTCODES_FILE = "./data.json";

const bot = new Telegraf(BOT_TOKEN);

// Load shortcodes
let shortcodes = {};
if (fs.existsSync(SHORTCODES_FILE)) {
  shortcodes = JSON.parse(fs.readFileSync(SHORTCODES_FILE, "utf-8"));
}

// Mini App click handler
bot.start(async (ctx) => {
  const payload = ctx.startPayload;
  if (!payload) return ctx.reply("Welcome! Click a video from Mini App.");

  if (!shortcodes[payload]) return ctx.reply("Video not found or shortcode invalid!");

  const videoInfo = shortcodes[payload];

  try {
    if (videoInfo.type === "video") {
      await ctx.telegram.sendVideo(ctx.chat.id, videoInfo.file_id, {
        caption: "Here is your video 🎬",
      });
    } else if (videoInfo.type === "document") {
      await ctx.telegram.sendDocument(ctx.chat.id, videoInfo.file_id, {
        caption: "Here is your file 📥",
      });
    } else {
      await ctx.reply("Unsupported type!");
    }
  } catch (err) {
    console.error("Error sending video:", err);
    await ctx.reply("Failed to send video, try again later.");
  }
});

// Admin shortcut to add shortcodes
bot.command("add", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const parts = ctx.message.text.split(" ");
  if (parts.length !== 4) return ctx.reply("Usage: /add <shortcode> <type> <file_id>");

  const [_, code, type, file_id] = parts;
  shortcodes[code] = { type, file_id };
  fs.writeFileSync(SHORTCODES_FILE, JSON.stringify(shortcodes, null, 2));
  ctx.reply(`Shortcode ${code} saved successfully!`);
});

bot.launch().then(() => console.log("Bot running..."));

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
