const Command = require('../../structures/Command');
const moment = require('moment');
const { RichEmbed } = require('discord.js');
const { trimArray } = require('../../util/Util');
const activities = {
	PLAYING: 'Playing',
	STREAMING: 'Streaming',
	WATCHING: 'Watching',
	LISTENING: 'Listening to'
};
const fs = require('fs');
const warns = JSON.parse(fs.readFileSync('./assets/json/warnings.json', 'utf8'));

module.exports = class UserCommand extends Command {
	constructor(client){
		super(client, {
			name: 'user',
			aliases: ['user-info', 'member', 'member-info'],
			group: 'info',
			memberName: 'user',
			description: 'Responds with detailed information on a user.',
			clientPermissions: ['EMBED_LINKS'],
			args: [{
				key: 'user',
				prompt: 'Which user would you like to get information on?',
				type: 'user',
				default: msg => msg.author
			}]
		});
	}
	
	async run(msg, { user }) {
		const embed = new RichEmbed()
			.setThumbnail(user.displayAvatarURL)
			.addField('❯ Name', user.tag, true)
			.addField('❯ ID', user.id, true)
			.addField('❯ Discord Join Date', moment.utc(user.createdAt).format('MM/DD/YYYY h:mm A'), true)
			.addField('❯ Bot?', user.bot ? 'Yes' : 'No', true);
		if (msg.channel.type === 'text') {
			const member = await msg.guild.fetchMember(user.id);
			// If the user doesn't already exist, create a ghost entry
			if (!warns[member.id]) warns[member.id] = {
				warns: 0
			};
			const warnLevel = warns[member.id].warns;
			const roles = member.roles
				.filter(role => role.id !== msg.guild.defaultRole.id)
				.sort((a, b) => b.position - a.position)
				.map(role => role.name);
			embed
				.setColor(member.displayHexColor)
				.setDescription(member.presence.activity
					? `${activities[member.presence.activity.type]} **${member.presence.activity.name}**`
					: '')
				.addField('❯ Server Join Date', moment.utc(member.joinedAt).format('MM/DD/YYYY h:mm A'), true)
				.addField('❯ Nickname', member.nickname || 'None', true)
				.addField('❯ Hoist Role', member.roles.hoist ? member.roles.hoist.name : 'None', true)
				.addField('❯ Warnings', `${warnLevel}` || 'None', true)
				.addField(`❯ Roles (${roles.length})`, roles.length ? trimArray(roles, 10).join(', ') : 'None');
		}
		return msg.embed(embed);
	}
};