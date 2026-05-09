/*
 * torn.space
 * Copyright (C) 2026 DamienVesper
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// TODO: Try and make this actually work.
// import atlasDefs from "virtual-atlases";

import Explosions from "$lib/img/explosions/explosions.png";
import { Assets, type SpritesheetData, type SpritesheetFrameData, type UnresolvedAsset } from "pixi.js";

import type { App } from "../App.svelte";

/**
 * Manages IMAGE-related assets only.
 */
export class AssetManager {
    assets: Record<string, any> = {};

    loadTicker = 0;
    loaded = false;

    constructor(public app: App) {
        this.init();
    }

    async init(): Promise<void> {
        // Load spritesheets.
        const atlases = this.importGlob(
            import.meta.glob(["/node_modules/.atlas-cache/atlases/**/*.json", "/src/lib/img/**/*.json"], {
                query: "?url",
                eager: true
            })
        );

        this.assets = (await Assets.load(atlases, progress => {
            this.loadTicker = progress;
        }).catch(err => console.error(err))) as Promise<AssetManager["assets"]>;
    }

    /**
     * Create a spritesheet JSON given some parameters. Expects a square atlas image.
     * @param name The name of the spritesheet.
     * @param texture The name of the image associated with the spritesheet.
     * @param atlasWidth The width of the atlas.
     * @param spriteWidth The width of an individual sprite in the atlas.
     */
    squareAtlasJSON(name: string, texture: string, atlasWidth: number, spriteWidth: number): SpritesheetData {
        const imgFrames: Record<string, SpritesheetFrameData> = {};
        const computedSpacing = atlasWidth / spriteWidth;

        for (let i = 0; i < computedSpacing; i++) {
            for (let j = 0; j < computedSpacing; j++) {
                imgFrames[`${name}${j + i * spriteWidth}`] = {
                    frame: {
                        x: j * computedSpacing,
                        y: i * computedSpacing,
                        w: spriteWidth,
                        h: spriteWidth
                    },
                    rotated: false,
                    trimmed: true,
                    spriteSourceSize: {
                        x: j * computedSpacing,
                        y: i * computedSpacing,
                        w: spriteWidth,
                        h: spriteWidth
                    },
                    sourceSize: {
                        w: spriteWidth,
                        h: spriteWidth
                    }
                };
            }
        }

        return {
            meta: {
                image: texture,
                size: {
                    w: atlasWidth,
                    h: atlasWidth
                },
                scale: 1
            },
            frames: imgFrames,
            animations: {
                [name]: [...Object.keys(imgFrames)]
            }
        };
    }

    importGlob<T = string>(glob: Record<string, { default: T }>): T[] {
        return [...Object.values(glob)].map(asset => asset.default);
    }
}
