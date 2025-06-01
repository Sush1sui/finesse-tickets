import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("hello_world")
    .setDescription('Replies with "Hello World"'),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      await interaction.reply({
        content: "Hello World",
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "Something went wrong",
        flags: "Ephemeral",
      });
    }
  },
};
