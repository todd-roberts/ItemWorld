import { copyThumbnailTo, ensureSquarePng } from "./image";

import { Project } from "../schema";
import fs from "fs";
import path from "path";

export async function exportProjectAsHWJsonSingle(
  p: Project,
  projectDir: string,
  outDir: string
) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const thumbsOut = path.join(outDir, "thumbnails");
  if (!fs.existsSync(thumbsOut)) fs.mkdirSync(thumbsOut, { recursive: true });

  const seen = new Set<string>();
  const items = p.items.filter((i) => {
    const ok = i.assetId && !seen.has(i.assetId);
    if (ok) seen.add(i.assetId);
    return ok;
  });
  const recipes = p.recipes.filter(
    (r) => r.resultAssetId && r.ingredients.every((g) => !!g.assetId)
  );

  for (const it of items) {
    if (it.thumbnailPath) {
      const abs = path.resolve(projectDir, it.thumbnailPath);
      if (fs.existsSync(abs)) await copyThumbnailTo(thumbsOut, abs, it.assetId);
    }
  }

  const payload = {
    v: 1,
    items: items.map((i) => ({
      assetId: i.assetId,
      name: i.name,
      type: i.type,
      vendorPrice: i.vendorPrice,
      tags: i.tags,
    })),
  };
  const payload2 = {
    v: 1,
    recipes: recipes.map((r) => ({
      resultAssetId: r.resultAssetId,
      ingredients: r.ingredients,
    })),
  };

  const database = JSON.stringify({
    v: 1,
    items: payload.items,
    recipes: payload2.recipes,
  });
  const databaseFile = path.join(outDir, "database.txt");
  fs.writeFileSync(databaseFile, database);

  return { outDir, databaseFile, thumbnailsDir: thumbsOut };
}
