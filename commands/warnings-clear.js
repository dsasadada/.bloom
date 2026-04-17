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
    .setName('warnings-clear')
    .setDescription('Clear all warnings for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to clear warnings for')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for clearing warnings')
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

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const cases = loadCases();

    // 🔍 find warnings for user
    const userWarnings = Object.entries(cases).filter(
      ([_, data]) => data.userId === user.id && data.type === 'WARN'
    );

    if (userWarnings.length === 0) {
      return interaction.reply({
        content: `❌ ${user.tag} has no warnings to clear.`,
        flags: 64
      });
    }

    // 🧹 delete warnings
    for (const [caseId] of userWarnings) {
      delete cases[caseId];
    }

    saveCases(cases);

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: WARNINGS CLEARED')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Cleared By', value: interaction.user.tag, inline: false },
          { name: 'Warnings Removed', value: `${userWarnings.length}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ CONFIRMATION
    const confirmEmbed = new EmbedBuilder()
      .setTitle('Warnings Cleared')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Removed', value: `${userWarnings.length}`, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};