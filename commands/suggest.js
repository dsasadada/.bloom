const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a suggestion')
    .addStringOption(option =>
      option.setName('idea')
        .setDescription('Your suggestion')
        .setRequired(true)
    ),

  async execute(interaction) {
    const idea = interaction.options.getString('idea');

    // ✅ USE GLOBAL MAP FROM INDEX.JS
    const votes = interaction.client.suggestionVotes;

    const embed = new EmbedBuilder()
      .setTitle('💡 New Suggestion')
      .setDescription(idea)
      .addFields(
        { name: '👍 Upvotes', value: '0', inline: true },
        { name: '👎 Downvotes', value: '0', inline: true }
      )
      .setFooter({ text: `Suggested by ${interaction.user.tag}` })
      .setColor('#6d1f2e')
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('upvote')
        .setEmoji('<:ArrowU:1493974454265577693>')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('downvote')
        .setEmoji('<:ArrowD:1493974590614016212>')
        .setStyle(ButtonStyle.Danger)
    );

    // ✅ modern reply (no fetchReply warning)
    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      withResponse: true
    });

    const msg = response.resource?.message;

    if (!msg) {
      return interaction.followUp({
        content: '❌ Failed to create suggestion message.',
        ephemeral: true
      });
    }

    // ✅ store vote data globally
    votes.set(msg.id, {
      up: new Set(),
      down: new Set()
    });
  }
};