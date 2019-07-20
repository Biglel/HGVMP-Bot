const { CommandoClient } = require('discord.js-commando');
const winston = require('winston');
const PokemonStore = require('./pokemon/PokemonStore');

module.exports = class HGVMPClient extends CommandoClient {
	constructor(options){
		super(options);
		
		this.logger = winston.createLogger({
			transports: [ new winston.transports.Console()],
			format: winston.format.combine(
				winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
				winston.format.printf(log => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`)
			)
		});
		this.pokemon = new PokemonStore();
	}
};