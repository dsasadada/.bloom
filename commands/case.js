const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View a moderation case')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Case ID (example: CASE-ABC123)')
        .setRequired(true)
    ),

  async execute(interaction) {

    const caseId = interaction.options.getString('id');

    // 📁 LOAD CASES
    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    const caseData = cases[caseId];

    if (!caseData) {
      return interaction.reply({
        content: '❌ Case not found.',
        flags: 64
      });
    }

    // 🎨 Base embed
    const embed = new EmbedBuilder()
      .setTitle(`Case ${caseId}`)
      .setColor(0x6d1f2e)
      .setTimestamp();

    // 🧾 COMMON FIELDS
    embed.addFields(
      { name: 'User', value: `${caseData.userTag} (${caseData.userId})`, inline: false },
      { name: 'Moderator', value: caseData.moderator || 'Unknown', inline: false },
      { name: 'Type', value: caseData.type, inline: true },
      { name: 'Reason', value: caseData.reason || 'No reason provided', inline: false },
      { name: 'Date', value: `<t:${Math.floor(caseData.timestamp / 1000)}:F>`, inline: false }
    );

    // ⚠️ EXTRA INFO FOR SPECIFIC TYPES
    if (caseData.type === 'BAN') {
      embed.setTitle(`Case ${caseId} (BAN)`);
    }

    if (caseData.type === 'UNBAN') {
      embed.addFields(
        { name: 'Unbanned By', value: caseData.unbannedBy || 'Unknown', inline: false },
        { name: 'Unban Reason', value: caseData.unbanReason || 'No reason', inline: false }
      );
    }

    if (caseData.type === 'WARN') {
      embed.setTitle(`Case ${caseId} (WARN)`);
    }

    if (caseData.type === 'TIMEOUT') {
      embed.setTitle(`Case ${caseId} (TIMEOUT)`);
    }

    if (caseData.type === 'KICK') {
      embed.setTitle(`Case ${caseId} (KICK)`);
    }

    return interaction.reply({ embeds: [embed] });
  }
};