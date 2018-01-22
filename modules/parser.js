/*
    Core of the bot
    Copyright (C) 2018 LegusX

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
global.getRandomColor = function() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

const number = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine"
}
function format(text) {
	if(!isNaN(text.split("")[0])) {
		text = text.split("")
		text[0] = number[text[0]]
		text = text.join("")
	}
	return text;
}

module.exports = class Parser {
	constructor() {
		client.on("message", (message)=>{
			//Do not put any commands in this function other than the ones already here.
			if (message.channel.type !== "text" || !message.content.toLowerCase().startsWith(bot.prefix) || message.author === client.user) return;
			var msg = message
			if (msg.content.startsWith(bot.prefix + "help")) {
				if (msg.content.replace(bot.prefix + "help") === "" || !bot.helpList.includes(msg.content.replace(bot.prefix + "help ", "").toLowerCase() + ".js")) {
					var sectionBlock = "▫" + bot.helpList[0].split("")[0].toUpperCase() + bot.helpList[0].substr(1).replace(".js", "")
					for (var i = 1; i < bot.helpList.length; i++) {
						sectionBlock += "\n▫" + bot.helpList[i].split("")[0].toUpperCase() + bot.helpList[i].substr(1).replace(".js", "")
					}
					var helpMessage = new Discord.RichEmbed()
						.setTitle("**CafeBot Help**")
						.setDescription("Use `$help <section>` for more info about each section")
						.addField("Sections", sectionBlock)
						.setColor(getRandomColor())
						.setThumbnail(client.user.avatarURL)
					msg.channel.send(helpMessage)
					return;
				} else {
					var name = msg.content.replace(bot.prefix + "help ", "").split("")[0].toUpperCase() + msg.content.replace(bot.prefix + "help "+msg.content.replace(bot.prefix + "help ", "").split("")[0], "")
					var helpMessage = new Discord.RichEmbed()
						.setTitle("HordesBot " + name + " Help")
						.setColor(getRandomColor())
						.setThumbnail(client.user.avatarURL)
					msg.channel.send(bot.modules[msg.content.replace(bot.prefix + "help ", "").toLowerCase() + ".js"].help(helpMessage))
				}
			}
			
			var command = format(message.content.split(" ")[0].replace(bot.prefix, "").toLowerCase())
			for(var i=0;i<bot.moduleList.length;i++) {
				if(typeof bot.modules[bot.moduleList[i]].commands === "undefined") return;
				if(bot.modules[bot.moduleList[i]].commands.includes(command)) {
					bot.modules[bot.moduleList[i]][command](message);
				}
			}
		});
	}
}