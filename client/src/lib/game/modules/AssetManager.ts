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

import copper from "$lib/img/asteroids/copper.png";
import iron from "$lib/img/asteroids/iron.png";
import platinum from "$lib/img/asteroids/platinum.png";
import silver from "$lib/img/asteroids/silver.png";
import space from "$lib/img/ui/backgrounds/space.png";
import stars from "$lib/img/ui/backgrounds/stars.png";
import explosion from "$lib/img/weapons/misc/explosions.png";
import thrust from "$lib/img/weapons/misc/thrust.png";
import { Assets, Spritesheet, Texture, type Renderer, type SpritesheetData, type SpritesheetFrameData } from "pixi.js";
import atlasDefs from "virtual:atlases";

import type { Atlas } from "../../../../atlases/utils/AtlasManager";
import type { App } from "../App.svelte";

const ATLAS_LIST: Atlas[] = ["main"];

/**
 * Manages IMAGE-related assets only.
 */
export class AssetManager {
    assets: Record<string, Spritesheet | Texture> = {};

    atlases = {} as Record<string, { loaded: boolean; spritesheets: Spritesheet[] }>;

    loadTicker = 0;
    loaded = false;

    constructor(
        readonly app: App,
        readonly renderer: Renderer
    ) {
        this.init();
    }

    /**
     * Get an asset in the registry.
     * @param name The name of the asset.
     * @returns
     */
    getAsset<T extends Spritesheet | Texture>(name: string): T {
        return this.assets[name] as T;
    }

    /**
     * Save an asset to the registry.
     * @param path The path to the asset.
     * @param file The asset.
     * @param useExt Whether to use the `.img` extension or drop it entirely.
     */
    saveAsset<T extends Spritesheet | Texture>(path: string, file: T, useExt = true): void {
        const name = path.split("/").pop()!;
        const ext = name.split(".").pop()!;
        this.assets[useExt ? name.replace(ext, "img") : name.replace(`.${ext}`, "")] = file;
    }

    /**
     * Load all assets. This should only be called once!
     */
    async init(): Promise<void> {
        const ironTex = await this.loadTexture(iron);
        const silverTex = await this.loadTexture(silver);
        const copperTex = await this.loadTexture(copper);
        const platinumTex = await this.loadTexture(platinum);

        const thrustTex = await this.loadTexture(thrust);
        const explTex = await this.loadTexture(explosion);

        await this.loadSpritesheet(ironTex, this.createAtlasJSON("iron", iron, 1024, 1024, 128, 128, true), true);
        await this.loadSpritesheet(silverTex, this.createAtlasJSON("silver", silver, 1024, 1024, 128, 128, true), true);
        await this.loadSpritesheet(copperTex, this.createAtlasJSON("copper", copper, 1024, 1024, 128, 128, true), true);
        await this.loadSpritesheet(
            platinumTex,
            this.createAtlasJSON("platinum", platinum, 1024, 1024, 128, 128, true),
            true
        );

        await this.loadSpritesheet(thrustTex, this.createAtlasJSON("thrust", thrust, 64, 512, 64, 64, true), true);
        await this.loadSpritesheet(
            explTex,
            this.createAtlasJSON("explosion", explosion, 1280, 1280, 128, 128, true),
            true
        );

        await this.loadTexture(space, true);
        await this.loadTexture(stars, true);

        for (let i = 0; i < ATLAS_LIST.length; i++) {
            const atlas = ATLAS_LIST[i];
            if (!this.isAtlasLoaded(atlas)) {
                this.loadAtlas(atlas);
            }
        }
    }

    /**
     * Check if an atlas has already been loaded.
     * @param name The name of the atlas.
     */
    isAtlasLoaded(name: Atlas): boolean {
        return this.atlases[name]?.loaded;
    }

    /**
     * Load an atlas.
     * @param name The name of the atlas.
     */
    async loadAtlas(name: Atlas): Promise<void> {
        if (this.isAtlasLoaded(name)) return;
        this.atlases[name] = this.atlases[name] || {
            loaded: false,
            spritesheets: []
        };

        const sheets = atlasDefs[name];
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];

            const tex = await this.loadTexture(sheet.meta.image!);
            const atlas = await this.loadSpritesheet(tex, sheet);

            this.atlases[name].spritesheets.push(atlas);
        }

        this.atlases[name].loaded = true;
    }

    /**
     * Load a texture.
     * @param file The file to load.
     * @param register Whether to register the asset.
     */
    async loadTexture(file: string, register = false): Promise<Texture> {
        const res = await Assets.load<Texture>(file);
        if (register) this.saveAsset(file, res);

        this.renderer.texture.initSource(res.source);
        return res;
    }

    /**
     * Load a spritesheet.
     * @param image The texture associated with the spritesheet.
     * @param data The spritesheeet data.
     * @param register Whether to register the asset.
     */
    async loadSpritesheet(texture: Texture, data: SpritesheetData, register = false): Promise<Spritesheet> {
        const sheet = new Spritesheet(texture, data);

        sheet.resolution = texture.source.resolution;
        sheet.parse();

        if (register) this.saveAsset(sheet.data.meta.image!, sheet, false);
        return sheet;
    }

    /**
     * Create an animated spritesheet JSON given some parameters.
     * @param name The name of the spritesheet.
     * @param texture The name of the image associated with the spritesheet.
     * @param aw The width of the atlas.
     * @param ah The height of the atlas.
     * @param sw The width of an individual sprite in the atlas.
     * @param sw The height of an individual sprite in the atlas.
     * @param animated Whether the sprites make up a single animation.
     */
    createAtlasJSON(
        name: string,
        texture: string,
        aw: number,
        ah: number,
        sw: number,
        sh: number,
        animated?: boolean
    ): SpritesheetData {
        const imgFrames: Record<string, SpritesheetFrameData> = {};

        const sx = aw / sw;
        const sy = ah / sh;

        for (let i = 0; i < sy; i++) {
            for (let j = 0; j < sx; j++) {
                imgFrames[`${name}${j + i * sy}`] = {
                    frame: {
                        x: j * sx,
                        y: i * sy,
                        w: sw,
                        h: sh
                    },
                    rotated: false,
                    trimmed: false,
                    spriteSourceSize: {
                        x: 0,
                        y: 0,
                        w: sw,
                        h: sh
                    },
                    sourceSize: {
                        w: sw,
                        h: sh
                    }
                };
            }
        }

        // to avoid writing { animations: undefined }
        const res: SpritesheetData = {
            meta: {
                image: texture,
                size: {
                    w: aw,
                    h: ah
                },
                scale: 1
            },
            frames: imgFrames
        };

        if (animated) Object.assign(res, { [name]: [...Object.keys(imgFrames)] });
        return res;
    }

    importGlob<T = string>(glob: Record<string, { default: T }>): T[] {
        return [...Object.values(glob)].map(asset => asset.default);
    }
}
