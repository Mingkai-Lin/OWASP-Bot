import { createCanvas, loadImage, SKRSContext2D } from "@napi-rs/canvas";
import { GuildMember } from "discord.js";
import path from "path";

// buffer and extention
type CardResult = { buffer: Buffer, ext: "png" };

// define the width and height of the canvas
const W = 1280;
const H = 360;

const OWASP_LOGO = path.join(__dirname, "../assets/images/owasplogo.png");

function rr(ctx: SKRSContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillTextCA(ctx: SKRSContext2D, text: string, x: number, y: number, color: string) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = "#ff2244";
  ctx.fillText(text, x - 3, y + 1);
  ctx.fillStyle = "#00eeff";
  ctx.fillText(text, x + 3, y - 1);
  ctx.restore();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// -- shared layers ------------------------------------------------------------------------

function drawBackground(ctx: SKRSContext2D) {
  ctx.fillStyle = "#060c18";
  ctx.fillRect(0, 0, W, H);
}

function drawWatermark(ctx: SKRSContext2D) {
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.font = "bold 160px Arial";
  ctx.fillStyle = "#22C55E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("OWASP", W / 2, H / 2);
  ctx.restore();
}

function drawCircuitLines(ctx: SKRSContext2D) {
  ctx.save();
  ctx.strokeStyle = "rgba(34, 197, 94, 0.14)";
  ctx.lineWidth = 1;
  const hLines: [number, number, number][] = [
    [0, 180, 40],  [240, 480, 40],  [560, 760, 40],  [840, 1050, 40],
    [0, 120, 80],  [200, 420, 80],  [500, 680, 80],  [760, 980, 80],  [1060, 1280, 80],
    [0, 260, 120], [340, 560, 120], [640, 860, 120], [940, 1150, 120],
    [0, 160, 160], [240, 460, 160], [540, 720, 160], [800, 1020, 160], [1100, 1280, 160],
    [0, 200, 200], [280, 500, 200], [580, 780, 200], [860, 1080, 200],
    [0, 140, 240], [220, 440, 240], [520, 700, 240], [1080, 1280, 240],
    [0, 260, 280], [340, 600, 280], [680, 900, 280], [980, 1280, 280],
    [0, 180, 320], [260, 480, 320], [560, 780, 320], [860, 1100, 320],
  ];
  for (const [x1, x2, y] of hLines) {
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
  }
  const vLines: [number, number, number][] = [
    [80, 0, 40],   [80, 80, 120],  [80, 160, 200],  [80, 240, 280],
    [180, 40, 80], [180, 120, 160],[180, 200, 240],  [180, 280, 320],
    [340, 0, 40],  [340, 80, 120], [340, 160, 200],
    [480, 40, 80], [480, 120, 160],[480, 200, 240],
    [640, 0, 40],  [640, 80, 120], [640, 160, 240],
    [780, 40, 80], [780, 120, 160],[780, 200, 240],
    [940, 0, 40],  [940, 80, 120],
    [1060, 40, 80],[1060, 120, 160],
    [1150, 0, 40], [1150, 80, 120],[1150, 160, 200],
  ];
  for (const [x, y1, y2] of vLines) {
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();
  }
  // Glowing active nodes
  ctx.shadowColor = "#22C55E"; ctx.shadowBlur = 6;
  ctx.fillStyle = "rgba(34, 197, 94, 0.5)";
  const hotDots: [number, number][] = [[80,80],[340,120],[640,160],[780,240],[480,80],[180,200]];
  for (const [x, y] of hotDots) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2); ctx.fill(); }
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(34, 197, 94, 0.18)";
  const dots: [number, number][] = [
    [80,40],[80,120],[80,160],[80,240],[80,280],
    [180,40],[180,80],[180,120],[180,160],[180,240],[180,280],[180,320],
    [340,40],[340,80],[340,160],[340,200],
    [480,40],[480,120],[480,160],[480,200],[480,240],
    [640,40],[640,80],[640,120],[640,240],
    [780,40],[780,80],[780,120],[780,160],[780,200],
    [940,40],[940,80],[940,120],
    [1060,40],[1060,80],[1060,120],[1060,160],
    [1150,40],[1150,80],[1150,120],[1150,160],[1150,200],
  ];
  for (const [x, y] of dots) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill(); }
  ctx.restore();
}

