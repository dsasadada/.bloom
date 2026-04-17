require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const commands = [];

// Load command files
const commandFiles = fs
  .readdirSync('./commands')
  .filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (!command.data || !command.data.name) {
    console.warn(`⚠️ Skipping invalid command file: ${file}`);
    continue;
  }

  commands.push(command.data.toJSON());
}

// REST client
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log(`🔄 Deploying ${commands.length} slash commands...`);

    // OVERWRITE all guild commands in ONE request (prevents duplicates)
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log(`✅ Successfully deployed ${commands.length} commands!`);
  } catch (error) {
    console.error('❌ Failed to deploy commands:', error);
  }
})();