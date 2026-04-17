const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to check warnings for')
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Role check (optional — remove if you want public)
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: 64
      });
    }

    const user = interaction.options.getUser('user');

    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    // 🔍 filter warnings
    const warnings = Object.entries(cases)
      .filter(([_, data]) =>
        data.userId === user.id && data.type === 'WARN'
      );

    if (warnings.length === 0) {
      return interaction.reply({
        content: `✅ ${user.tag} has no warnings.`,
        flags: 64
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`Warnings for ${user.tag}`)
      .setColor(0x6d1f2e)
      .setDescription(`Total Warnings: **${warnings.length}**`)
      .setTimestamp();

    warnings.slice(0, 10).forEach(([caseId, data], index) => {
      embed.addFields({
        name: `#${index + 1} • ${caseId}`,
        value:
          `**Reason:** ${data.reason}\n` +
          `**Moderator:** ${data.moderator}\n` +
          `**Date:** <t:${Math.floor(data.timestamp / 1000)}:F>`
      });
    });

    return interaction.reply({ embeds: [embed] });
  }
};