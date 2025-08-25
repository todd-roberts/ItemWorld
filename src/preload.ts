import { contextBridge, ipcRenderer } from "electron";

import { Project } from "../src/shared/schema";

contextBridge.exposeInMainWorld("api", {
  openProject: () => ipcRenderer.invoke("project:open"),
  loadProject: (dir: string) =>
    ipcRenderer.invoke("project:load", dir) as Promise<Project>,
  saveProject: (dir: string, data: Project) =>
    ipcRenderer.invoke("project:save", dir, data),
  addThumbnail: (projectDir: string, srcPath: string) =>
    ipcRenderer.invoke("thumb:add", projectDir, srcPath) as Promise<string>,
  exportHW: (projectDir: string) => ipcRenderer.invoke("export:hw", projectDir),
});
