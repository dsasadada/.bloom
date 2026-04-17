const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

const CASES_PATH = './cases.json';

function loadCases() {
  if (!fs.existsSync(CASES_PATH)) return {};
  return JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
}

function saveCases(cases) {
  fs.writeFileSync(CASES_PATH, JSON.stringify(cases, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn-remove')
    .setDescription('Remove a warning by case ID')
    .addStringOption(option =>
      option.setName('caseid')
        .setDescription('Case ID of the warning')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing the warning')
        .setRequired(false)
    ),

  async execute(interaction) {

    // 🔒 Role check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: 64
      });
    }

    const caseId = interaction.options.getString('caseid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const cases = loadCases();

    const caseData = cases[caseId];

    if (!caseData) {
      return interaction.reply({
        content: '❌ Case not found.',
        flags: 64
      });
    }

    if (caseData.type !== 'WARN') {
      return interaction.reply({
        content: '❌ This case is not a warning.',
        flags: 64
      });
    }

    // 🧹 Remove warning
    delete cases[caseId];
    saveCases(cases);

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: WARN REMOVED')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Case ID', value: caseId, inline: true },
          { name: 'User', value: `${caseData.userTag} (${caseData.userId})`, inline: false },
          { name: 'Removed By', value: interaction.user.tag, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ CONFIRMATION
    const confirmEmbed = new EmbedBuilder()
      .setTitle('Warning Removed')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: caseData.userTag, inline: true },
        { name: 'Case ID', value: caseId, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};