const { Command } = require('discord.js-commando');
const { createCanvas, loadImage } = require('canvas');
const request = require('snekfetch');
const path = require('path');

module.exports = class BobRossCommand extends Command {
	constructor(client){
		super(client, {
			name: 'bob-ross',
			aliases: ['ross'],
			group: 'avatar-edit',
			memberName: 'bob-ross',
			description: 'Draws a user\'s avatar over Bob Ross\' canvas.',
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
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'bob-ross.png'));
			const { body } = await request.get(avatarURL);
			const avatar = await loadImage(body);
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			
			// Drawing the image
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.rotate(3 * (Math.PI / 180));
			ctx.drawImage(avatar, 30, 19, 430, 430);
			ctx.rotate(-3 * (Math.PI / 180));
			ctx.drawImage(base, 0, 0);
			
			// Return the message
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'bob-ross.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};