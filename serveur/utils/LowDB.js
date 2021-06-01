const LowDB = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync'); 

class BotList{
	constructor(){
		this.db = {};
	}

	static async create(){
		const service = new BotList();
		const adapter = new FileAsync("./db.json");
		service.db = await LowDB(adapter);
		return service;
	}

	async addBot(nom,cerveau){
		if(nom != undefined && cerveau != undefined){
			this.db.get('bots').push({name: nom,brain: cerveau}).write();
		}else{console.log("error");}
	}


	async removeBot(nom){
		this.db.get('bots').remove(e=>e.name == nom).write();
	}

	getBots(){
		return this.db.get('bots').value();
	}

}

module.exports = BotList;
