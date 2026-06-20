import { createCanvas, loadImage, SKRSContext2D } from "@napi-rs/canvas";
import { GuildMember } from "discord.js";
import path from "path";

// buffer and extention
type CardResult = { buffer: Buffer, ext: "png" };

// define the width and height of the canvas
const W = 1280;
const H = 360;

const OWASP_LOGO = path.join(__dirname, "../assets/images/owasp-logo.png");

function drawBackground(ctx: SKRSContext2D) {
  ctx.fillStyle = "#060c18";
  ctx.fillRect(0, 0, W, H);
}

// -------- Card Building ------------------------------------------------------------------
async function buildCard01(member: GuildMember): Promise<Buffer>{
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    drawBackground(ctx);

    return canvas.toBuffer("image/png");
};


// -------- Export -------------------------------------------------------------------------

const pngVarients = [ buildCard01];
// const gifVarients = [ buildCard04];

export async function buildWelcomeCard(member: GuildMember): Promise<CardResult>{
    // Take every element inside pngVariants and put them into a new array.
    const allVarients = [ ...pngVarients];
    // const allVarients = [ ...pngVarients, ...gifVarients];

    // index for the card type
    const idx = Math.floor(Math.random() * allVarients.length);
    const fn = allVarients[idx];
    const buffer = await fn(member);
    const ext = "png";
    // const ext = "png" | "gif" 
    //     = fn === buildCard04 ? "gif" : "png";

    return { buffer, ext };
}; 