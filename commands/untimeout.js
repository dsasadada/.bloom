const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove a timeout from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove timeout from')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing timeout')
        .setRequired(false)
    ),

  async execute(interaction) {

    // 🔒 Role check (only errors are ephemeral)
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: 64
      });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server.',
        flags: 64
      });
    }

    // ❌ Check timeout status
    if (!member.communicationDisabledUntilTimestamp) {
      return interaction.reply({
        content: '❌ This user is not currently timed out.',
        flags: 64
      });
    }

    // 📩 DM USER (best effort)
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('Timeout Removed')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch {
      console.log(`⚠️ Could not DM ${user.tag}`);
    }

    // ⛔ REMOVE TIMEOUT
    await member.timeout(null, reason);

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: UNTIMEOUT')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ CONFIRMATION (FIXED — NOW PUBLIC)
    const confirmEmbed = new EmbedBuilder()
      .setTitle('Timeout Removed')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};