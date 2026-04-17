const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// 🔒 Put your allowed role ID here
const ALLOWED_ROLE_ID = '1491121825323811018';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete multiple messages (1-250)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-250)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    // 🚫 Role check
    if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    // 🚫 Permission check (bot side safety)
    if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: '❌ I need **Manage Messages** permission to do this.',
        ephemeral: true
      });
    }

    // 🚫 Validate range
    if (amount < 1 || amount > 250) {
      return interaction.reply({
        content: '⚠️ Please choose a number between 1 and 250.',
        ephemeral: true
      });
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      await interaction.reply({
        content: `<:robot:1493663562202222784> Deleted **${deleted.size}** messages.`,
        ephemeral: true
      });
    } catch (err) {
      console.error(err);
      interaction.reply({
        content: '❌ Failed to delete messages. They may be too old (14+ days).',
        ephemeral: true
      });
    }
  },
};