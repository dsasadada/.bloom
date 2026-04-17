const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server-info')
    .setDescription('Shows information about this server'),

  async execute(interaction) {
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();

    const embed = new EmbedBuilder()
      .setTitle(`Server Info:`)
      .setColor(0x6d1f2e)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: owner.user.tag, inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        {
          name: 'Created',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
        }
      )
      .setFooter({ text: 'Server Info Command' });

    await interaction.reply({
      embeds: [embed]
    });
  },
};