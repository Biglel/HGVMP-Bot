require('dotenv').config();
const { HGVMP_TOKEN, HGVMP_PREFIX, OWNERS, HGVMP_REQUEST_CHANNEL, INVITE } = process.env;
const path = require('path');
const Client = require('./structures/Client');
const client = new Client({
	commandPrefix: HGVMP_PREFIX,
	owner: OWNERS.split(','),
	disableEveryone: true,
	disabledEvents: ['TYPING_START']
});
const activities = require('./assets/json/activity');
const ordinal = require('ordinal');
const { RichEmbed } = require('discord.js');
let reactmsgid;

/*
	Config because .env doesnt allow arrays :(
*/

const requestRoles = [["571092133398708224", "😭"]]

client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerGroups([
		['avatar-edit', 'Avatar Editing'],
		['games', 'Games'],
		['util', 'Utility'],
		['info', 'Discord Information'],
		['custom', 'Custom'],
		['moderation', 'Moderation']
	])
	.registerDefaultCommands({
		help: false,
		ping: false,
		prefix: false,
		commandState: false,
		unknownCommand: false
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));
	
client.on('ready', () => {
	client.logger.info(`[READY] Logged in as ${client.user.tag}! ID: ${client.user.id}`);
	client.setInterval(() => {
		const activity = activities[Math.floor(Math.random() * activities.length)];
		client.user.setActivity(activity.text, { type: activity.type });
	}, 60000);

	let reactchl = client.guilds.find(guild => guild.id === '411278072558649354')
		.channels.find(channel => channel.id === HGVMP_REQUEST_CHANNEL);

	reactchl.fetchMessages().then(msgs => msgs.deleteAll());

	const embed = new RichEmbed()
		.setColor('RANDOM')
		.setTitle('Claim Language')
		.setDescription('Click one of the flags below to claim your language role!');
	
	reactchl.send({ embed }).then(msg => {
		requestRoles.forEach(val => msg.react(val[1]));
		reactmsg = msg;
	})
});

client.on("messageReactionAdd", (reaction, user) => {
	if (user.bot) return;
	if (reaction.message.id != reactmsg.id) return;
	requestRoles.forEach(arrrole => {
		if (reaction.emoji.name == arrrole[1]) 
			reaction.message.guild.fetchMember(user).then(member => {
				if (!member.roles.find(role => role.id == arrrole[0]))
					member.addRole(arrrole[0]).then(member => {
						let embed = new RichEmbed()
							.setColor('RANDOM')
							.setTitle('Added Role!')
							.setDescription(`Added the role ${member.roles.find(role => role.id == arrrole[0]).name} to ${member.user.username}`);

						reactmsg.channel.send(embed).then(msg => setTimeout(() => msg.delete(), 10000));
					});
			}).catch(console.error);
	});
});

client.on("messageReactionRemove", (reaction, user) => {
	if (user.bot) return;
	if (reaction.message.id != reactmsg.id) return;
	requestRoles.forEach(arrrole => {
		if (reaction.emoji.name == arrrole[1]) 
			reaction.message.guild.fetchMember(user).then(member => {
				if (member.roles.find(role => role.id == arrrole[0]))
					member.removeRole(arrrole[0]).then(member => {
						console.log(member)
						let embed = new RichEmbed()
							.setColor('RANDOM')
							.setTitle('Removed Role!')
							.setDescription(`Removed the role ${member.guild.roles.find(role => role.id == arrrole[0]).name} from ${member.user.username}`);

						reactmsg.channel.send(embed).then(msg => setTimeout(() => msg.delete(), 10000));
					});
			}).catch(console.error);
	});
});

client.on('guildMemberAdd', member => {
	console.log(`${member.user.username} has joined the server!`);
	
	let count = member.guild.memberCount;
	count += 1;
	const ordinalCount = ordinal(count);
	
	const welcome = member.guild.channels.find(channel => channel.name === "welcome");
	const rulesChannel = member.guild.channels.find(channel => channel.name === "rules");
	const questionsChannel = member.guild.channels.find(channel => channel.name === "questions");
	
	const embed = new RichEmbed()
		.setColor('RANDOM')
		.setTitle('New Member!')
		.setDescription(
			`Welcome ${member.user.username}, to the ${member.guild.name} Discord server! Please make sure you read ${rulesChannel} before posting, if you have any questions be sure to check out ${questionsChannel}. Enjoy your stay `,
		)
		.setThumbnail(
			member.user.avatarURL || 'https://camo.githubusercontent.com/1d25b77d1fb7e3f24fe2ef0063effe1981cb3f9c/687474703a2f2f6973322e6d7a7374617469632e636f6d2f696d6167652f7468756d622f507572706c65332f76342f65332f39642f32332f65333964323339652d376237612d653362372d633762662d3163313630653937633238632f6d7a6c2e646e6563666b6e702e706e672f30783073732d38352e6a7067',
		)
		.setFooter(
			`You are the ${ordinalCount} member`
		)
		.setTimestamp()
	welcome.send({ embed }).then((message) => {
		message.react("👋")
		const role = message.guild.roles.find(role => role.name === "Trucker");
		member.addRole(role);
	});
});

client.on('disconnect', event => {
	client.logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
	process.exit(0);
});

client.on('error', err => client.logger.error(err));

client.on('warn', warn => client.logger.warn(warn));

client.on('commandError', (command, err) => client.logger.error(`[COMMAND:${command.name}]\n${err.stack}`));

client.login(HGVMP_TOKEN);