const read = require("../lib/read.js")

function getTimeLeft(mil) {
	var current = Date.now()
	var left = 86400000-(current-mil)
	
	if ((left/3600)/1000 > 1) return Math.round((left/3600)/1000) +" hours"
	else if ((left/60)/1000 > 1) return Math.round((left/60)/1000) + " minutes"
	else return Math.round(left/1000) +" seconds"
}

module.exports = class Money {
	constructor() {
		this.commands = ["daily", "create", "bal", "donate"]; //Don't add the help command to this list.
	}
	help(message) {
		message.addField("THERE ARE NO COMMANDS", "Well, except for this one."); //continue to add fields
		return message; //send the RichEmbed
	}
	daily(message) {
		if (read.userExists(message.author.id)) {
			if (read.getUser(message.author.id).lastdaily + 86400000 <= Date.now()) {
				var user = read.getUser(message.author.id)
				if (read.getUser(message.author.id).lastdaily+ 86400000*2 <= Date.now()) user.streak = 0
				var amount = getRandomInt(100+(user.streak*20), 200+(user.streak*20))
				user.money += amount
				user.streak++
				user.lastdaily = Date.now()
				read.writeUser(message.author.id, user)
				message.reply("Congratulations! You have earned **$"+amount+"**!")
			}
			else {
				message.reply(`You still have ${getTimeLeft(read.getUser(message.author.id).lastdaily)} left!`)
			}
		}
		else message.reply("Please use the `"+bot.prefix+"create` command to create an account!")
	}
	create(message) {
		if(read.userExists(message.author.id)) return message.reply("You already have an account!")
		var data = {
			money: 300,
			streak: 0,
			lastdaily: Date.now(),
			employed: null,
			order: null,
			orderstatus: null
		}
		read.writeUser(message.author.id, data)
		message.reply("Congratulations! Your account has been created, and you have been given $300 to start out with!")
	}
	bal(message) {
		if (!read.userExists(message.author.id)) return message.reply("Please use the `"+bot.prefix+"create` command to create an account!")
		else {
			var user = read.getUser(message.author.id)
			message.reply("You have **$"+user.money+"**!")
		}
	}
	donate(message) {
		if (!read.userExists(message.author.id)) return message.reply("Please use the `"+bot.prefix+"create` command to create an account!")
		if (message.mentions.users.array().length === 0) return message.reply("Please mention a user to donate to!")
		if (message.content.split(" ").length < 3) return message.reply("Please specify the amount of money to donate!")
		if (isNaN(message.content.split(" ")[2])) return message.reply("Please use the following format to donate:\n`"+bot.prefix+"donate <mention a user> <amount of money(number)>` without using the `<>`")
		var user = read.getUser(message.author.id)
		var donated = message.mentions.users.array()[0]
		var amount = Number(message.content.split(" ")[2])
		if (user.money < amount) return message.reply("You don't have enough money!")
		if (!read.userExists(donated.id)) return message.reply("That user doesn't have an account yet!")
		user.money-=amount
		var donatedData = read.getUser(donated.id)
		donatedData.money+=amount
		read.writeUser(message.author.id, user)
		read.writeUser(donated.id, donatedData)
	}
}