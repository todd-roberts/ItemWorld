import { Project, Project as ProjectSchema } from "../src/shared/schema";

import fs from "fs";
import path from "path";

export function ensureProject(projectDir: string) {
  const f = path.join(projectDir, "db.json");
  if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });
  if (!fs.existsSync(f))
    fs.writeFileSync(f, JSON.stringify({ version: 1, items: [], recipes: [] }));
  const thumbs = path.join(projectDir, "assets", "thumbnails");
  if (!fs.existsSync(thumbs)) fs.mkdirSync(thumbs, { recursive: true });
  return f;
}

export function loadProject(projectDir: string) {
  const f = ensureProject(projectDir);
  const raw = fs.readFileSync(f, "utf8");
  return ProjectSchema.parse(JSON.parse(raw));
}

export function saveProject(projectDir: string, data: Project) {
  const f = ensureProject(projectDir);
  fs.writeFileSync(f, JSON.stringify(data));
}

export function projectThumbsDir(projectDir: string) {
  return path.join(projectDir, "assets", "thumbnails");
}
