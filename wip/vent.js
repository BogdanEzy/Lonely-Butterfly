const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageEmbed, MessageButton  } = require('discord.js');
const { ventNotifyChannelId } = require('../config.json');
const ReplitClient = require("replitdb-client");
const replitClient = new ReplitClient();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vent')
		.setDescription('Starts a private vent session.')
		.addStringOption(option =>
			option.setName('message')
				.setDescription('The message to be displayed to the listeners')
				.setRequired(true))
			.addBooleanOption(option =>
				option.setName('visible')
					.setDescription('If you rather show your name or not to the listeners')
					.setRequired(false)),

	async execute(interaction) {
		const message = interaction.options.getString('message');
		const visible = true ? interaction.options.getBoolean('visible') : false;
		console.log(visible);
		let errorFree = true;
		
		await interaction.user.send({ content: 'balls' }).catch(error => {
				interaction.reply({ content: 'You have to have your Direct Messages enabled in order to start a private venting session with the bot.', ephemeral: true })
				errorFree = false;
			});

		// If the member can't receive the message from the bot, cancel the session.
		if (!errorFree) return;

		const notifyChannel = await interaction.guild.channels.fetch(ventNotifyChannelId);

		const button = new MessageButton()
			.setCustomId('connect.button')
			.setLabel('Connect')
			.setStyle('PRIMARY');

		const row = new MessageActionRow().addComponents(button);

		const memberName = interaction.user.name ? visible === false : 'Anonymous';
	
		const embed = new MessageEmbed()
			.setColor('#4dd18f')
			.setTitle(memberName + ' needs help')
			.setDescription(`The member said: \n${message}`);

		await notifyChannel.send({ embeds: [embed], components: [row]});

		await interaction.reply({ content: 'Your request has been sent. Please wait until someone connects to your session.', ephemeral: true});

		const filter = i => i.customId === 'connect.button';
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
		button.setDisabled(true).setStyle('SUCCESS').setLabel('Someone is connected!');
		
		collector.on('collect', async i => {
			if (i.customId === 'connect.button') {
				await i.update({ components: [row] });
			}
		});

		// collector.on('end', collected => console.log(`Collected ${collected.size} items`));

	},
};