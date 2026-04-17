const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

function generateCaseId() {
  return 'CASE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick')
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

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ That user is not in this server.',
        flags: 64
      });
    }

    if (!member.kickable) {
      return interaction.reply({
        content: '❌ I cannot kick this user (higher role or missing permissions).',
        flags: 64
      });
    }

    const caseId = generateCaseId();

    // 📁 LOAD CASES
    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    // 💾 SAVE CASE (THIS WAS MISSING)
    cases[caseId] = {
      userId: user.id,
      userTag: user.tag,
      moderator: interaction.user.tag,
      reason,
      type: 'KICK',
      timestamp: Date.now()
    };

    fs.writeFileSync('./cases.json', JSON.stringify(cases, null, 2));

    // 📩 DM USER
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('You have been kicked')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Server', value: interaction.guild.name, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Case ID', value: caseId, inline: true }
        )
        .setTimestamp();

      await user.send({ embeds: [dmEmbed] });
    } catch {
      console.log(`⚠️ Could not DM ${user.tag}`);
    }

    // 👢 KICK USER
    await member.kick(reason);

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: KICK')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Case ID', value: caseId, inline: true },
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // ✅ CONFIRMATION
    const confirmEmbed = new EmbedBuilder()
      .setTitle('User Kicked')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Case ID', value: caseId, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};