function drawSkyline(ctx: SKRSContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(34, 197, 94, 0.05)";
  const buildings: [number, number, number][] = [
    [0,309,70],[65,302,55],[115,291,35],[145,296,65],[205,304,50],
    [250,293,75],[320,299,55],[370,284,40],[405,290,65],[465,299,70],
    [530,294,55],[580,286,80],[655,297,65],[715,303,70],[780,291,55],
    [830,281,45],[870,295,80],[945,290,65],[1005,298,70],[1070,288,55],
    [1120,294,75],[1190,300,55],[1240,306,40],
  ];
  for (const [bx, by, bw] of buildings) ctx.fillRect(bx, by, bw, H - by);
  const grad = ctx.createLinearGradient(0, 277, 0, H);
  grad.addColorStop(0, "rgba(6, 12, 24, 0)");
  grad.addColorStop(1, "#060c18");
  ctx.fillStyle = grad; ctx.fillRect(0, 277, W, H - 277);
  ctx.restore();
}

function drawCornerBrackets(ctx: SKRSContext2D) {
  const pad = 18, arm = 36;
  ctx.shadowColor = "#22C55E"; ctx.shadowBlur = 10;
  ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad+arm, pad); ctx.lineTo(pad, pad); ctx.lineTo(pad, pad+arm);
  ctx.moveTo(W-pad-arm, pad); ctx.lineTo(W-pad, pad); ctx.lineTo(W-pad, pad+arm);
  ctx.moveTo(pad+arm, H-pad); ctx.lineTo(pad, H-pad); ctx.lineTo(pad, H-pad-arm);
  ctx.moveTo(W-pad-arm, H-pad); ctx.lineTo(W-pad, H-pad); ctx.lineTo(W-pad, H-pad-arm);
  ctx.stroke(); ctx.shadowBlur = 0;
}

function drawScanlines(ctx: SKRSContext2D) {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
  ctx.restore();
}

function drawGlitchBars(ctx: SKRSContext2D) {
  ctx.save();
  const bars = [
    { y: Math.round(H*0.22), h: 2, color: "rgba(34, 197, 94, 0.35)" },
    { y: Math.round(H*0.45), h: 1, color: "rgba(0, 238, 255, 0.2)"  },
    { y: Math.round(H*0.61), h: 3, color: "rgba(34, 197, 94, 0.2)"  },
    { y: Math.round(H*0.80), h: 1, color: "rgba(255, 34, 68, 0.18)" },
  ];
  for (const { y, h, color } of bars) { ctx.fillStyle = color; ctx.fillRect(0, y, W, h); }
  ctx.restore();
}

