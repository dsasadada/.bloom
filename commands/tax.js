const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tax')
    .setDescription('Applies tax to the roblox 30% rule.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('The amount you want to receive after tax')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const netAmount = interaction.options.getInteger('amount', true);
    const roundedNetAmount = Math.round(netAmount);
    const grossAmount = Math.ceil(roundedNetAmount / 0.7);
    const embed = new EmbedBuilder()
      .setColor('#6d1f2e')
      .setDescription(
        `<:Bell:1493662751044669640> You have entered a price of **${roundedNetAmount}**, and after tax, the final price is **${grossAmount}**.`
      );

    await interaction.reply({ embeds: [embed] });
  },
};