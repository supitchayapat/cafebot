/*
    Commands that don't fit anywhere else, really
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