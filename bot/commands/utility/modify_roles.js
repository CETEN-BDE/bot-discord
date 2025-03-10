const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assign')
		.setDescription('Assigns a role to a user.')
		.addUserOption(option => 
			option.setName('user')
			  .setDescription('The user to assign the role to')
			  .setRequired(true))
		  .addRoleOption(option => 
			option.setName('role')
			  .setDescription('The role to assign')
			  .setRequired(true))
		  .toJSON(),
	async execute(interaction) {
		if (!interaction.memberPermissions.has('MANAGE_ROLES')) {
      return interaction.reply({ content: 'You do not have permission to assign roles.', ephemeral: true });
    }
    
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');
    
    try {
      await user.roles.add(role);
      interaction.reply(`Successfully assigned ${role.name} to ${user.user.username}`);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'Failed to assign role. Make sure the bot has the necessary permissions.', ephemeral: true });
    }
	},
};