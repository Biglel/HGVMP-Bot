const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { formatNumber } = require('../../util/Util');
const { version, dependencies } = require('../../package');

module.exports = class InfoCommand extends Command {
	constructor(client){
		super(client, {
			name: 'info',
			aliases: ['stats'],
			group: 'util',
			memberName: 'info',
			description: 'Shows you the fancy stuff about the bot.',
			guarded: true,
			clientPermissions: ['EMBED_LINKS']
		});
	}
	
	run(msg){
		const embed = new RichEmbed()
			.setColor('#5599FF')
			.setFooter('©2019 Inclusive#0001 (As well as dragonfire535#8081 for providing insane commands!)')
			.addField('❯ Servers', formatNumber(this.client.guilds.size), true)
			.addField('❯ Commands', formatNumber(this.client.registry.commands.size), true)
			.addField('❯ Memory Usage', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, true)
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('hh:mm:ss', { trim: false }), true)
			.addField('❯ Version', `v${version}`, true)
			.addField('❯ Node Version', process.version, true)
			.addField('❯ Dependencies', this.parseDependencies());
		return msg.embed(embed);
	}
	
	parseDependencies(){
		return Object.entries(dependencies).map(dep => {
			if (dep[1].startsWith('github:')) {
				const repo = dep[1].replace('github:', '').split('/');
				return `[${dep[0]}](https://github.com/${repo[0]}/${repo[1].replace(/#.+/, '')})`;
			}
			return `[${dep[0]}](https://npmjs.com/${dep[0]})`;
		}).join(', ');
	}
};