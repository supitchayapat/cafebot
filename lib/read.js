/*
    Functions used for reading/writing data into JSON files
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
const fs = require("fs")

module.exports = {
	readJSON: function(path) {
		return JSON.parse(fs.readFileSync(path));
	},
	writeJSON: function(path, data) {
		fs.writeFileSync(path, JSON.stringify(data));
		return;
	},
	getUser: function(id) {
		return this.readJSON("./data/userdata.json")[id];
	},
	writeUser: function(id, data) {
		var datawrite = this.readJSON("./data/userdata.json");
		datawrite[id] = data;
		this.writeJSON("./data/userdata.json", datawrite);
	},
	userExists: function(id) {
		if (Object.getOwnPropertyNames(this.readJSON("./data/userdata.json")).includes(id)) return true;
		else return false;
	},
	orderExists: function(id) {
		var array = ["ordered", "preparing", "delivery"]
		for (var i=0;i<array.length;i++) {
			if (typeof this.readJSON("./data/"+array[i]+".json")[id] !== "undefined") return true
		}
		return false;
	},
	getOrder: function(id) {
		var array = ["ordered", "preparing", "delivery"]
		for (var i=0;i<array.length;i++) {
			if (typeof this.readJSON("./data/"+array[i]+".json")[id] !== "undefined") {
				return this.readJSON("./data/"+array[i]+".json")[id]
			}
		}
		return;
	},
	writeOrder: function(id, data, num) {
		var array = ["ordered", "preparing", "delivery"]
		var place = array[num]
		var datawrite = this.readJSON("./data/"+place+".json")
		datawrite[id] = data
		this.writeJSON("./data/"+place+".json", datawrite)
	}
}