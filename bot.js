global.Discord = require("discord.js")
global.client = new Discord.Client()
const commandLineArgs = require('command-line-args')
global.fs = require("fs")
global.chalk = require("chalk")

const optionDefinitions = [{
	name: 'token',
	alias: 't',
	type: String
}]
const options = commandLineArgs(optionDefinitions)

global.bot = {
	modules: {},
	prefix: "{}",
	blacklist: [],
	moduleList: [],
	helpList: [],
	server: "https://discord.gg/fPWMWn3",
	invite: "https://discordapp.com/oauth2/authorize?client_id=403744097417953282&scope=bot&permissions=403041361"
}

global.getRandomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

if (typeof options.token === "undefined") return console.log("Please pass a token through the -token or -t argument")

fs.readdir("./modules/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0) {
        console.log("No modules to load!");
    }

    console.log(`Loading ${jsfiles.length} modules!`);

    jsfiles.forEach((f, i) => {
        let module = require(`./modules/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        bot.modules[f] = new module(client)
        bot.moduleList.push(f)
        if (typeof bot.modules[f].help !== "undefined") bot.helpList.push(f)
    });
});

client.on("ready", ()=>{
	client.user.setActivity(`Use ${bot.prefix}help!`)
	console.log("Ready!")
})

client.on("message", async msg=>{
	if(msg.content.toLowerCase().startsWith(`${bot.prefix}ping`)) {
		const message = await msg.channel.send("x ms");
		return message.edit(message.createdTimestamp - msg.createdTimestamp + " ms");
	}
})

client.on("guildCreate", (guild)=>{
	// guild.defaultChannel.send(`**Hello there, and thank you for adding me to your server!**\nThis bot, while primarily focused around the Pockey.io game, does have additional fun commands and such, all of which can be found using the \`$help\` command!\n Please enjoy the bot, and if you have any questions, feel free to join the official Pockey.io Discord guild and let one of us bot developers know! (LegusX, BlueStar, NightmaresDev)\n${bot.discord}`);
})

client.login(options.token)