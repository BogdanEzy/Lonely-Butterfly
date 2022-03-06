const { SlashCommandBuilder } = require('@discordjs/builders');
const { listenerRoleId, helpCategoryId } = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping-listeners')
		.setDescription('Pings the @Listener role.'),
	async execute(interaction) {
		if (interaction.channel.parentId !== helpCategoryId) {
			await interaction.reply({ content: 'You are not allowed to use this command here.', ephemeral: true});
			return;
		}
		await interaction.reply({ content: 'I have mentioned the listeners.\nPlease wait 1 hour before using this command again.', ephemeral: true });
		await interaction.channel.send(`<@&${listenerRoleId}> ${interaction.member} needs help!`);
	},
};

