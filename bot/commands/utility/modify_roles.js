const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assign")
    .setDescription("Assigns a role to a user.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to assign the role to")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to assign")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if bot has permission to manage roles
    if (
      !interaction.guild.members.me.permissions.has(
        PermissionsBitField.Flags.ManageRoles
      )
    ) {
      return interaction.reply({
        content: "I don't have permission to manage roles!",
        ephemeral: true,
      });
    }

    const targetMember = interaction.options.getMember("user");
    const role = interaction.options.getRole("role");

    try {
      await targetMember.roles.add(role);
      await interaction.reply({
        content: `Successfully assigned ${role.name} to ${targetMember.user.username}`,
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "An error occurred while assigning the role.",
        ephemeral: true,
      });
    }
  },
};
