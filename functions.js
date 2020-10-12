const fs = require("fs");
const { registerFont } = require("canvas");

module.exports = (bot) => {

    fs.readdir("./events/", (err, files) => {

        if (err) console.log(err);

        let jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length <= 0) {
            console.log("There isn't any events to load!");
            return;
        }
        console.log(`Loading ${jsfile.length} events...`)
        jsfile.forEach((f, i) => {
            let name = f.toLocaleString().split(".")
            let pull = require(`./events/${f}`);
            console.log(`${i + 1}: ${name[0]} loaded!`)
        });
    });

    fs.readdir("./commands/", (err, files) => {

        if (err) console.log(err);

        let jsfile = files.filter(f => f.split(".").pop() === "js");
        if (jsfile.length <= 0) {
            console.log("There isn't any command to load!");
            return;
        }
        console.log(`Loading ${jsfile.length} commands...`)
        jsfile.forEach((f, i) => {
            let name = f.toLocaleString().split(".")
            let pull = require(`./commands/${f}`);
            bot.commands.set(pull.help.name, pull);
            pull.help.aliases.forEach(alias => {
                bot.aliases.set(alias, pull.help.name)
                console.log(`${i + 1}: ${name[0]} loaded!`)
            });
        });
    });

    fs.readdir("./handlers/", (err, files1) => {
        let fileslength = files1.length
        for (let h = 0; h < fileslength; h++) {
            fs.readdir(`./handlers/${files1[h]}`, (err, files) => {

                if (err) console.log(err);

                let jsfile = files.filter(f => f.split(".").pop() === "js");
                if (jsfile.length <= 0) {
                    console.log("There isn't any function to load!");
                    return;
                }
                console.log(`Loading ${jsfile.length} handlers from ${files1[h]}...`)
                jsfile.forEach((f, i) => {
                    let name = f.toLocaleString().split(".")
                    console.log(`${i + 1}: ${name[0]} loaded!`)
                });
            });
        }
    })

    fs.readdir("./fonts/", (err, files) => {

        if (err) console.log(err);

        let jsfile = files.filter(f => f.split(".").pop() === "ttf");
        if (jsfile.length <= 0) {
            console.log("There isn't any fonts to load!");
            return;
        }
        console.log(`Loading ${jsfile.length} fonts...`)
        jsfile.forEach((f, i) => {
            let name = f.toLocaleString().split(".")
            console.log(`${i + 1}: ${name[0]} loaded!`)
            registerFont(`./fonts/${f}`, { family: `${name[0]}` })
        });
    });
};
