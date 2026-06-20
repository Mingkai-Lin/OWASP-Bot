import { Client, GatewayIntentBits, Events, GuildMember, AttachmentBuilder, GuildTextBasedChannel} from "discord.js";
import * as dotenv from "dotenv";

// load variables from a .env file into process.env.
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN!;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID!;

// the client object represents the bot's connection to Discord.
const client = new Client({
    // Discord Gateway Intents. tell Discord what events/data bot wants to receive.
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
    ],
});

client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
});


client.login(BOT_TOKEN);
