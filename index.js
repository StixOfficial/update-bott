const {
  Client,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionType,
  PermissionFlagsBits
} = require("discord.js");

const express = require("express");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const app = express();
app.get("/", (_, res) => res.send("Bot running"));
app.listen(3000);

const UPDATE_LINK = "https://portal.cfx.re/assets/granted-assets";

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set bot status
  client.user.setPresence({
    activities: [
      {
        name: "Fuze Studios Updates",
        type: 3 // Watching
      }
    ],
    status: "online"
  });

  // Register slash command (Admin only)
  await client.application.commands.set([
    new SlashCommandBuilder()
      .setName("pushupdate")
      .setDescription("Post a Fuze Studios resource update")
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  ]);

  console.log("Slash command registered");
});

client.on("interactionCreate", async interaction => {
  // Slash command
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "pushupdate") {

      // Extra admin check
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Admins only.", ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId("pushupdateModal")
        .setTitle("Push Resource Update");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("resource")
            .setLabel("Resource Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("version")
            .setLabel("Version")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("changes")
            .setLabel("What was added / changed")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("files")
            .setLabel("Changed file paths")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

      await interaction.showModal(modal);
    }
  }

  // Modal submit
  if (interaction.type === InteractionType.ModalSubmit) {
    if (interaction.customId === "pushupdateModal") {
      const resource = interaction.fields.getTextInputValue("resource");
      const version = interaction.fields.getTextInputValue("version");
      const changes = interaction.fields.getTextInputValue("changes");
      const files = interaction.fields.getTextInputValue("files");

      const role = interaction.guild.roles.cache.find(r => r.name === "Client");

      const embed = new EmbedBuilder()
        .setColor("#39ff14")
        .setTitle("✅ Script Updates")
        .addFields(
          { name: "Resource", value: resource, inline: true },
          { name: "Version", value: version, inline: true },
          { name: "Changes", value: `\`\`\`+ ${changes}\`\`\`` },
          { name: "Changed File(s)", value: `\`\`\`${files}\`\`\`` }
        )
        .setDescription(`▶ **[Update Now](${https://portal.cfx.re/assets/granted-assets})**`)
        .setFooter({ text: "Fuze Studios" })
        .setTimestamp();

      await interaction.channel.send({
        content: role ? `<@&${role.id}>` : "",
        embeds: [embed]
      });

      await interaction.reply({ content: "✅ Update posted.", ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
