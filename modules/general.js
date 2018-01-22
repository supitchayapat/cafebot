module.exports = class General {
	constructor() {
		this.commands = ["invite", "server"]; //Don't add the help command to this list.
	}
	help(message) {
		message.addField(bot.prefix+"invite", "Well, except for this one.")
		.addField(bot.prefix+"server", "Invite to the CafeBot server.")
		return message; //send the RichEmbed
	}
	invite(message) {
		message.reply("Invite the bot by using this link!:\n"+bot.invite)
	}
	server(message) {
		message.reply("Join the CafeBot server!\n"+bot.server)
	}
}