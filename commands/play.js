require("module-alias/register");
require("dotenv").config();

const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");
const Discord = require("discord.js");
const color = require("@colorpaletes/colors.json")

const queue = new Map();

const name = "play"
const accessableby = ["Member"]
const aliases = ["skip", "stop", "p", "leave", "queue", "q", "list", "l"]
const response = "MUSIC_ROOM_NAME";

function song_embed(embed, song) {
    embed.setTitle("🎶 Playing 🎶")
        .addFields({ name: "Name:", value: `[${song.title}](${song.url})` }, { name: "Author:", value: `[${song.author.name}](${song.author.url})` }, { name: "Views:", value: song.views }, { name: "Duration:", value: song.duration }, { name: "Description:", value: song.description })
        .setImage(song.thumbnail)
    return embed
}

const video_finder = async(query) => {
    const videoResult = await ytSearch(query);
    return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
}

module.exports.run = async(message, args, botconfig, user_lang_role) => {
    let cmd = message.content.split(" ")[0].toLowerCase().slice(botconfig.filter(config => config.name == "PREFIX")[0].value.length)
    let user_language = await require("@events/language_load").languages.get(user_lang_role).get("PLAY")
    const voice_channel = message.member.voice.channel;
    if (!voice_channel) return require("@handlers/find_channel_by_name").run({ zprava: user_language.NO_VOICE_CH, roomname: botconfig.find(config => config.name == response).value, message: message });
    const permissions = voice_channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) return require("@handlers/find_channel_by_name").run({ zprava: user_language.NO_PREM, roomname: botconfig.find(config => config.name == response).value, message: message });
    if (!permissions.has("SPEAK")) return require("@handlers/find_channel_by_name").run({ zprava: user_language.NO_PREM, roomname: botconfig.find(config => config.name == response).value, message: message });

    const server_queue = queue.get(message.guild.id);

    if (cmd == "play" || cmd == "p") {
        if (!args.length) return require("@handlers/find_channel_by_name").run({ zprava: user_language.NO_ARGS, roomname: botconfig.find(config => config.name == response).value, message: message });
        let song = {};

        if (ytdl.validateURL(args[0])) {
            const song_info = await ytdl.getInfo(args[0]);
            const video = await video_finder(song_info.videoDetails.title);
            if (video) {
                song = { title: video.title, url: video.url, duration: video.duration.timestamp, thumbnail: video.thumbnail, author: video.author, description: video.description, views: video.views, requested: message.author.username + "#" + message.author.discriminator }
            } else {
                require("@handlers/find_channel_by_name").run({ zprava: user_language.ERROR_FINDING, roomname: botconfig.find(config => config.name == response).value, message: message });
            }
        } else {
            const video = await video_finder(args.join(" "));
            if (video) {
                song = { title: video.title, url: video.url, duration: video.duration.timestamp, thumbnail: video.thumbnail, author: video.author, description: video.description, views: video.views, requested: message.author.username + "#" + message.author.discriminator }
            } else {
                require("@handlers/find_channel_by_name").run({ zprava: user_language.ERROR_FINDING, roomname: botconfig.find(config => config.name == response).value, message: message });
            }
        }

        if (!server_queue) {

            const queue_constructor = {
                voice_channel: voice_channel,
                text_channel: message.channel,
                connection: null,
                songs: []
            }

            queue.set(message.guild.id, queue_constructor);
            queue_constructor.songs.push(song);

            try {
                const connection = await voice_channel.join();
                queue_constructor.connection = connection;
                video_player(message.guild, queue_constructor.songs[0], botconfig, message);
            } catch (err) {
                queue.delete(message.guild.id);
                require("@handlers/find_channel_by_name").run({ zprava: user_language.ERROR_CONECTING, roomname: botconfig.find(config => config.name == response).value, message: message });
                throw err;
            }
        } else {
            server_queue.songs.push(song);
            require("@handlers/find_channel_by_name").run({ zprava: user_language.ADDED_TO_QUEUE.replace("&SONG", song.title), roomname: botconfig.find(config => config.name == response).value, message: message });
        }
    } else if (cmd === 'skip') skip_song(message, server_queue);
    else if (cmd === 'stop' || cmd == "leave" || cmd == "l") stop_song(message, server_queue);
    else if (cmd === 'queue' || cmd == "q" || cmd == "list") show_queue(message, server_queue, botconfig);

}

const video_player = async(guild, song, botconfig, message) => {
    const song_queue = queue.get(guild.id);
    //console.log("Video player")
    //console.log(song)
    if (!song) {
        song_queue.voice_channel.leave();
        song_queue.connection.disconnect();
        queue.delete(guild.id);
        return;
    }

    const stream = ytdl(song.url, { filter: "audioonly" });
    const dispatcher = await song_queue.connection.play(stream, { seek: 0, volume: 0.5 })
    dispatcher.on("end", () => {
        song_queue.songs.shift();
        video_player(guild, song_queue.songs[0], botconfig, message);
    });
    var embed = new Discord.MessageEmbed()
    require("@handlers/find_channel_by_name").run({ zprava: song_embed(embed, song), roomname: botconfig.find(config => config.name == response).value, message: message });
}

const skip_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    if (!server_queue) {
        return message.channel.send(`There are no songs in queue 😔`);
    }
    server_queue.connection.dispatcher.end();
}

const stop_song = (message, server_queue) => {
    if (!message.member.voice.channel) return message.channel.send('You need to be in a channel to execute this command!');
    server_queue.songs = [];
    server_queue.connection.dispatcher.end();
}

const show_queue = (message, server_queue, botconfig) => {
    if (!server_queue) return
    let songs = server_queue.songs
    let song_list_queue = []
        //console.log(server_queue)
    var embed = new Discord.MessageEmbed()
    embed.setTitle("**Queue**")
    embed.setColor(color.blue)
    songs.forEach((song, i) => {
        if (i == 0) {
            song_list_queue.push(`__Now Playing:__`)
            song_list_queue.push(`[${song.title}](${song.url}) | ` + '`' + `${song.duration} Requested by: ${song.requested}` + '`')
            song_list_queue.push(``)
        } else if (i == 1) {
            song_list_queue.push(`__Up Next:__`)
            song_list_queue.push('`' + i + '.`' + ` [${song.title}](${song.url}) | ` + '`' + `${song.duration} Requested by: ${song.requested}` + '`')
            song_list_queue.push(``)
        } else {
            song_list_queue.push('`' + i + '.`' + ` [${song.title}](${song.url}) | ` + '`' + `${song.duration} Requested by: ${song.requested}` + '`')
            song_list_queue.push(``)
        }
    });
    song_list_queue.push(`**${songs.length - 1} songs in queue**`)
    embed.setDescription(song_list_queue.join("\n"))

    require("@handlers/find_channel_by_name").run({ zprava: embed, roomname: botconfig.find(config => config.name == response).value, message: message });
}

module.exports.help = {
    name: name,
    accessableby: accessableby,
    aliases: aliases
}