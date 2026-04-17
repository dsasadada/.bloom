const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const MOD_ROLE_ID = '1491121825323811018';
const MOD_LOG_CHANNEL_ID = '1491121827613769815';

function generateCaseId() {
  return 'CASE-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
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
    const caseId = generateCaseId();

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server.',
        flags: 64
      });
    }

    // 📁 LOAD CASES
    const cases = fs.existsSync('./cases.json')
      ? JSON.parse(fs.readFileSync('./cases.json', 'utf8'))
      : {};

    // 💾 SAVE WARNING CASE
    cases[caseId] = {
      userId: user.id,
      userTag: user.tag,
      moderator: interaction.user.tag,
      reason,
      type: 'WARN',
      timestamp: Date.now()
    };

    fs.writeFileSync('./cases.json', JSON.stringify(cases, null, 2));

    // 📊 COUNT WARNINGS
    const warningCount = Object.values(cases).filter(
      c => c.userId === user.id && c.type === 'WARN'
    ).length;

    // 📩 DM USER
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('You have been warned')
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

    // 📋 MOD LOG
    const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);

    if (logChannel) {
      const logEmbed = new EmbedBuilder()
        .setTitle('Moderation Action: WARN')
        .setColor(0x6d1f2e)
        .addFields(
          { name: 'Case ID', value: caseId, inline: true },
          { name: 'User', value: `${user.tag} (${user.id})`, inline: false },
          { name: 'Moderator', value: interaction.user.tag, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Total Warnings', value: `${warningCount}`, inline: true }
        )
        .setTimestamp();

      logChannel.send({ embeds: [logEmbed] }).catch(console.error);
    }

    // 🚨 AUTO PUNISH SYSTEM

    try {

      // 3 WARN → TIMEOUT (10 min)
      if (warningCount === 3) {
        await member.timeout(10 * 60 * 1000, 'Auto-punish: 3 warnings');

        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Auto Punishment: Timeout')
              .setColor(0x6d1f2e)
              .setDescription(`${user.tag} has been timed out for reaching 3 warnings.`)
          ]
        });
      }

      // 5 WARN → KICK
      if (warningCount === 5) {
        await member.kick('Auto-punish: 5 warnings');

        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Auto Punishment: Kick')
              .setColor(0x6d1f2e)
              .setDescription(`${user.tag} has been kicked for reaching 5 warnings.`)
          ]
        });
      }

      // 10 WARN → BAN
      if (warningCount === 10) {
        await member.ban({ reason: 'Auto-punish: 10 warnings' });

        interaction.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle('Auto Punishment: Ban')
              .setColor(0x6d1f2e)
              .setDescription(`${user.tag} has been banned for reaching 10 warnings.`)
          ]
        });
      }

    } catch (err) {
      console.log('Auto-punish error:', err);
    }

    // ✅ FINAL CONFIRMATION
    const confirmEmbed = new EmbedBuilder()
      .setTitle('User Warned')
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'User', value: user.tag, inline: true },
        { name: 'Case ID', value: caseId, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Total Warnings', value: `${warningCount}`, inline: true }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [confirmEmbed] });
  }
};