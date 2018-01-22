/*
    Commands related to ordering things
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
const read = require("../lib/read.js")
global.menu = {
	coffee: {
		"latte": 10
	}
}
var ordering = []

function cap(text) {
	return text.split("")[0].toUpperCase()+text.replace(text.split("")[0], "")
}

function code() {
	var alpha = "abcdefghijklmnopqrstuvwkxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var length = 4
	var code = ""
	for (var i=0;i<length;i++) {
		code += alpha[getRandomInt(0, alpha.length)]
	}
	return code
	
}

function getTimeLeft(left) {
	if ((left/3600)/1000 > 1) return Math.round((left/3600)/1000) +" hours"
	else if ((left/60)/1000 > 1) return Math.round((left/60)/1000) + " minutes"
	else if (left/1000 >0) return Math.round(left/1000) +" seconds"
	else return "finished"
}

module.exports = class Ordering {
	constructor() {
		this.commands = ["menu", "myorder", "delete"];
	}
	help(message) {
		message.addField("THERE ARE NO COMMANDS", "Well, except for this one."); //continue to add fields
		return message; //send the RichEmbed
	}
	menu(message) {
		if (ordering.includes(message.author.id)) return;
		if (!read.userExists(message.author.id)) return message.reply("Please use the `"+bot.prefix+"create` command to create an account!")
		if (read.getUser(message.author.id).order !== null) return message.reply("You've already ordered something!")
		ordering.push(message.author.id)
		var embed = new Discord.RichEmbed()
		.setTitle("CafeBot Menu")
		.setColor(getRandomColor())
		var names = Object.getOwnPropertyNames(menu)
		var list = cap(names[0])
		for (var i=1;i<names.length;i++) {
			list += "\n"+cap(names[i])
		}
		embed.addField("Just say the name of the section of the menu you wish to order from", list)
		message.channel.send(embed)
		var filter = msg => msg.author.id === message.author.id
		message.channel.awaitMessages(filter, {
			time: 60000,
			maxMatches: 1
		}).then(function(r){
			var message = r.first()
			if (message.content.toLowerCase().startsWith(bot.prefix+"order ")) message.content.toLowerCase().replace(bot.prefix+"order ", "")
			else message.content = message.content.toLowerCase()
			if (!Object.getOwnPropertyNames(menu).includes(message.content)) return message.reply("That is not a section of the menu!"+message.content)
			var menuType = menu[message.content];
			var typeMenu = message.content
			var embed = new Discord.RichEmbed()
			.setTitle(cap(message.content)+" Menu")
			.setColor(getRandomColor())
			var names = Object.getOwnPropertyNames(menuType)
			var list = "**"+cap(names[0])+"**: $"+menuType[names[0]]
			for (var i=1;i<names.length;i++) {
				list += "\n**"+cap(names[i])+"**: $"+menuType[names[i]]
			}
			embed.addField("Just say the name of the thing you wish to order!", list)
			message.channel.send(embed)
			message.channel.awaitMessages(filter, {
				time: 60000,
				maxMatches: 1
			}).then(function(r){
				var message = r.first()
				if (message.content.toLowerCase().startsWith(bot.prefix+"order ")) message.content.toLowerCase().replace(bot.prefix+"order ", "")
				else message.content = message.content.toLowerCase()
				if (!Object.getOwnPropertyNames(menuType).includes(message.content)) return message.reply("That isn't on the menu!")
				if (menuType[message.content] > read.getUser(message.author.id).money) return message.reply("You can't afford that!")
				message.reply("Placing order...").then(function(msg){
					var ID = code()
					var data = {
						customer: message.author.id,
						order: message.content,
						prepfinish: null,
						id: ID,
						type: typeMenu,
						server: message.guild.id,
						channel: message.channel.id,
						image: null,
						chef: null
					}
					read.writeOrder(ID, data, 0)
					var embed = new Discord.RichEmbed()
					.setTitle("New order!")
					.setAuthor(message.author.username, message.author.avatarURL)
					.addField("Order", cap(message.content), true)
					.addField("Type", cap(typeMenu), true)
					.addField("Order ID", ID, true)
					.setColor(getRandomColor())
					.setFooter(`Use \`${bot.prefix}prepare ${ID} ${typeMenu} <image link>\` to prepare this item!`);
					client.channels.get("403732305933238282").send(embed)
					var userData = read.getUser(message.author.id)
					userData.money-=menuType[message.content]
					userData.order = ID
					userData.orderstatus = "ordered"
					read.writeUser(message.author.id, userData)
					msg.edit("Order placed! Please wait a few minutes as your food is prepared and delivered to you!")
				})
			}).catch(function(e){
				console.log(e)
				message.reply("Order canceled! (due to taking longer than 60 seconds)")
			})
		}).catch(function(){
			message.reply("Order canceled! (due to taking longer than 60 seconds)")
		})
	}
	myorder(message) {
		if (!read.userExists(message.author.id)) return message.reply("Please use the `"+bot.prefix+"create` command to create an account!")
		if (read.getUser(message.author.id).order === null) return message.reply("You don't currently have an order!\n**Hint:** Use the `"+bot.prefix+"order` command to order something!")
		var user = read.getUser(message.author.id)
		var ID = user.order
		var status = user.orderstatus
		var order = read.getOrder(ID)
		var embed = new Discord.RichEmbed()
		.setAuthor(message.author.username, message.author.avatarURL)
		.setTitle("Order status")
		.addField("Order", order.order, true)
		.addField("Status", status, true)
		.setFooter("Your order ID is "+ID)
		.setColor(getRandomColor())
		if (order.prepfinish === null) return message.channel.send(embed)
		var time = getTimeLeft(order.prepfinish-Date.now())
		embed.addField("Time Left", time, true)
		message.channel.send(embed)
	}
	delete(message) {
		var user = read.getUser(message.author.id)
		user.order = null
		read.writeUser(message.author.id, user)
		message.reply("order deleted!")
	}
}