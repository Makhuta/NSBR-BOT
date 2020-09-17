const { MessageAttachment } = require("discord.js");
const { createCanvas, loadImage, Canvas } = require("canvas");
const { join } = require("path");

module.exports = {
    async run(xp, level, target, message, xpToNextLevel) {
        const canvas = createCanvas(1000, 333);
    const ctx = canvas.getContext('2d');
    const background = await loadImage(join(__dirname, "..", "pictures", "background.jpg"));
    var sirka = ((100 / (xpToNextLevel)) * xp) * 7.7;
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(180, 216, 770, 65);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeRect(180, 216, 770, 65);
    ctx.stroke();

    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#e67e22";
    ctx.fillRect(180, 216, sirka, 65);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${xp}/${xpToNextLevel} XP`, 600, 260);

    ctx.textAlign = "left"
    ctx.fillText(target.username + "#" + target.discriminator, 300, 120);

    ctx.font = "50px Arial";
    ctx.fillText("Level:", 300, 180);
    ctx.fillText(level, 470, 180);

    ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await loadImage(target.displayAvatarURL({ format: "jpg" }));
    ctx.drawImage(avatar, 40, 40, 250, 250);

    const attachment = new MessageAttachment(canvas.toBuffer(), "rank.png");
    message.channel.send(attachment)
    }
}