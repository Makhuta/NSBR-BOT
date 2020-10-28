const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage, Canvas } = require("canvas");
const { join } = require("path");
const find_channel_by_name = require("../channelfinder/find_channel_by_name")

module.exports = {
    async run(message, color2, color1, vysledek, vyhernicislo) {
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');
        const background = await loadImage(join(__dirname, "../..", "pictures", "xp_background.jpg"));
        ctx.globalAlpha = 0;
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(250, 250, 225, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(250, 250, 210, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.fillStyle = color2;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.arc(250, 250, 175, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "250px Calibri";
        ctx.textAlign = "center";
        ctx.fillStyle = color2;
        ctx.fillText(`${vysledek[0]}`, 250, 340);
        ctx.closePath();

        ctx.beginPath();
        ctx.font = "30px Calibri";
        ctx.textAlign = "center";
        ctx.fillStyle = "#000000";
        ctx.fillText(vyhernicislo, 250, 450);
        ctx.closePath();


        const attachment = new MessageAttachment(canvas.toBuffer(), `coinflip_${vysledek}.png`);

        let hodnotyout = ({ zprava: attachment, roomname: require("../../botconfig/roomnames.json").botcommand })
        find_channel_by_name.run(hodnotyout)
    }
}