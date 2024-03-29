const { Command } = require('discord.js-commando');
const { createCanvas, loadImage } = require('canvas');
const request = require('snekfetch');
const path = require('path');

module.exports = class PhotographCommand extends Command {
	constructor(client){
		super(client, {
			name: 'photograph',
			aliases: ['nickelback'],
			group: 'avatar-edit',
			memberName: 'photograph',
			description: 'Draws a user\'s avatar in Nickelback\'s photograph.',
			throttling: {
				usages: 1,
				duration: 10
			},
			clientPermissions: ['ATTACH_FILES'],
			args: [
					{
						key: 'user',
						prompt: 'Which user would you like to edit the avatar of?',
						type: 'user',
						default: msg => msg.author
					}
				]
		});
	}
	
	async run(msg, { user }){
		const avatarURL = user.displayAvatarURL;
		try {
			// Constants
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'look-at-this-photograph.png'));
			const { body } = await request.get(avatarURL);
			const avatar = await loadImage(body);
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			
			// Drawing the image
			ctx.drawImage(base, 0, 0);
			ctx.rotate(-13.5 * (Math.PI / 180));
			ctx.drawImage(avatar, 280, 218, 175, 125);
			ctx.rotate(13.5 * (Math.PI / 180));
			
			// Return the message
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'look-at-this-photograph.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};