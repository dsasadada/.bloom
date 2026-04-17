const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-info')
    .setDescription('Shows information about a role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to get info about')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    const embed = new EmbedBuilder()
      .setTitle(`Role Info: ${role.name}`)
      .setColor(0x6d1f2e)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Color', value: role.hexColor, inline: true },
        { name: 'Members', value: `${role.members.size}`, inline: true },
        { name: 'Position', value: `${role.position}`, inline: true },
        { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
        { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(role.createdTimestamp / 1000)}:F>`
        }
      )
      .setFooter({ text: 'Role Information' });

    await interaction.reply({
      embeds: [embed]
    });
  },
};