import { BrowserWindow, Menu, app, dialog, ipcMain, shell } from "electron";
import {
  ensureProject,
  loadProject,
  projectThumbsDir,
  saveProject,
} from "./fsdb";
import path, { join } from "path";

import type { Project } from "../src/shared/schema";
import { ensureSquarePng } from "../src/shared/exporter/image";
import { exportProjectAsHWJsonSingle } from "../src/shared/exporter/hwJson";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST_ELECTRON = __dirname;
process.env.DIST = join(__dirname, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(__dirname, "../public")
  : process.env.DIST;

let win: BrowserWindow | null = null;

function setMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac
      ? [
          {
            label: "Item World Database",
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),
    { role: "fileMenu" as const },
    {
      label: "Help",
      submenu: [
        {
          label: "ItemWorld GitHub",
          click: () =>
            shell.openExternal("https://github.com/todd-roberts/ItemWorld"),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  setMenu();

  const preload = join(__dirname, "preload.js");
  const url = process.env.VITE_DEV_SERVER_URL;
  const indexHtml = join(process.env.DIST!, "index.html");

  win = new BrowserWindow({
    title: "Item World Database",
    width: 1400,
    height: 900,
    webPreferences: { preload },
  });

  if (url) await win.loadURL(url);
  else await win.loadFile(indexHtml);

  win.setTitle("Item World Database");
}

app.whenReady().then(createWindow).catch(console.error);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("project:getDefault", async () => {
  const base = app.getPath("userData");
  const dir = path.join(base, "ItemWorldProject");
  ensureProject(dir);
  return dir;
});

ipcMain.handle("project:open", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (res.canceled || res.filePaths.length === 0) return null;
  const dir = res.filePaths[0];
  ensureProject(dir);
  return dir;
});

ipcMain.handle("project:load", async (_e, dir: string) => loadProject(dir));

ipcMain.handle("project:save", async (_e, dir: string, data: Project) => {
  saveProject(dir, data);
  return true;
});

ipcMain.handle("thumb:add", async (_e, projectDir: string, srcPath: string) => {
  await ensureSquarePng(srcPath);
  const thumbs = projectThumbsDir(projectDir);
  if (!fs.existsSync(thumbs)) fs.mkdirSync(thumbs, { recursive: true });
  const base = path.basename(srcPath);
  const dst = path.join(thumbs, base);
  fs.copyFileSync(srcPath, dst);
  return path.relative(projectDir, dst).replace(/\\/g, "/");
});

ipcMain.handle("export:hw", async (_e, projectDir: string) => {
  const p = loadProject(projectDir);
  const outDir = path.join(projectDir, "exports", "hw");
  return exportProjectAsHWJsonSingle(p, projectDir, outDir);
});
