const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

function generateCaseId() {
  return 'CASE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false)
    ),

  async execute(interaction) {

    // 🚀 FIX: prevent timeout
    await interaction.deferReply();

    // 🔒 Role check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.editReply('❌ You do not have permission to use this command.');
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const caseId = generateCaseId();

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.editReply('❌ That user is not in this server.');
    }

    if (!member.bannable) {
      return interaction.editReply('❌ I cannot ban this user (higher role or missing permissions).');
    }

    // 📁 LOAD CASES
    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    cases[caseId] = {
      userId: user.id,
      userTag: user.tag,
      moderator: interaction.user.tag,
      reason,
      type: 'BAN',
      timestamp: Date.now()
    };

    fs.writeFileSync('./cases.json', JSON.stringify(cases, null, 2));

    // 📩 DM (non-blocking safe)
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('You have been banned')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Reason', value: reason, inline: true },
          { name: 'Case ID', value: caseId, inline: true }
        )
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch {}

    // 🔨 Ban user
    await member.ban({ reason });

    // 📋 Mod log
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: BAN')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Case ID', value: caseId, inline: true },
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ FINAL RESPONSE
    const confirmEmbed = new EmbedBuilder()
      .setTitle('User Banned')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Case ID', value: caseId, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [confirmEmbed] });
  }
};