const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// 🔒 Allowed role ID
const ALLOWED_ROLE_ID = '1491121825323811018';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot send a message in the channel')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message');

    // 🔐 Role check
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You are not allowed to use this command.',
        ephemeral: true
      });
    }

    // 🔐 Bot permission check
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages)) {
      return interaction.reply({
        content: '❌ I need permission to send messages.',
        ephemeral: true
      });
    }

    // 🚫 Stop the slash command "reply" and just send to channel
    await interaction.deferReply({ ephemeral: true });

    await interaction.channel.send(message);

    await interaction.deleteReply();
  },
};