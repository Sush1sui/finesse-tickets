import { CustomClient } from "./bot";
import path from "path";
import fs from "node:fs";

export default function loadEvents(client: CustomClient) {
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".ts"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.default.once) {
      client.once(event.default.name, (...args) =>
        event.default.execute(...args)
      );
    } else {
      client.on(event.default.name, (...args) =>
        event.default.execute(...args)
      );
    }
  }
}
