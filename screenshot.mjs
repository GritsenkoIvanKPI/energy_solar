import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT_DIR = path.join(__dirname, "temporary screenshots");
const DEBUG_PORT = 9333;

const [, , url, label] = process.argv;
if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label] [--width=1440] [--height=900]");
  process.exit(1);
}
const widthArg = process.argv.find((a) => a.startsWith("--width="));
const heightArg = process.argv.find((a) => a.startsWith("--height="));
const width = widthArg ? parseInt(widthArg.split("=")[1], 10) : 1440;
const height = heightArg ? parseInt(heightArg.split("=")[1], 10) : 900;

fs.mkdirSync(OUT_DIR, { recursive: true });
const existing = fs
  .readdirSync(OUT_DIR)
  .map((f) => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map((m) => parseInt(m[1], 10));
const next = existing.length ? Math.max(...existing) + 1 : 1;
const filename = `screenshot-${next}${label ? "-" + label : ""}.png`;
const outPath = path.join(OUT_DIR, filename);

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForCDP() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`);
      if (res.ok) return;
    } catch {}
    await wait(250);
  }
  throw new Error("Chrome CDP endpoint never came up");
}

let idCounter = 1;
function send(ws, method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    const onMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener("message", onMessage);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      }
    };
    ws.addEventListener("message", onMessage);
    ws.send(JSON.stringify(msg));
  });
}

const userDataDir = path.join(OUT_DIR, ".chrome-profile");
fs.mkdirSync(userDataDir, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { stdio: "ignore" }
);

try {
  await waitForCDP();
  const info = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)).json();
  const browserWS = new WebSocket(info.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    browserWS.addEventListener("open", resolve, { once: true });
    browserWS.addEventListener("error", reject, { once: true });
  });

  const target = await send(browserWS, "Target.createTarget", { url: "about:blank" });
  const { targetId } = target;
  const attach = await send(browserWS, "Target.attachToTarget", { targetId, flatten: true });
  const sessionId = attach.sessionId;

  await send(browserWS, "Page.enable", {}, sessionId);
  await send(
    browserWS,
    "Emulation.setDeviceMetricsOverride",
    { width, height, deviceScaleFactor: 1, mobile: false },
    sessionId
  );

  const navigated = send(browserWS, "Page.navigate", { url }, sessionId);
  await Promise.race([
    new Promise((resolve) => {
      const handler = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === "Page.loadEventFired" && data.sessionId === sessionId) {
          browserWS.removeEventListener("message", handler);
          resolve();
        }
      };
      browserWS.addEventListener("message", handler);
    }),
    wait(15000),
  ]);
  await navigated;
  await wait(600); // settle animations/fonts

  const metrics = await send(browserWS, "Page.getLayoutMetrics", {}, sessionId);
  const fullHeight = Math.ceil(metrics.cssContentSize.height);

  // Do NOT resize the emulated viewport to fullHeight — that would recompute
  // any `vh`-based CSS against the new (huge) viewport. captureBeyondViewport
  // lets us grab the full scrollable page while keeping the original viewport
  // height intact for layout purposes.
  const shot = await send(
    browserWS,
    "Page.captureScreenshot",
    {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 },
    },
    sessionId
  );

  fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
  console.log(`Saved ${outPath} (${width}x${fullHeight})`);

  browserWS.close();
} finally {
  chrome.kill();
}
