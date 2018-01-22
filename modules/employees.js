/*
    Holds commands meant for employees
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

const times = {
	coffee: 0.1
}
module.exports = class Preparation {
	constructor() {
		this.commands = ["prepare","deliver"]; //Don't add the help command to this list.
	}
	help(message) {
		message.addField("THERE ARE NO COMMANDS", "Well, except for this one."); //continue to add fields
		return message; //send the RichEmbed
	}
	prepare(message) {
		if (!message.member.roles.has("403729547842945026")) return;
		if (message.content.split(" ").length === 1) return message.reply("Please specify an ID, type, and image link!!")
		if (message.content.split(" ").length === 2) return message.reply("Please specify a type and image link!")
		if (message.content.split(" ").length === 3) return message.reply("Please specify an image link!")
		if (!read.orderExists(message.content.split(" ")[1])) return message.reply("That is not a valid order ID!")
		if (!Object.getOwnPropertyNames(times).includes(message.content.toLowerCase().split(" ")[2])) return message.reply("That is not a valid order type!")
		if (!message.content.split(" ")[3].toLowerCase().startsWith("http")) return message.reply("You need to specify an image link!")
		else {
			var ID = message.content.split(" ")[1]
			var type = message.content.toLowerCase().split(" ")[2]
			var image = message.content.split(" ")[3]
			var order = read.getOrder(ID)
			client.fetchUser(order.customer).then(function(user){
				var data = read.readJSON("./data/ordered.json");
				delete data[ID];
				read.writeJSON("./data/ordered.json", data);
				order.orderstatus = "preparing"
				order.prepfinish = Date.now+times[type]*60*1000
				order.image = image
				order.chef = message.author.id
				read.writeOrder(ID, order, 1)
				message.reply("You have started to prepare order: "+ID)
				setTimeout(function(){
					var order = read.getOrder(ID)
					order.prepfinish = null
					var user = client.users.get(order.customer)
					var data = read.readJSON("./data/preparing.json")
					delete data[ID]
					read.writeJSON("./data/preparing.json", data)
					read.writeOrder(ID, order, 2)
					user.send("Your order has finished preparing and will be delivered shortly!")
					var embed = new Discord.RichEmbed()
					.setTitle("Delivery Ready!")
					.setAuthor(user.username, user.avatarURL)
					.addField("Order ID", ID, true)
					.addField("Customer", user.username, true)
					.addField("Order", order.order, true)
					.setFooter("Use `"+bot.prefix+"deliver "+ID+"` to deliver this order!")
					.setColor(getRandomColor())
					client.channels.get("403732445570007043").send(embed)
				}, times[type]*60*1000, ID)
			})
		}
	}
	deliver(message) {
		if (!message.member.roles.has("403729765909004288")) return;
		if (!read.orderExists(message.content.split(" ")[1])) return message.reply("That order doesn't exist!")
		else {
			var order = read.getOrder(message.content.split(" ")[1])
			client.fetchUser(order.customer).then(function(user){
				var embed = new Discord.RichEmbed()
				.setTitle("Delivering item!")
				.setColor(getRandomColor())
				.addField("Customer", user, true)
				.addField("Order", order.order, true)
				.addField("Chef", "<@"+order.chef+">", true)
				.addField("Image Link", order.image, true)
				message.author.send(embed)
				var channel = client.channels.get(order.channel)
				channel.createInvite({temporary:true, maxUses: 1}).then(function(invite){
					message.author.send("Invite to server: "+invite.url)
					user.send("Your order is about to be delivered!")
					var data = read.readJSON("./data/delivery.json")
					delete data[order.id]
					read.writeJSON("./data/delivery.json", data)
				})
			})
		}
	}
}