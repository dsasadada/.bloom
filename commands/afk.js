const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set your AFK status')
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Why are you AFK?')
        .setRequired(false)
    ),

  async execute(interaction, afkMap) {
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const member = interaction.member;

    if (afkMap.has(interaction.user.id)) {
      return interaction.reply({
        content: '⚠️ You are already AFK.'
      });
    }

    // Save original nickname
    afkMap.set(interaction.user.id, {
      reason,
      time: Date.now(),
      originalName: member.nickname || member.user.username
    });

    // Set AFK nickname
    try {
      await member.setNickname(`[AFK] | ${member.displayName}`);
    } catch (err) {
      console.log('Could not change nickname (missing perms)');
    }

    await interaction.reply({
      content: `💤 ${interaction.user} is now AFK: **${reason}**`
    });
  }
};