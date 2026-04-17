const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for timeout')
        .setRequired(false)
    ),

  async execute(interaction) {

    // 🔒 Role check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server.',
        ephemeral: true
      });
    }

    if (!member.moderatable) {
      return interaction.reply({
        content: '❌ I cannot timeout this user (role hierarchy issue).',
        ephemeral: true
      });
    }

    const timeoutMs = duration * 60 * 1000;

    // 📩 DM USER (best effort)
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('You have been timed out')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Duration', value: `${duration} minutes`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch {
      console.log(`⚠️ Could not DM ${user.tag}`);
    }

    // ⏱ APPLY TIMEOUT
    await member.timeout(timeoutMs, reason);

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: TIMEOUT')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
          { name: 'Duration', value: `${duration} minutes`, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ CONFIRMATION
    const confirmEmbed = new EmbedBuilder()
      .setTitle('User Timed Out')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Duration', value: `${duration} minutes`, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};