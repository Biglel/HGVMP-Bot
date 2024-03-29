const Command = require('../../structures/Command');
const { createCanvas, loadImage } = require('canvas');
const request = require('snekfetch');
const path = require('path');

module.exports = class BeautifulCommand extends Command {
	constructor(client){
		super(client, {
			name: 'beautiful',
			aliases: ['this-is-beautiful', 'grunkle-stan'],
			group: 'avatar-edit',
			memberName: 'beautiful',
			description: 'Draws a user\'s avatar over Gravity Falls\' "Oh, this? This is beautiful." meme.',
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
			const base = await loadImage(path.join(__dirname, '..', '..', 'assets', 'images', 'beautiful.png'));
			const { body } = await request.get(avatarURL);
			const avatar = await loadImage(body);
			const canvas = createCanvas(base.width, base.height);
			const ctx = canvas.getContext('2d');
			
			// Drawing the image
			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, base.width, base.height);
			ctx.drawImage(avatar, 249, 24, 105, 105);
			ctx.drawImage(avatar, 249, 223, 105, 105);
			ctx.drawImage(base, 0, 0);
			
			// Return the message
			return msg.say({ files: [{ attachment: canvas.toBuffer(), name: 'beautiful.png' }] });
		} catch (err) {
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}
};