function drawDigitalNoise(ctx: SKRSContext2D) {
  ctx.save();
  for (let i = 0; i < 180; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    ctx.fillStyle = `rgba(34, 197, 94, ${(Math.random()*0.35+0.05).toFixed(2)})`;
    ctx.fillRect(x, y, Math.random() > 0.85 ? 2 : 1, 1);
  }
  for (let i = 0; i < 40; i++) {
    const x = Math.floor(Math.random() * W);
    const y = Math.floor(Math.random() * H);
    ctx.fillStyle = `rgba(255, 255, 255, ${(Math.random()*0.18).toFixed(2)})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawSystemText(ctx: SKRSContext2D) {
  ctx.save();
  ctx.font = "11px Arial";
  ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
  ctx.textAlign = "right"; ctx.textBaseline = "top";
  ctx.fillText("// SYS: LV-NODE-02", W-28, 28);
  ctx.fillText("0x4F574153", W-28, 44);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(34, 197, 94, 0.25)";
  ctx.fillText("SEC_LEVEL: COMMUNITY", 28, H-36);
  ctx.fillStyle = "rgba(0, 238, 255, 0.2)";
  ctx.fillText("[ SIGNAL OK ]", 28, H-22);
  ctx.restore();
}

async function drawOWASPHeader(ctx: SKRSContext2D) {
  const lx = 56, ly = 20, logoSize = 40;
  const logo = await loadImage(OWASP_LOGO);
  ctx.drawImage(logo, lx, ly, logoSize, logoSize);
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText("OWASP Las Vegas Chapter", lx + logoSize + 12, ly + logoSize / 2);
  ctx.strokeStyle = "rgba(34, 197, 94, 0.2)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(56, 68); ctx.lineTo(W-360, 68); ctx.stroke();
}

async function drawAvatarGlitch(ctx: SKRSContext2D, ax: number, ay: number, ar: number, avatarURL: string) {
  for (const [gr, ga] of [[ar+26,0.04],[ar+15,0.09],[ar+6,0.15]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(ax, ay, gr, 0, Math.PI*2);
    ctx.fillStyle = `rgba(34, 197, 94, ${ga})`; ctx.fill();
  }
  const img = await loadImage(avatarURL);
  // Solid backdrop — blocks circuit lines / noise from bleeding through
  // the screen-blend CA layers in darker avatar regions
  ctx.save();
  ctx.beginPath(); ctx.arc(ax, ay, ar+2, 0, Math.PI*2);
  ctx.fillStyle = "#060c18"; ctx.fill(); ctx.restore();
  // Chromatic aberration — red layer
  ctx.save();
  ctx.beginPath(); ctx.arc(ax+4, ay+2, ar, 0, Math.PI*2); ctx.clip();
  ctx.globalAlpha = 0.35; ctx.globalCompositeOperation = "screen";
  ctx.drawImage(img, ax-ar+4, ay-ar+2, ar*2, ar*2); ctx.restore();
  // Chromatic aberration — cyan layer
  ctx.save();
  ctx.beginPath(); ctx.arc(ax-4, ay-2, ar, 0, Math.PI*2); ctx.clip();
  ctx.globalAlpha = 0.25; ctx.globalCompositeOperation = "screen";
  ctx.drawImage(img, ax-ar-4, ay-ar-2, ar*2, ar*2); ctx.restore();
  // Normal avatar
  ctx.save();
  ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI*2); ctx.clip();
  ctx.drawImage(img, ax-ar, ay-ar, ar*2, ar*2); ctx.restore();
  // [ AUTHENTICATED ] label
  ctx.font = "bold 11px Arial"; ctx.fillStyle = "#22C55E";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("[ AUTHENTICATED ]", ax, ay+ar+10);
  // Neon ring with glow
  ctx.shadowColor = "#22C55E"; ctx.shadowBlur = 18;
  ctx.strokeStyle = "#22C55E"; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(ax, ay, ar+4, 0, Math.PI*2); ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawFeaturePills(ctx: SKRSContext2D, startX = 56) {
  const features = ["Secure Code", "Community Events", "CTFs & Workshops", "Learn & Grow"];
  ctx.font = "bold 12px Arial"; ctx.textBaseline = "middle";
  let fx = startX;
  const fy = 248, ph = 28;
  for (const label of features) {
    const pw = ctx.measureText(label).width + 28;
    rr(ctx, fx, fy, pw, ph, 4);
    ctx.fillStyle = "rgba(34, 197, 94, 0.08)"; ctx.fill();
    ctx.strokeStyle = "rgba(34, 197, 94, 0.5)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#22C55E"; ctx.fillText(label, fx+14, fy+ph/2);
    fx += pw + 12;
  }
}

// -- V1: avatar right, text left ----------------------------------------------------------

async function buildCard01(member: GuildMember): Promise<Buffer> {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");
  drawBackground(ctx); drawWatermark(ctx); drawCircuitLines(ctx); drawSkyline(ctx);
  drawScanlines(ctx); drawGlitchBars(ctx); drawCornerBrackets(ctx); drawSystemText(ctx);
  await drawOWASPHeader(ctx);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.font = "bold 44px Arial";
  fillTextCA(ctx, "Welcome,",             56, 115, "#F8FAFC");
  fillTextCA(ctx, `@${member.displayName}!`, 56, 163, "#22C55E");
  ctx.font = "24px Arial"; ctx.fillStyle = "#F8F8F8";
  ctx.fillText("We're excited to have you in our cybersecurity community.", 56, 200);
  ctx.fillText("Let's learn, build, and secure together.", 56, 222);
  drawFeaturePills(ctx, 56);
  drawDigitalNoise(ctx);
  await drawAvatarGlitch(ctx, 850, 175, 108, member.displayAvatarURL({ extension: "png", size: 256 }));
  return canvas.toBuffer("image/png");
}

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