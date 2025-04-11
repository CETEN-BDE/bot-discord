// Required packages
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
} = require("discord.js");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const fetch = require("node-fetch");
const profile = require("dotenv").config();

// Define determineRolesFromGoogleProfile function before using it
function determineRolesFromGoogleProfile(profile) {
  const roles = [];
  if (profile.emails && profile.emails[0]) {
    const email = profile.emails[0].value;

    if (email.endsWith("@yourcompany.com")) {
      roles.push("admin");
    }
    if (email.endsWith("@partner.com")) {
      roles.push("moderator");
    }
    roles.push("verified");
  }
  return roles;
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel],
});

// Express server for handling SSO
const app = express();

// Configure Passport with Google OAuth 2.0 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.SSO_CLIENT_ID,
      clientSecret: process.env.SSO_CLIENT_SECRET,
      callbackURL: process.env.SSO_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, done) {
      const userData = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0].value,
        roles: determineRolesFromGoogleProfile(profile),
      };
      return done(null, userData);
    }
  )
);

// Serialize/deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Express middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
    name: "discord.oauth2",
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Store Discord user ID to SSO identity mapping
const userMappings = {};

// Update the login route to properly handle Discord IDs
app.get("/auth/login", (req, res, next) => {
  const { userId, guildId } = req.query;

  if (!userId || !guildId) {
    return res.status(400).send("Missing userId or guildId parameters");
  }

  // Store state in Google OAuth flow instead of session
  const state = Buffer.from(
    JSON.stringify({
      discordUserId: userId,
      guildId: guildId,
    })
  ).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
  })(req, res, next);
});

// Update the callback route to include logging
app.get(
  "/auth/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  async (req, res) => {
    try {
      const userData = req.user;

      // Decode state from OAuth flow
      const stateData = JSON.parse(
        Buffer.from(req.query.state, "base64").toString()
      );
      const discordUserId = stateData.discordUserId;
      const guildId = stateData.guildId;

      console.log("OAuth State Data:", stateData);

      if (!discordUserId || !guildId) {
        console.error("Missing IDs in OAuth state");
        return res.status(400).send("Missing Discord user ID or guild ID.");
      }

      // Store the mapping
      userMappings[discordUserId] = {
        ssoIdentity: userData.email,
        roles: userData.roles || [],
      };

      // Assign roles based on SSO data
      await assignRoles(guildId, discordUserId, userData);

      res.send("Authentication successful! You can close this window now.");
    } catch (error) {
      console.error("Error in callback:", error);
      res.status(500).send("An error occurred during authentication.");
    }
  }
);

app.get("/auth/failure", (req, res) => {
  res.send("Authentication failed. Please try again.");
});

// Function to assign roles based on SSO data
async function assignRoles(guildId, userId, userData) {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      console.error(`Guild ${guildId} not found`);
      return;
    }

    const member = await guild.members.fetch(userId);
    if (!member) {
      console.error(`Member ${userId} not found in guild ${guildId}`);
      return;
    }

    // Define role mapping from SSO attributes to Discord roles
    // This should be customized based on your SSO provider and Discord server setup
    const roleMapping = {
      admin: process.env.ADMIN_ROLE_ID,
      moderator: process.env.MODERATOR_ROLE_ID,
      premium: process.env.PREMIUM_ROLE_ID,
      // Add more role mappings as needed
    };

    // Get user roles from SSO data
    const userRoles = userData.roles || [];

    // Add mapped roles
    for (const role of userRoles) {
      const discordRoleId = roleMapping[role];
      if (discordRoleId) {
        await member.roles.add(discordRoleId);
        console.log(`Added role ${role} to user ${userId}`);
      }
    }

    // Add verified role to all authenticated users
    if (process.env.VERIFIED_ROLE_ID) {
      await member.roles.add(process.env.VERIFIED_ROLE_ID);
      console.log(`Added verified role to user ${userId}`);
    }
  } catch (error) {
    console.error("Error assigning roles:", error);
  }
}

// Discord bot command to start authentication
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "verify") {
    const authUrl = `${process.env.APP_URL}/auth/login?userId=${interaction.user.id}&guildId=${interaction.guildId}`;
    console.log("Generated Auth URL:", authUrl);
    await interaction.reply({
      content: `Please authenticate using this link: ${authUrl}`,
      flags: 64, // This replaces ephemeral: true
    });
  }
});

// Register slash commands when the bot starts
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register slash commands
  const commands = [
    {
      name: "verify",
      description: "Verify your account with SSO and get roles",
    },
  ];

  try {
    console.log("Started refreshing application (/) commands.");

    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN
    );

    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Login the Discord bot
client.login(process.env.DISCORD_TOKEN);
