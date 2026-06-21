import { Client, GatewayIntentBits, Events, GuildMember, AttachmentBuilder, GuildTextBasedChannel, Message} from "discord.js";
import * as dotenv from "dotenv";
import { buildWelcomeCard } from "./welcomeCard";

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

// client.once(Events.ClientReady, (c) => {
//     console.log(`Logged in as ${c.user.tag} (ID: ${c.user.id})`);
// });

async function sendWelcome(channel: GuildTextBasedChannel, member: GuildMember){
    const { buffer, ext } = await buildWelcomeCard(member);
    const attachment = new AttachmentBuilder(buffer, { name: `welcome.${ext}` });
    channel.send({ content: `Welcome to the OWASP VEGAS server, ${member}!`, files: [attachment] });
}

// Listen for the guildMemberAdd event, which is emitted when a new member joins the server.
client.on(Events.GuildMemberAdd, async (member) => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID) as GuildTextBasedChannel;
    if (!channel) {
        console.error("Welcome channel not found!");
        return;
    }
    await sendWelcome(channel, member);
});

// Listen for the messageCreate event, which is emitted when a new message is sent in a channel.
client.on(Events.MessageCreate, async (message: Message) => {
    // If the message content is not "!welcome" or if the message author is a bot, ignore it.
    if (message.content !== "!welcome" || message.author.bot) return;
    
    const member = message.member;
    if (!member) return;

    const channel = message.channel as GuildTextBasedChannel;
    await sendWelcome(channel, member);
});

client.login(BOT_TOKEN);
