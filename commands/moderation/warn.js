const Command = require('../../structures/Command');
const { RichEmbed } = require('discord.js');
const fs = require('fs');
const ms = require('ms');

const warns = JSON.parse(fs.readFileSync('./assets/json/warnings.json', 'utf8'));

module.exports = class WarnCommand extends Command {
	constructor(client){
		super(client, {
			name: 'warn',
			group: 'moderation',
			memberName: 'warn',
			description: 'Warns a user....?',
			guildOnly: true,
			throttling: {
				usages: 1,
				duration: 10
			},
			userPermissions: ['KICK_MEMBERS'],
			args: [
					{
						key: 'chosenUser',
						prompt: 'What is the user being warned for?',
						type: 'string',
						default: msg => msg.guild.member(msg.mentions.users.first())
					},
					{
						key: 'wReason',
						prompt: 'What is the user being warned for?',
						type: 'string',
						default: ''
					}
				]
		});
	};
	
	async run(msg, { chosenUser, wReason }) {
		// Get the first mention from the message
		const wUser = msg.guild.member(msg.mentions.users.first()) || msg.guild.members.get(chosenUser);
		// Set a constant for the user stated in warn, but use this for the embed.
		const user = msg.mentions.users.first();
		// Check if the user exists.
		if(!wUser) return msg.channel.send(`I've checked my database....no results!`);
		// Check if the user entered is the HGVMP Dispatch bot.
		if(wUser.id === '476106884462673920') return msg.channel.send(`Excuse me, what you doin?`);
		// Check if a reason has been entered, if no reason = show this output.
		if(!wReason){
			msg.channel.send(`['ERROR'] You must supply a reason when warning a user`);
			return;
		};
		
		// Create a template for the user in the JSON File.
		if(!warns[wUser.id])
			warns[wUser.id] = {
				username: wUser.username,
				warns: 0
			};
			
			// Increase the warning count
			warns[wUser.id].warns += 1;
			
		// Create the embed to send to the moderation channel.
		const warnEmbed = new RichEmbed()
			.setTitle(`User has been given a warning`)
			.setDescription(`This is an automatically generated message`)
			.setThumbnail(user.avatarURL || 'https://camo.githubusercontent.com/1d25b77d1fb7e3f24fe2ef0063effe1981cb3f9c/687474703a2f2f6973322e6d7a7374617469632e636f6d2f696d6167652f7468756d622f507572706c65332f76342f65332f39642f32332f65333964323339652d376237612d653362372d633762662d3163313630653937633238632f6d7a6c2e646e6563666b6e702e706e672f30783073732d38352e6a7067')
			.setColor('#FFFF00')
			.setTimestamp()
			.setFooter('A copy of the reason has been sent to the user')
			.addField('User:', `${user.tag} (${warns[wUser.id].warns})`, true)
			.addField('Moderator:', `${msg.author.tag}`, true)
			.addField('Reason:', `${wReason}`);
		
		// Set the channel we use to send the above embed.
		const warnChannel = msg.guild.channels.find(c => c.name === 'moderation-log');
		// Check if the channel exists
		if(!warnChannel) return msg.channel.send(`I can't find this channel`);
		
		// Send the embed.
		warnChannel.send({ embed: warnEmbed });
		
		// Has the mentioned user reached 3 warnings?
		if(warns[wUser.id].warns === 3){
			// Check for the muted role.
			let muterole = msg.guild.roles.find(r => r.name === 'Muted');
			// If it does not exist, create it.
			if(!muterole){
				try {
					muterole = await msg.guild.createRole({
						name: 'Muted',
						color: 'BLACK',
						hoist: true,
						permissions: [],
						position: 2,
						mentionable: false
					});
					
					// Go through all of our channels, and overwrite the permissions.
					msg.guild.channels.forEach(async (channel, id) => {
						await channel.overwritePermissions(muterole, {
							CHANGE_NICKNAME: false,
							SEND_MESSAGES: false,
							SEND_TTS_MESSAGES: false,
							ADD_REACTIONS: false,
							SPEAK: false,
							USE_VAD: false
						});
					});
				} catch (err){
					console.log(err.stack);
				}
			}
			
			// Set the timer for which will hold until it's over.
			const mutetime = '30m';
			
			// Add the role to the mentioned user, then notify the channel.
			await wUser.addRole(muterole).then(msg.channel.send(`<@${wUser.id}> has been temporarily muted for 30 minutes.`));
			
			// Wait until the duration has ended, and perform the next actions listed below.
			setTimeout(() => {
				// Remove the role
				wUser.removeRole(muterole);
				// Notify the channel
				msg.channel.send(`<@${wUser.id}> has been unmuted.`);
			}, ms(mutetime));
		};
		
		// Has the mentioned user reached 4 warnings?
		if(warns[wUser.id].warns === 4){
			// Kick the user, attach the reason.
			msg.guild.member(wUser).kick(wReason);
			// Notify the channel
			msg.channel.send(`<@${wUser.id}> has been kicked.`);
		};
		
		// Has the mentioned user reached 5 warnings?
		if(warns[wUser.id].warns >= 5){
			// Ban the user, attach the reason.
			msg.guild.member(wUser).ban(wReason);
			// Reset their warnings in the JSON File
			warns[wUser.id].warns = 0;
			// Notify the channel
			msg.channel.send(`<@${wUser.id}> has been banned.`);
		};
		
		// Write the final changes to the JSON File.
		fs.writeFile('./assets/json/warnings.json', JSON.stringify(warns, null, 4), err => {
			if(err) console.log(err);
		});
	};
};