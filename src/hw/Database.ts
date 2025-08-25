import * as hz from "horizon/core";

type HWItem = {
  assetId: string;
  name: string;
  type: string;
  vendorPrice: number;
  tags: string[];
};
type HWRecipe = {
  resultAssetId: string;
  ingredients: { assetId: string; qty: number }[];
};
type HWPayload = { v: 1; items: HWItem[]; recipes: HWRecipe[] };

export class Database extends hz.Component<typeof Database> {
  static propsDefinition = {
    database: { type: hz.PropTypes.String, default: "" },
  };

  private _items: HWItem[] = [];
  private _recipes: HWRecipe[] = [];
  private _sortedAssetIds: string[] = [];
  private _sortedIdx: number[] = [];

  start() {
    if (!this.props.database) return;
    const data = JSON.parse(this.props.database) as HWPayload;
    this._items = data.items || [];
    this._recipes = data.recipes || [];
    const pairs = this._items
      .map((it, i) => [it.assetId, i] as [string, number])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    this._sortedAssetIds = pairs.map((p) => p[0]);
    this._sortedIdx = pairs.map((p) => p[1]);
  }

  private bsearch(assetId: string) {
    let lo = 0,
      hi = this._sortedAssetIds.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const v = this._sortedAssetIds[mid];
      if (v === assetId) return this._sortedIdx[mid];
      if (v < assetId) lo = mid + 1;
      else hi = mid - 1;
    }
    return -1;
  }

  getItem(assetId: string) {
    const i = this.bsearch(assetId);
    return i >= 0 ? this._items[i] : null;
  }

  getRecipesFor(assetId: string) {
    const out: HWRecipe[] = [];
    for (let i = 0; i < this._recipes.length; i++)
      if (this._recipes[i].resultAssetId === assetId)
        out.push(this._recipes[i]);
    return out;
  }

  isPlaceableType(t: string) {
    return t !== "Material";
  }

  items() {
    return this._items;
  }
  recipes() {
    return this._recipes;
  }
}
hz.Component.register(Database);
