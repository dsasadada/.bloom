const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-info')
    .setDescription('Get info about a user')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user you want info about')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`User Info: ${user.tag}`)
      .setColor(5793266)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: 'Username', value: user.tag, inline: true },
        { name: 'User ID', value: user.id, inline: true },
        {
          name: 'Account Created',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`
        },
        {
          name: 'Joined Server',
          value: member
            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            : 'Unknown'
        }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    await interaction.reply({
      embeds: [embed]
    });
  },
};