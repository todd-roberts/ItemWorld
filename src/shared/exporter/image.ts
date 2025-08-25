import { Jimp } from "jimp";
import fs from "fs";
import path from "path";

export async function ensureSquarePng(srcPath: string) {
  if (path.extname(srcPath).toLowerCase() !== ".png") {
    throw new Error("Thumbnail must be a PNG (.png)");
  }
  const img = await Jimp.read(srcPath);
  const w = img.width;
  const h = img.height;
  if (typeof w !== "number" || typeof h !== "number") {
    throw new Error("Could not read image dimensions");
  }
  if (w !== h) {
    throw new Error(`Thumbnail must be square (got ${w}x${h})`);
  }
}

export async function copyThumbnailTo(
  outDir: string,
  srcPath: string,
  assetId: string
) {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await ensureSquarePng(srcPath);
  const dst = path.join(outDir, `${assetId}.png`);
  fs.copyFileSync(srcPath, dst);
  return dst;
}
