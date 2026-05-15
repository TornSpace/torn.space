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
    animations: Record<string, Texture[]> = {};

    atlases = {} as Record<string, boolean>;

    loadTicker = 0;
    loaded = false;

    constructor(
        readonly app: App,
        readonly renderer: Renderer
    ) {
        this.init();
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

        this.loadSpritesheet(ironTex, this.createAtlasJSON("iron", iron, 1024, 1024, 128, 128, true), true);
        this.loadSpritesheet(silverTex, this.createAtlasJSON("silver", silver, 1024, 1024, 128, 128, true), true);
        this.loadSpritesheet(copperTex, this.createAtlasJSON("copper", copper, 1024, 1024, 128, 128, true), true);
        this.loadSpritesheet(platinumTex, this.createAtlasJSON("platinum", platinum, 1024, 1024, 128, 128, true), true);

        this.loadSpritesheet(thrustTex, this.createAtlasJSON("thrust", thrust, 64, 512, 64, 64, true), true);
        this.loadSpritesheet(explTex, this.createAtlasJSON("explosion", explosion, 1280, 1280, 128, 128, true), true);

        this.loadTexture(space, "space.img");

        for (let i = 0; i < ATLAS_LIST.length; i++) {
            const atlas = ATLAS_LIST[i];
            if (!this.isAtlasLoaded(atlas)) this.loadAtlas(atlas);
        }
    }

    /**
     * Check if an atlas has already been loaded.
     * @param name The name of the atlas.
     */
    isAtlasLoaded(name: Atlas): boolean {
        return this.atlases[name];
    }

    /**
     * Load an atlas.
     * @param name The name of the atlas.
     */
    async loadAtlas(name: Atlas): Promise<void> {
        if (this.isAtlasLoaded(name)) return;
        this.atlases[name] = this.atlases[name] || false;

        const sheets = atlasDefs[name];
        for (let i = 0; i < sheets.length; i++) {
            const sheet = sheets[i];

            const tex = await this.loadTexture(sheet.meta.image!);
            await this.loadSpritesheet(tex, sheet);
        }

        this.atlases[name] = true;
    }

    /**
     * Load a texture.
     * @param file The file to load.
     * @param alias An optional alias to set.
     */
    async loadTexture(file: string, alias?: string): Promise<Texture> {
        const res = alias ? await Assets.load<Texture>({ alias, src: file }) : await Assets.load<Texture>(file);

        return res;
    }

    /**
     * Load a spritesheet.
     * @param image The texture associated with the spritesheet.
     * @param data The spritesheet data.
     * @param animated Whether to disable registration of individual texture frames. This may not be useful, for example, if the entire spritesheet is a singular animation.
     */
    async loadSpritesheet(texture: Texture, data: SpritesheetData, animated = false): Promise<Spritesheet> {
        const sheet = new Spritesheet(texture, data);

        sheet.resolution = texture.source.resolution;
        sheet.parse();

        for (const [key, value] of Object.entries(sheet.animations)) this.animations[key] = value;
        if (!animated) for (const [key, value] of Object.entries(sheet.textures)) Assets.cache.set(key, value);

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
}
