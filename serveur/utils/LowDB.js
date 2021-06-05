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
		if (nom !== undefined && cerveau !== undefined){
			this.db.get('bots').push({name: nom, brain: cerveau}).write();
		}else{console.log("error");}
	}

	async removeBot(nom){
		if (nom !== undefined) {
			this.db.get('bots').remove(e => e.name === nom).write();
		}
	}

	async updateBot(nom,cerveau){
		if (nom !== undefined && cerveau !== undefined){
			this.db.get('bots').find({ name: nom }).assign({brain: cerveau}).write();
		}else{console.log("error");}
	}

	getBots(){
		return this.db.get('bots').value();
	}

	getBotbrain(nom){
		if (nom !== undefined){
			let botlist = this.db.get('bots').value();
			for (let i = 0; i < botlist.length; i++){
				if (botlist[i].name === nom){
					return botlist[i].brain;
				}
			}
		}
	}

}

module.exports = BotList;