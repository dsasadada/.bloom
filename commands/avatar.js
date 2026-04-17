const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Shows a user avatar')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to get avatar from')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const avatarURL = user.displayAvatarURL({ size: 512, dynamic: true });

    const embed = new EmbedBuilder()
      .setTitle(`<:Picture:1493663385404051560> ${user.tag}'s Avatar`)
      .setColor(0x6d1f2e)
      .setImage(avatarURL)
      .setFooter({ text: 'Avatar Command' });

    await interaction.reply({
      embeds: [embed]
    });
  },
};