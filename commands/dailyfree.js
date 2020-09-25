const { bot, con } = require('../bot');
const Discord = require("discord.js");
const botconfig = require("../botconfig.json")
const color = require("../colors/colors.json")
const fs = require("fs");
const rankup = require("../funkce/rankup")

const name = "dailyfree"
const description = `Přidá denní odměnu XP.`
const usage = `${botconfig.prefix}dailyfree`
const accessableby = ["Member"]
const aliases = ["df"]

module.exports.run = async (bot, message, args) => {
    con.query(`SELECT * FROM userstats WHERE id = '${message.author.id}'`, (err, rows) => {
        let sql
        var cas = Date.now()
        var xp = rows[0].xp
        var level = rows[0].level
        var last_claim = rows[0].last_daily_xp
        var xpToNextLevel = 5 * Math.pow(level, 2) + 50 * level + 100
        var reward = Math.round(xpToNextLevel / 100)
        if (Date.now() - last_claim < 86400000) return (message.channel.send(`Dnešní free XP sis již vybral.`))
        xp += reward
        rankup.run(message, xp, level, sql, con)
        sql = `UPDATE userstats SET last_daily_xp = ${cas} WHERE id = '${message.author.id}'`;
        con.query(sql)
        message.channel.send(`Právě sis vybral svou denní odměnu o hodnotě ${reward} XP`)
    })
}

module.exports.help = {
    name: name,
    description: description,
    usage: usage,
    accessableby: accessableby,
    aliases: aliases
}