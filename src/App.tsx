import type { Item, Project, Recipe } from "./shared/schema";
import { useEffect, useMemo, useState } from "react";

const itemTypeOptions = ["Bed","DiningChair","DiningTable","FloorLamp","Free","Plant","Wall","Material"] as const;

export default function App() {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [project, setProject] = useState<Project>({ version: 1, items: [], recipes: [] });
  const [tab, setTab] = useState<"items" | "recipes">("items");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    document.title = "Item World Database";
    (async () => {
      const dir = await window.api.getDefaultProject();
      const data = await window.api.loadProject(dir);
      setProjectDir(dir);
      setProject(data);
      setStatus(`Project: ${dir}`);
    })();
  }, []);

  const canExport = useMemo(() => projectDir !== null && project.items.some(i => i.assetId.trim().length > 0), [projectDir, project]);

  const save = async () => {
    if (!projectDir) return;
    await window.api.saveProject(projectDir, project);
    setStatus("Saved");
    setTimeout(() => setStatus(projectDir ? `Project: ${projectDir}` : ""), 800);
  };

  const exportHW = async () => {
    if (!projectDir) return;
    const res = await window.api.exportHW(projectDir);
    setStatus(`Exported to ${res.outDir}`);
  };

  const addItem = () => {
    const next: Item = { assetId: "", name: "", type: "Free", vendorPrice: 0, tags: [], thumbnailPath: "" };
    setProject(p => ({ ...p, items: [...p.items, next] }));
  };

  const updateItem = (idx: number, patch: Partial<Item>) => {
    setProject(p => {
      const items = p.items.slice();
      items[idx] = { ...items[idx], ...patch };
      return { ...p, items };
    });
  };

  const removeItem = (idx: number) => {
    setProject(p => {
      const id = p.items[idx]?.assetId;
      const items = p.items.filter((_, i) => i !== idx);
      const recipes = id ? p.recipes.map(r => ({ ...r, ingredients: r.ingredients.filter(g => g.assetId !== id) })) : p.recipes;
      return { ...p, items, recipes };
    });
  };

  const onPickThumb = async (idx: number, file: File) => {
    if (!projectDir) return;
    const f = file as File & { path?: string };
    if (!f.path) {
      setStatus("File path unavailable");
      return;
    }
    try {
      const rel = await window.api.addThumbnail(projectDir, f.path);
      updateItem(idx, { thumbnailPath: rel });
      setStatus("Thumbnail added");
    } catch (e) {
      setStatus(String(e));
    }
  };

  const addRecipe = () => {
    const next: Recipe = { id: crypto.randomUUID(), resultAssetId: "", ingredients: [] };
    setProject(p => ({ ...p, recipes: [...p.recipes, next] }));
  };

  const updateRecipe = (idx: number, patch: Partial<Recipe>) => {
    setProject(p => {
      const recipes = p.recipes.slice();
      recipes[idx] = { ...recipes[idx], ...patch };
      return { ...p, recipes };
    });
  };

  const removeRecipe = (idx: number) => {
    setProject(p => ({ ...p, recipes: p.recipes.filter((_, i) => i !== idx) }));
  };

  const addIngredient = (ridx: number) => {
    const r = project.recipes[ridx];
    if (!r) return;
    const next = { assetId: "", qty: 1 };
    const ingredients = r.ingredients.concat([next]);
    updateRecipe(ridx, { ingredients });
  };

  const updateIngredient = (ridx: number, gidx: number, patch: Partial<{ assetId: string; qty: number }>) => {
    const r = project.recipes[ridx];
    if (!r) return;
    const ingredients = r.ingredients.slice();
    ingredients[gidx] = { ...ingredients[gidx], ...patch };
    updateRecipe(ridx, { ingredients });
  };

  const removeIngredient = (ridx: number, gidx: number) => {
    const r = project.recipes[ridx];
    if (!r) return;
    const ingredients = r.ingredients.filter((_, i) => i !== gidx);
    updateRecipe(ridx, { ingredients });
  };

  const topbar = {
    display: "grid",
    gridTemplateColumns: "auto auto auto 1fr",
    gap: 8,
    alignItems: "center",
    padding: "12px 20px",
    background: "linear-gradient(90deg,#1f1b2e,#2d2650)",
    color: "#fff",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  };
  const btnPrimary = {
    background: "#6b5cff",
    color: "#fff",
    border: 0,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  } as const;
  const btn = {
    background: "#f0f2f7",
    color: "#222",
    border: 0,
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  } as const;

  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui", minHeight: "100vh", background: "#f6f7fb" }}>
      <div style={topbar}>
        <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>Item World Database</div>
        <button style={btn} onClick={() => setTab("items")} disabled={tab==="items"}>Items</button>
        <button style={btn} onClick={() => setTab("recipes")} disabled={tab==="recipes"}>Recipes</button>
        <div style={{ justifySelf: "end", opacity: 0.9 }}>{status}</div>
      </div>

      <div style={{ width: "min(1600px, 96vw)", margin: "16px auto", padding: "0 8px", display: "grid", gap: 18 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnPrimary} onClick={save} disabled={!projectDir}>Save</button>
          <button style={btnPrimary} onClick={exportHW} disabled={!canExport}>Export for HW</button>
        </div>

        {tab === "items" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <button style={btn} onClick={addItem} disabled={!projectDir}>Add Item</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {project.items.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#fff",
                    border: "1px solid #e7e9f3",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr 0.8fr 140px 1fr 320px auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <input placeholder="assetId" value={it.assetId} onChange={e => updateItem(idx, { assetId: e.target.value })} />
                  <input placeholder="name" value={it.name} onChange={e => updateItem(idx, { name: e.target.value })} />
                  <select value={it.type} onChange={e => updateItem(idx, { type: e.target.value as Item["type"] })}>
                    {itemTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="number" placeholder="vendorPrice" value={it.vendorPrice} onChange={e => updateItem(idx, { vendorPrice: Number(e.target.value) })} />
                  <input placeholder="tags comma-separated" value={it.tags.join(", ")} onChange={e => updateItem(idx, { tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="file" accept="image/png" onChange={e => e.currentTarget.files && onPickThumb(idx, e.currentTarget.files[0])} />
                    <span style={{ fontSize: 12, opacity: 0.7, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 260 }}>
                      {it.thumbnailPath || "no thumbnail"}
                    </span>
                  </div>
                  <button style={btn} onClick={() => removeItem(idx)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "recipes" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <button style={btn} onClick={addRecipe} disabled={!projectDir}>Add Recipe</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {project.recipes.map((r, ridx) => (
                <div key={r.id} style={{ background: "#fff", border: "1px solid #e7e9f3", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                    <input placeholder="result assetId" value={r.resultAssetId} onChange={e => updateRecipe(ridx, { resultAssetId: e.target.value })} />
                    <button style={btn} onClick={() => removeRecipe(ridx)}>Delete Recipe</button>
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {r.ingredients.map((g, gidx) => (
                      <div key={gidx} style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 8 }}>
                        <input placeholder="ingredient assetId" value={g.assetId} onChange={e => updateIngredient(ridx, gidx, { assetId: e.target.value })} />
                        <input type="number" min={1} value={g.qty} onChange={e => updateIngredient(ridx, gidx, { qty: Math.max(1, Number(e.target.value)) })} />
                        <button style={btn} onClick={() => removeIngredient(ridx, gidx)}>Remove</button>
                      </div>
                    ))}
                    <button style={btn} onClick={() => addIngredient(ridx)}>Add Ingredient</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
