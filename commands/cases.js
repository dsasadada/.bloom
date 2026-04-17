const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';

const CASES_PATH = './cases.json';

function loadCases() {
  if (!fs.existsSync(CASES_PATH)) return {};
  return JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cases')
    .setDescription('View all moderation cases for a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view cases for')
        .setRequired(true)
    ),

  async execute(interaction) {

    // 🔒 Role check
    if (!interaction.member.roles.cache.has(MOD_ROLE_ID)) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.'
      });
    }

    const user = interaction.options.getUser('user');
    const cases = loadCases();

    // 🔍 filter user cases
    const userCases = Object.entries(cases)
      .filter(([_, data]) => data.userId === user.id)
      .sort((a, b) => b[1].timestamp - a[1].timestamp);

    if (userCases.length === 0) {
      return interaction.reply({
        content: `❌ No cases found for ${user.tag}.`
      });
    }

    // 📊 build case list
    let description = '';

    for (const [caseId, data] of userCases.slice(0, 15)) {
      description +=
        `**${caseId}**\n` +
        `Type: **${data.type}**\n` +
        `Reason: ${data.reason || 'No reason'}\n` +
        `Moderator: ${data.moderator || 'Unknown'}\n` +
        `Date: <t:${Math.floor(data.timestamp / 1000)}:R>\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`Cases for ${user.tag}`)
      .setColor(0x6d1f2e)
      .setDescription(description)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({
        text: `Total Cases: ${userCases.length}`
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};