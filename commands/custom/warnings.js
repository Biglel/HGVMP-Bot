const Command = require('../../structures/Command');
const fs = require('fs');
const warns = JSON.parse(fs.readFileSync('./assets/json/warnings.json', 'utf8'));

module.exports = class WarningsCommand extends Command {
	constructor(client){
		super(client, {
			name: 'warnings',
			group: 'custom',
			memberName: 'warnings',
			description: 'Shows the warnings of a user/yourself?',
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 10
			},
			args: [
					{
						key: 'wUser',
						prompt: 'What is the username of the user you want to see the warnings for?',
						type: 'user',
						default: msg => msg.author
					},
				]
		});
	};
	
	async run(msg, { wUser }) {
		// If the user doesn't already exist, create a ghost entry
		if (!warns[wUser.id]) warns[wUser.id] = {
			warns: 0
		};
		
		// Set the constant to how many warnings the user has.
		const warnLevel = warns[wUser.id].warns;
		
		// Tell the user how many warnings they currently have
		msg.channel.send(`${msg.author.username}, you have ${warnLevel} warnings.`);
	};
};