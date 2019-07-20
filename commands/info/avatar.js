const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');

module.exports = class AvatarCommand extends Command {
	constructor(client){
		super(client, {
			name: 'avatar',
			aliases: ['profile-picture', 'profile-pic', 'pfp'],
			group: 'info',
			memberName: 'avatar',
			description: 'Responds with a user\'s avatar',
			args: [
				{
					key: 'user',
					prompt: 'So... which user?',
					type: 'user',
					default: msg => msg.author
				}
			]
		});
	}
	
	run(msg, { user }){
		const formats = ['webp', 'png', 'jpg'];
		const format = user.avatar && user.avatar.startsWith('a_') ? 'gif' : 'png';
		if (format === 'gif') formats.push('gif');
		const embed = new RichEmbed()
			.setTitle(user.tag)
			.setDescription(
				formats.map(fmt => `[${fmt.toUpperCase()}](${user.displayAvatarURL})`).join(' | ')
			)
			.setImage(user.displayAvatarURL)
			.setColor(0x00AE86);
		return msg.embed(embed);
	}
};