const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// 🔒 Allowed role ID
const ALLOWED_ROLE_ID = '1491121825323811018';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock the current channel'),

  async execute(interaction) {

    // 🔐 Role check
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You are not allowed to use this command.',
        ephemeral: true
      });
    }

    // 🔐 Bot permission check
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: '❌ I need **Manage Channels** permission.',
        ephemeral: true
      });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(
        interaction.guild.roles.everyone,
        {
          SendMessages: false
        }
      );

      await interaction.reply('<:Padlock:1493663455704649858> Channel locked.');
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: '❌ Failed to lock channel.',
        ephemeral: true
      });
    }
  },
};