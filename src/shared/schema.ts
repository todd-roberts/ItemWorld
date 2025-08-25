import { z } from "zod";

export const ItemType = z.enum([
  "Bed",
  "DiningChair",
  "DiningTable",
  "FloorLamp",
  "Free",
  "Plant",
  "Wall",
  "Material",
]);
export type ItemType = z.infer<typeof ItemType>;

export const Item = z.object({
  assetId: z.string().min(1),
  name: z.string().min(1),
  type: ItemType,
  vendorPrice: z.number().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  thumbnailPath: z.string().default(""),
});
export type Item = z.infer<typeof Item>;

export const Recipe = z.object({
  id: z.string().min(1),
  resultAssetId: z.string().min(1),
  ingredients: z.array(
    z.object({ assetId: z.string().min(1), qty: z.number().int().positive() })
  ),
});
export type Recipe = z.infer<typeof Recipe>;

export const Project = z.object({
  version: z.literal(1),
  items: z.array(Item),
  recipes: z.array(Recipe),
});
export type Project = z.infer<typeof Project>;
