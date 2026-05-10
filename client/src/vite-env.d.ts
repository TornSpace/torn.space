/// <reference types="vite/client" />

// Atlases.
declare module "virtual:atlases" {
    const spritesheets: Record<import("../atlases/utils/AtlasManager.ts").Atlas, import("pixi.js").SpritesheetData[]>;
    export default spritesheets;
}
