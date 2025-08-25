"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  getDefaultProject: () => electron.ipcRenderer.invoke("project:getDefault"),
  openProject: () => electron.ipcRenderer.invoke("project:open"),
  loadProject: (dir) => electron.ipcRenderer.invoke("project:load", dir),
  saveProject: (dir, data) => electron.ipcRenderer.invoke("project:save", dir, data),
  addThumbnail: (projectDir, srcPath) => electron.ipcRenderer.invoke("thumb:add", projectDir, srcPath),
  exportHW: (projectDir) => electron.ipcRenderer.invoke("export:hw", projectDir),
  openExternal: (url) => electron.ipcRenderer.invoke("open:external", url)
});
