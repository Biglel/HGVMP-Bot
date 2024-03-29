const Command = require('../../structures/Command');

module.exports = class IDCommand extends Command {
	constructor(client){
		super(client, {
			name: 'id',
			aliases: ['user-id', 'member-id'],
			group: 'info',
			memberName: 'id',
			description: 'Responds with a user\'s ID.',
			args: [{
				key: 'user',
				prompt: 'Which user do you want the ID of?',
				type: 'user',
				default: msg => msg.author
			}]
		});
	}
	
	run(msg, { user }){
		return msg.say(`${user.username}'s ID is ${user.id}.`);
	}
};