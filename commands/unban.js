const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user using case ID')
    .addStringOption(option =>
      option.setName('caseid')
        .setDescription('Case ID of the ban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unban')
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

    const caseId = interaction.options.getString('caseid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // 📁 Load cases
    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    const caseData = cases[caseId];

    if (!caseData) {
      return interaction.reply({
        content: '❌ Invalid case ID.',
        ephemeral: true
      });
    }

    if (caseData.type !== 'BAN') {
      return interaction.reply({
        content: '❌ This case is not a ban.',
        ephemeral: true
      });
    }

    const userId = caseData.userId;

    // 🔍 Check ban list
    const banList = await interaction.guild.bans.fetch();
    const bannedUser = banList.get(userId);

    if (!bannedUser) {
      return interaction.reply({
        content: '❌ This user is not currently banned.',
        ephemeral: true
      });
    }

    // 🔓 Unban user
    await interaction.guild.members.unban(userId, reason);

    // 📋 Mod log
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: UNBAN')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Case ID', value: caseId, inline: true },
          { name: 'User', value: `${bannedUser.user.tag} (${userId})`, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ Confirmation
    const confirmEmbed = new EmbedBuilder()
      .setTitle('User Unbanned')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: bannedUser.user.tag, inline: true },
        { name: 'Case ID', value: caseId, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};