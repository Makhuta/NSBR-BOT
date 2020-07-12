const {bot} = require('../bot');
const botconfig = require("../botconfig.json")

bot.login(process.env.BOT_TOKEN);
bot.on("ready", () => {
    console.log(`${bot.user.username} is Ready!`);
    bot.user.setActivity('NSBR Server', {type: "WATCHING"});
  })