const Command = require('../../structures/Command');

module.exports = class SubscribeCommand extends Command {
	constructor(client){
		super(client, {
			name: 'subscribe',
			aliases: ['notify'],
			group: 'custom',
			memberName: 'subscribe',
			description: 'Subscribes you to a load of wonderful news in the public server.',
			throttling: {
				usages: 1,
				duration: 10
			}
		});
	}
	
	async run(msg, { user }){
		let role = msg.guild.roles.find(r => r.name === 'Subscriber');
		
		if(!role){
			try {
				role = await msg.guild.createRole({
					name: 'Subscriber',
					color: 'YELLOW',
					hoist: false,
					permissions: [],
					position: 1,
					mentionable: true
				});
			} catch (err){
				console.log(err.stack);
			}
		}
		
		if(msg.member.roles.has(role.id)){
			msg.member.removeRole(role);
			msg.delete();
			msg.channel.send(`${msg.author.username} has been removed from the ${role} group.`).then(msg =>
				msg.delete(3000)
			);
		} else {
			msg.member.addRole(role);
			msg.delete();
			msg.channel.send(`${msg.author.username} has been added to the ${role} group`).then(msg => 
				msg.delete(3000)
			);
		}
	}
};