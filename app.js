const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

require("dotenv").config();

const token = process.env.token;

var users = [];

let file = fs.readFileSync("backup.txt");

let usersBackup = file.toString();

if (usersBackup !== "") {
  console.log("Data Restored Successfully!");
  usersBackup.split(",").forEach((user) => {
    users.push(+user);
  });
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// start
bot.onText(/\/start/, function start(msg) {
  const opts = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [["Yes, I want "], ["No, thanks"]],
    }),
  };
  bot.sendMessage(
    msg.chat.id,
    "Do you want to subscribe to the daily ayat bot 🎈",
    opts
  );
});

bot.onText(/Yes, I want/, (msg) => {
  if (users.includes(msg.chat.id)) {
    bot.sendMessage(msg.chat.id, "Sorry the user is already exists");
  } else {
    bot.sendMessage(msg.chat.id, "You subscibed successfully!");
    users.push(msg.chat.id);
    fs.writeFileSync("backup.txt", `${users}`);
    console.log(users);
  }
});

bot.onText(/No, thanks/, (msg) => {
  bot.sendMessage(msg.chat.id, "You can subscribe anytime.");
});

bot.onText(/\/unsub/, function send(msg) {
  if (users.includes(msg.chat.id)) {
    let del = users.indexOf(msg.chat.id);

    users.splice(del, 1);

    fs.writeFileSync("backup.txt", `${users}`);

    console.log(users);

    bot.sendMessage(msg.chat.id, "You unsubscribed successfully!");
  } else {
    bot.sendMessage(msg.chat.id, "You are not a subscriber!");
  }
});

// who subscirbed
const cron = require("node-cron");

var request = require("request");

cron.schedule("0 * * * *", () => {
  users.forEach((user) => {
    let random = Math.floor(Math.random() * 6236) + 1;

    request(
      `https://api.alquran.cloud/v1/ayah/${random}/ar.minshawi`,
      (er, r, body) => {
        let data = JSON.parse(body);
        bot.sendMessage(
          user,
          `${data.data.surah.name} ${data.data.numberInSurah}`
        );
        bot.sendMessage(user, data.data.text);
        bot.sendAudio(user, data.data.audio);
      }
    );
  });
});
