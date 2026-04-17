const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// 🔐 Put your allowed role IDs here
const ALLOWED_ROLE_IDS = [
  '1491121825323811018'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode for the current channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Slowmode time in seconds (0 to disable)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;
    const seconds = interaction.options.getInteger('seconds');

    // 🚫 Role check
    const hasRole = member.roles.cache.some(role =>
      ALLOWED_ROLE_IDS.includes(role.id)
    );

    if (!hasRole) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    // Validate input
    if (seconds < 0 || seconds > 21600) {
      return interaction.reply({
        content: '❌ Slowmode must be between 0 and 21600 seconds.',
        ephemeral: true
      });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      if (seconds === 0) {
        return interaction.reply('🟢 Slowmode has been **disabled**.');
      }

      return interaction.reply(`⏱️ Slowmode set to **${seconds} seconds**.`);
    } catch (err) {
      console.error(err);

      return interaction.reply({
        content: '❌ Failed to set slowmode. Check bot permissions.',
        ephemeral: true
      });
    }
  }
};