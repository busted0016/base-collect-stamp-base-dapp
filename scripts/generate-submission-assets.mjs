import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const root = resolve(new URL("..", import.meta.url).pathname);
const outDir = join(root, "base-submission");

const W = 1284;
const H = 2778;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lineWrap(text, maxChars) {
  const words = text.split(" ");
  const result = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      result.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) result.push(current);
  return result;
}

function boardFrame(content, bg = "#eef6f7") {
  return `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg}"/>
        <stop offset="100%" stop-color="#d8ecef"/>
      </linearGradient>
      <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
        <path d="M56 0H0V56" fill="none" stroke="#0f2a32" stroke-width="2" opacity=".08"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#grid)"/>
    ${content}
  </svg>`;
}

function header(title, subtitle) {
  const lines = lineWrap(subtitle, 32);
  return `
    <text x="64" y="108" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#0f7080">BASE COLLECT STAMP</text>
    <text x="64" y="230" font-family="Arial, sans-serif" font-size="92" font-weight="900" fill="#0f2a32">${esc(title)}</text>
    ${lines.map((line, index) => `<text x="68" y="${304 + index * 44}" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#35555c">${esc(line)}</text>`).join("")}
  `;
}

function badge(x, y, text, fill, fg = "#0f2a32") {
  return `
    <rect x="${x}" y="${y}" rx="28" width="${text.length * 16 + 64}" height="56" fill="${fill}" stroke="#0f2a32" stroke-width="3"/>
    <text x="${x + 30}" y="${y + 37}" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function themeCard(x, y, width, height, title, summary, color, active = false, check = false) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="30" fill="${color}" stroke="#0f2a32" stroke-width="4"/>
      ${active ? `<rect x="${x + 12}" y="${y + 12}" width="${width - 24}" height="${height - 24}" rx="22" fill="none" stroke="#0f2a32" stroke-width="5"/>` : ""}
      <circle cx="${x + 52}" cy="${y + 52}" r="24" fill="#fff" stroke="#0f2a32" stroke-width="3"/>
      ${check ? `<path d="M ${x + 40} ${y + 54} L ${x + 50} ${y + 64} L ${x + 68} ${y + 42}" fill="none" stroke="#0f2a32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
      <text x="${x + 34}" y="${y + 118}" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="#0f2a32">${esc(title)}</text>
      <text x="${x + 34}" y="${y + 160}" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#35555c">${esc(summary)}</text>
    </g>
  `;
}

function infoBox(x, y, width, height, title, value, note, dark = false) {
  const bg = dark ? "#0f2a32" : "#ffffff";
  const fg = dark ? "#ffffff" : "#0f2a32";
  const sub = dark ? "#cbeef1" : "#35555c";
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="32" fill="${bg}" stroke="#0f2a32" stroke-width="4"/>
      <text x="${x + 32}" y="${y + 56}" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="${sub}">${esc(title)}</text>
      <text x="${x + 32}" y="${y + 132}" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="${fg}">${esc(value)}</text>
      <text x="${x + 32}" y="${y + 186}" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="${sub}">${esc(note)}</text>
    </g>
  `;
}

function button(x, y, width, text, fill, fg = "#fff") {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="96" rx="48" fill="${fill}" stroke="#0f2a32" stroke-width="4"/>
    <text x="${x + width / 2}" y="${y + 61}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="900" fill="${fg}">${esc(text)}</text>
  `;
}

function screenshot1() {
  const content = `
    ${header("Collect the board.", "Claim themed stamps on Base and turn repeated visits into a visible set.")}
    ${badge(68, 406, "Six-theme set", "#ffd25c")}
    ${badge(278, 406, "One claim per theme", "#ffffff")}
    ${themeCard(68, 520, 356, 210, "Harbor", "Base launch dock", "#ffd25c", true)}
    ${themeCard(464, 520, 356, 210, "Signal", "Social pulse", "#8ce7ee")}
    ${themeCard(860, 520, 356, 210, "Peak", "Builder milestone", "#bfdcf6")}
    ${themeCard(68, 768, 356, 210, "Spark", "Culture moment", "#f6c8db")}
    ${themeCard(464, 768, 356, 210, "Core", "Network loyalty", "#cde8c9")}
    ${themeCard(860, 768, 356, 210, "Final", "Complete the board", "#f3d4b5")}
    ${infoBox(68, 1044, 548, 238, "Your progress", "0/6", "Your first stamp starts the set.", true)}
    ${infoBox(670, 1044, 546, 238, "Selected theme", "Harbor", "Start with the launch dock stamp.")}
    <rect x="68" y="1344" width="1148" height="408" rx="34" fill="#ffffff" stroke="#0f2a32" stroke-width="4"/>
    <text x="104" y="1420" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#0f7080">How it works</text>
    <text x="104" y="1496" font-family="Arial, sans-serif" font-size="44" font-weight="900" fill="#0f2a32">Pick a theme, claim the stamp, fill the collection.</text>
    <text x="104" y="1570" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#35555c">The action is simple enough for mobile, but still feels like real progress.</text>
    <text x="104" y="1630" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#35555c">Each wallet can unlock each stamp once, creating a clean collectible loop.</text>
    ${button(68, 2522, 1148, "Connect wallet to start collecting", "#0f2a32")}
  `;
  return boardFrame(content);
}

function screenshot2() {
  const content = `
    ${header("Claim a theme.", "Connected wallet, selected route, and a clear action to add the next stamp.")}
    ${badge(68, 406, "0x9936...9652 connected", "#0f2a32", "#fff")}
    ${badge(390, 406, "Base mainnet", "#cde8c9")}
    ${themeCard(68, 520, 356, 210, "Harbor", "Base launch dock", "#ffd25c", true, true)}
    ${themeCard(464, 520, 356, 210, "Signal", "Social pulse", "#8ce7ee")}
    ${themeCard(860, 520, 356, 210, "Peak", "Builder milestone", "#bfdcf6")}
    ${themeCard(68, 768, 356, 210, "Spark", "Culture moment", "#f6c8db")}
    ${themeCard(464, 768, 356, 210, "Core", "Network loyalty", "#cde8c9")}
    ${themeCard(860, 768, 356, 210, "Final", "Complete the board", "#f3d4b5")}
    ${infoBox(68, 1044, 548, 248, "Your progress", "1/6", "Harbor is already unlocked.", true)}
    ${infoBox(670, 1044, 546, 248, "Selected theme", "Signal", "The social pulse stamp is ready to claim.")}
    <rect x="68" y="1362" width="1148" height="324" rx="34" fill="#0f2a32"/>
    <text x="104" y="1440" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#8ce7ee">Claim status</text>
    <text x="104" y="1514" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#fff">Wallet confirmation requested for the Signal stamp.</text>
    <text x="104" y="1578" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#cbeef1">Once confirmed, the stamp board updates and your progress ring advances.</text>
    ${button(68, 2522, 1148, "Claim Signal stamp", "#ffd25c", "#0f2a32")}
  `;
  return boardFrame(content, "#edf7f8");
}

function screenshot3() {
  const content = `
    ${header("Board in motion.", "Unlocked stamps, rising completion, and a collection that rewards repeat visits.")}
    ${badge(68, 406, "3/6 unlocked", "#cde8c9")}
    ${badge(296, 406, "Theme claimed on Base", "#0f2a32", "#fff")}
    ${themeCard(68, 520, 356, 210, "Harbor", "Base launch dock", "#ffd25c", false, true)}
    ${themeCard(464, 520, 356, 210, "Signal", "Social pulse", "#8ce7ee", false, true)}
    ${themeCard(860, 520, 356, 210, "Peak", "Builder milestone", "#bfdcf6", true, true)}
    ${themeCard(68, 768, 356, 210, "Spark", "Culture moment", "#f6c8db")}
    ${themeCard(464, 768, 356, 210, "Core", "Network loyalty", "#cde8c9")}
    ${themeCard(860, 768, 356, 210, "Final", "Complete the board", "#f3d4b5")}
    ${infoBox(68, 1044, 548, 248, "Progress", "50%", "Half the board is complete.", true)}
    ${infoBox(670, 1044, 546, 248, "Peak claims", "148", "Wallets that reached this milestone.")}
    <rect x="68" y="1362" width="1148" height="420" rx="34" fill="#ffffff" stroke="#0f2a32" stroke-width="4"/>
    <text x="104" y="1438" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#0f7080">Why it fits Base App</text>
    <text x="104" y="1516" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#0f2a32">Short action, visible progress, easy return loop.</text>
    <text x="104" y="1592" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#35555c">Users understand the point immediately: pick a route, claim a mark, fill the board.</text>
    <text x="104" y="1652" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#35555c">Builder Code attribution travels with the claim transaction.</text>
    ${button(68, 2522, 1148, "Share your stamp progress", "#0f2a32")}
  `;
  return boardFrame(content, "#e8f4f5");
}

function iconSvg() {
  return `
  <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
    <rect width="1024" height="1024" fill="#eef6f7"/>
    <rect x="122" y="122" width="780" height="780" rx="88" fill="#ffffff" stroke="#0f2a32" stroke-width="28"/>
    <rect x="196" y="210" width="264" height="210" rx="30" fill="#ffd25c" stroke="#0f2a32" stroke-width="18"/>
    <rect x="510" y="210" width="264" height="210" rx="30" fill="#8ce7ee" stroke="#0f2a32" stroke-width="18"/>
    <rect x="196" y="474" width="264" height="210" rx="30" fill="#bfdcf6" stroke="#0f2a32" stroke-width="18"/>
    <rect x="510" y="474" width="264" height="210" rx="30" fill="#f6c8db" stroke="#0f2a32" stroke-width="18"/>
    <rect x="196" y="738" width="578" height="64" rx="24" fill="#0f2a32"/>
    <text x="485" y="783" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="900" fill="#fff">STAMP BOARD</text>
  </svg>`;
}

function thumbnailSvg() {
  return `
  <svg width="1910" height="1000" viewBox="0 0 1910 1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#eef6f7"/>
        <stop offset="100%" stop-color="#d8ecef"/>
      </linearGradient>
    </defs>
    <rect width="1910" height="1000" fill="url(#bg)"/>
    <text x="96" y="200" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="#0f2a32">Base Collect Stamp</text>
    <text x="100" y="294" font-family="Arial, sans-serif" font-size="46" font-weight="800" fill="#35555c">Claim themed stamps on Base and complete a collectible board.</text>
    ${badge(100, 348, "Repeat-visit progression", "#ffd25c")}
    ${button(100, 448, 420, "Pick a theme", "#0f2a32")}
    ${button(556, 448, 420, "Claim stamp", "#ffd25c", "#0f2a32")}
    ${themeCard(1190, 120, 290, 196, "Harbor", "Launch dock", "#ffd25c", true, true)}
    ${themeCard(1510, 120, 290, 196, "Signal", "Social pulse", "#8ce7ee", false, true)}
    ${themeCard(1190, 346, 290, 196, "Peak", "Milestone", "#bfdcf6")}
    ${themeCard(1510, 346, 290, 196, "Spark", "Culture", "#f6c8db")}
    ${infoBox(1110, 620, 690, 220, "Progress", "3/6", "Half the board is filled.", true)}
  </svg>`;
}

async function writePng(name, svg, width = W, height = H) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(file);
  return file;
}

async function writeJpg(name, svg, width, height) {
  const file = join(outDir, name);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);
  return file;
}

await mkdir(outDir, { recursive: true });

const files = [
  await writeJpg("app-icon.jpg", iconSvg(), 1024, 1024),
  await writeJpg("app-thumbnail.jpg", thumbnailSvg(), 1910, 1000),
  await writePng("screenshot-1.png", screenshot1()),
  await writePng("screenshot-2.png", screenshot2()),
  await writePng("screenshot-3.png", screenshot3()),
];

await writeFile(
  join(outDir, "asset-manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      files: files.map((file) => file.replace(`${root}/`, "")),
      screenshotSize: "1284x2778",
      thumbnailAspectRatio: "1.91:1",
    },
    null,
    2,
  ),
);

console.log(files.join("\n"));
