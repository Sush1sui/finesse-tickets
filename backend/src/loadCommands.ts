import path from "path";
import fs from "node:fs";
import { CustomClient } from "./bot";

export default function loadCommands(client: CustomClient) {
  const foldersPath = path.join(__dirname, "commands");
  const commandFolders = fs.readdirSync(foldersPath);

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command.default && "execute" in command.default) {
        client.commands.set(command.default.data.name, command.default);
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
  }
}
