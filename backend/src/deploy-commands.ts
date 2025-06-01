import { APIApplicationCommand, Client, REST, Routes } from "discord.js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const commands: APIApplicationCommand[] = [];
const clientId = process.env.DISCORD_CLIENT_ID;
const bot_token = process.env.DISCORD_BOT_TOKEN;

if (!clientId || !bot_token) throw new Error("missing .env variables");

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command.default && "execute" in command.default) {
      commands.push(command.default.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// and deploy your commands!
export default async (client: Client) => {
  try {
    const rest = new REST().setToken(bot_token);
    for (const guild of client.guilds.cache.values()) {
      console.log(`Deploying commands to guild: ${guild.id}`);

      const data: APIApplicationCommand[] = (await rest.put(
        Routes.applicationGuildCommands(clientId, guild.id),
        { body: commands }
      )) as APIApplicationCommand[];

      console.log(
        `Successfully registered ${data.length} commands for guild ${guild.id}`
      );
    }
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
};
