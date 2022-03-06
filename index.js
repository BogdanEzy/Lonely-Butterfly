const { Client, Collection, Intents, MessageEmbed, Message } = require('discord.js');
const dotenv = require('dotenv');
const { helpCategoryId, leaveChannelId, welcomeRoleId, welcomeChannelId, rulesChannelId, rolesChannelId, generalChannelId } = require('./config.json');
dotenv.config();
const fs = require('node:fs');

token = process.env.token;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

client.once('ready', () => {
	console.log('Ready!');
});

client.cooldowns = new Collection();
const { cooldowns } = client;

// Cooldown System
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;
	const command = client.commands.get(interaction.commandName);

	if (commandName !== 'ping-listeners') return;
	// This prevents the usage of the command in channels where you can't use it to fuck up the global cooldown of the command. </3 trolls
	if (interaction.channel.parentId !== helpCategoryId) {
		await command.execute(interaction)
		return;
	};

	if (!cooldowns.has(commandName)) {
		cooldowns.set(commandName, Date.now());
	}

	const now = Date.now();
	const cooldownAmount = 100 * 1000; //1800
	
	if (cooldowns.has(commandName)) {
		const expirationTime = cooldowns.get(commandName) + cooldownAmount;
		const timeLeft = (expirationTime - now) / 1000;

		if (now < expirationTime) {
			await interaction.reply({ content: `You can use this command again in \`${(timeLeft / 60).toFixed(1)}\` minutes!`, ephemeral: true});

		} else {
			await command.execute(interaction);

			// Setting the latest usage of the command
			cooldowns.set(commandName, Date.now());
		}
	}
});

client.on('guildMemberAdd', member => {
	// Info Message
	const infoMessage = new MessageEmbed()
		.setColor('#5df5a4')
		.setTitle(':wave: Welcome to The Butterflies!')
		.setDescription(`Hey, ${member}!\n> Please read our community rules <#${rulesChannelId}> before continuing,\n> you can also find more information about our community in that channel aswell.\n> You can *optionally* get yourself some roles (such as colors) in <#${rolesChannelId}>.\n> Say hi to us in <#${generalChannelId}>!\n• Enjoy your stay! :D
		`)
	member.send({ content: 'https://discord.gg/ghZbR2rXbU', embeds: [infoMessage] }).catch(error => {
		member.guild.channels.cache.get(welcomeChannelId).send({ content: `${member}`, embeds: [infoMessage]});
	});

	// Welcome Message
	const welcomeMessages = [`Welcome ${member}!`, `Glad to see you, ${member}.`, `A wild  ${member} joined.`, `owowowo who's this??? ${member}`];

	const welcomeMessage = new MessageEmbed()
		.setColor('#5df5a4')
		.setTitle('Welcome!')
		.setDescription(`${welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]}`)
		.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

	member.guild.channels.cache.get(welcomeChannelId).send({ content: `<@&${welcomeRoleId}>`, embeds: [welcomeMessage]});

});

client.on('guildMemberRemove', member => {

	const leaveMessages = [`Bye \`${member.user.tag}\``, `\`${member.user.tag}\` is gone.`, `\`${member.user.tag}\` left us.`, `\`${member.user.tag}\` will hopefully come back.`, `\`${member.user.tag}\` left.`]
	const leaveMessage = new MessageEmbed()
		.setColor('#eb5b5b')
		.setTitle('Someone left... :(')
		.setDescription(`${leaveMessages[Math.floor(Math.random() * leaveMessages.length)]}`)
		.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))

	member.guild.channels.cache.get(leaveChannelId).send({ embeds: [leaveMessage] });

});

client.login(token);