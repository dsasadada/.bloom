const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('date')
    .setDescription('Show current date and time'),

  async execute(interaction) {
    const now = new Date();
    interaction.reply(`<:Calendar:1493663304147669213> ${now.toLocaleString()}`);
  },
};