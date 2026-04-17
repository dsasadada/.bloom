require('dotenv').config();
const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection,
  Events
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== AFK STORAGE =====
const afkMap = new Map();

// ===== SHARED STORAGE (for buttons/suggestions later) =====
client.suggestionVotes = new Map();

// ===== CONFIG =====
const GUILD_ID = '1491121825181208826';
const WELCOME_CHANNEL_ID = '1491121826745679957';
const WELCOME_ROLE_ID = '1491121825181208835';
const DASHBOARD_LINK = 'https://discord.com/channels/1491121825181208826/1491121826099626238';

// ===== LOAD COMMANDS =====
client.commands = new Collection();

const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ===== READY EVENT =====
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);

  let toggle = false;

  const updateStatus = () => {
    const guild = client.guilds.cache.first();
    if (!guild) return;

    const memberCount = guild.memberCount;

    client.user.setPresence({
      activities: [{
        name: toggle
          ? `🌿 Protecting ${memberCount} members`
          : '🛠️ Managing .bloom',
        type: toggle ? ActivityType.Playing : ActivityType.Watching
      }],
      status: 'online'
    });

    toggle = !toggle;
  };

  updateStatus();
  setInterval(updateStatus, 30000);
});

// ===== WELCOME SYSTEM =====
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);

    const welcomeChannel = await guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) return;

    const fetchedMember = await guild.members.fetch(member.user.id);

    const role = await guild.roles.fetch(WELCOME_ROLE_ID);
    if (role) {
      await fetchedMember.roles.add(role).catch(() => {});
    }

    const memberCount = guild.memberCount;

    await welcomeChannel.send({
      content: `<:Hand:1494678314969989391> \`-\` Welcome to **${guild.name}**, <@${member.user.id}>! We're excited to have you join us.`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 2,
              label: memberCount.toString(),
              emoji: {
                id: '1493603873708052681',
                name: 'Logo'
              },
              custom_id: 'member_count',
              disabled: true
            },
            {
              type: 2,
              style: 5,
              label: 'Dashboard',
              url: DASHBOARD_LINK
            }
          ]
        }
      ]
    });

  } catch (error) {
    console.error('Welcome message Error:', error);
  }
});

// ===== AFK SYSTEM =====
client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;

  const member = message.member;

  // ===== REMOVE AFK =====
  if (afkMap.has(message.author.id)) {
    const afkData = afkMap.get(message.author.id);
    afkMap.delete(message.author.id);

    try {
      if (member && afkData.originalName) {
        const cleanName = afkData.originalName.replace(/^\[AFK\] \| /, '');
        await member.setNickname(cleanName).catch(() => {});
      }
    } catch (err) {
      console.log('Could not reset nickname:', err.message);
    }

    message.reply('👋 Welcome back! You are no longer AFK.');
  }

  // ===== CHECK MENTIONS =====
  if (message.mentions.users.size > 0) {
    const mentionedUser = message.mentions.users.first();

    if (mentionedUser && afkMap.has(mentionedUser.id)) {
      const afkData = afkMap.get(mentionedUser.id);

      message.reply(`${mentionedUser.username} is afk **${afkData.reason}**`);
    }
  }
});

// ===== BUTTON / INTERACTION HANDLER (SAFE) =====
client.on(Events.InteractionCreate, async interaction => {

  // ===== SLASH COMMANDS =====
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, afkMap);
    } catch (err) {
      console.error(err);

      if (!interaction.replied) {
        await interaction.reply({
          content: '❌ Error running command.',
          ephemeral: true
        });
      }
    }
  }

  // ===== BUTTON HANDLER SAFETY (prevents "interaction failed") =====
  if (interaction.isButton()) {

    // IMPORTANT: always respond OR defer
    try {
      // If you later use suggestion system
      const votes = client.suggestionVotes;
      const msgId = interaction.message.id;
      const data = votes.get(msgId);

      if (!data) {
        return interaction.reply({
          content: '⚠️ This interaction is no longer active.',
          ephemeral: true
        });
      }

      const userId = interaction.user.id;

      if (interaction.customId === 'upvote') {
        if (data.up.has(userId)) {
          data.up.delete(userId);
        } else {
          data.up.add(userId);
          data.down.delete(userId);
        }
      }

      if (interaction.customId === 'downvote') {
        if (data.down.has(userId)) {
          data.down.delete(userId);
        } else {
          data.down.add(userId);
          data.up.delete(userId);
        }
      }

      const EmbedBuilder = require('discord.js').EmbedBuilder;

      const oldEmbed = interaction.message.embeds[0];

      const newEmbed = EmbedBuilder.from(oldEmbed).setFields(
        { name: '👍 Upvotes', value: `${data.up.size}`, inline: true },
        { name: '👎 Downvotes', value: `${data.down.size}`, inline: true }
      );

      return interaction.update({ embeds: [newEmbed] });

    } catch (err) {
      console.error('Button error:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Something went wrong with this button.',
          ephemeral: true
        });
      }
    }
  }
});

client.login(process.env.TOKEN);