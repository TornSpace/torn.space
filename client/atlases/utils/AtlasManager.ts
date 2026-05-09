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

import { existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join, resolve } from "node:path";

import { ImageManager } from "./ImageManager";

import { Logger } from "../../../common/src/utils/Logger";
import { util } from "../../../common/src/utils/util";
import { MainAtlas } from "../defs/MainAtlas";

import type { AtlasDef } from "../AtlasDef";
import type { Atlases, MainToWorkerMsg, WorkerToMainMsg } from "./atlasWorker";
import type { SpritesheetData } from "pixi.js";

export class AtlasManager {
    /**
     * Increment this each time output-related logic is modified to invalidate old cache.
     */
    static readonly ATLAS_HASH_VERSION = 1;

    static readonly imgFolder = resolve(import.meta.dirname, "../../src/lib/img");
    static readonly cacheFolder = resolve(import.meta.dirname, "../../node_modules/.atlas-cache");

    static readonly imgCacheFolder = join(this.cacheFolder, "img");
    static readonly atlasCacheFolder = join(this.cacheFolder, "atlases");

    static readonly imgCacheFile = join(this.cacheFolder, "img-cache.json");

    static readonly hasher = new Bun.CryptoHasher("sha256");

    static readonly atlases: Record<Atlas, AtlasDef> = {
        main: MainAtlas
    };

    readonly logger = new Logger({
        timestamp: false,
        info: true,
        debug: true,
        warn: true,
        error: true
    });

    readonly imageManager;

    atlasCache = {} as Record<Atlas, string>;

    // Plugin-related stuff.
    atlasesJSON = {} as Record<string, SpritesheetData[]>;
    buildPromise: Promise<void> | undefined = undefined;
    rebuildTimeout!: ReturnType<typeof setTimeout>;

    constructor() {
        this.imageManager = new ImageManager(this.logger);

        if (!existsSync(AtlasManager.imgCacheFolder)) {
            mkdirSync(AtlasManager.imgCacheFolder, {
                recursive: true
            });
        }
    }

    getAtlasFolderPath(atlas: Atlas, hash: string): string {
        return join(AtlasManager.atlasCacheFolder, `${atlas}-${hash}`);
    }

    async getAtlas(atlas: Atlas): Promise<SpritesheetData[]> {
        const hash = this.atlasCache[atlas];
        const folder = this.getAtlasFolderPath(atlas, hash);

        let paths = readdirSync(folder).filter(x => x.endsWith(".json"));
        if (paths.length === 0) {
            await this.buildAtlases([{ name: atlas, hash }]);
            paths = readdirSync(folder).filter(x => x.endsWith(".json"));
        }

        const spritesheets: SpritesheetData[] = [];
        for (const path of paths) {
            const file = Bun.file(join(folder, path));
            spritesheets.push(await file.json());
        }

        return spritesheets;
    }

    async hashAtlas(atlas: Atlas): Promise<string> {
        const def = AtlasManager.atlases[atlas];
        const images = new Map<string, boolean>();

        let atlasHash = `${AtlasManager.ATLAS_HASH_VERSION}`;

        for (let i = 0; i < def.images.length; i++) {
            const image = def.images[i];
            if (images.has(image)) this.logger.warn("Atlas", `Atlas ${atlas} has duplicated sprite ${image}.`);

            images.set(image, true);
        }

        for (const image of def.images) {
            const path = join(AtlasManager.imgFolder, image);
            const file = Bun.file(path);

            if (!(await file.exists())) {
                this.logger.error("Atlas", `File "${path}" does not exist.`);
                continue;
            }

            const data = await file.arrayBuffer();
            const hash = AtlasManager.hasher.update(data).digest("hex");

            const cachedImg = Bun.file(join(AtlasManager.imgCacheFolder, `${hash}.png`));
            if (this.imageManager.get(path)?.hash !== hash || !(await cachedImg.exists())) {
                this.imageManager.queueImage(path, hash);
            }

            atlasHash += hash;
        }

        return AtlasManager.hasher.update(atlasHash).digest("hex");
    }

    async getChangedAtlases(): Promise<Atlases[]> {
        const changedAtlases: Atlases[] = [];

        for (const atlas of Object.keys(AtlasManager.atlases) as Atlas[]) {
            const hash = await this.hashAtlas(atlas);
            this.atlasCache[atlas] = hash;

            const path = this.getAtlasFolderPath(atlas, hash);
            if (!existsSync(path) || readdirSync(path).filter(x => x.endsWith(".json")).length === 0) {
                changedAtlases.push({ name: atlas, hash });
            }
        }

        return changedAtlases;
    }

    async buildChangedAtlases(): Promise<void> {
        const changedAtlases = await this.getChangedAtlases();
        if (changedAtlases.length) {
            this.logger.info("Atlas", `Building atlases ${changedAtlases.map(a => a.name).join(", ")}.`);
            await this.buildAtlases(changedAtlases);

            if (Math.random() < 0.2) this.clearCache();
        } else this.logger.info("Atlas", "No atlases to build.");
    }

    async clearCache(): Promise<void> {
        await this.imageManager.clearCache();

        if (!existsSync(AtlasManager.atlasCacheFolder)) {
            mkdirSync(AtlasManager.atlasCacheFolder);
            return;
        }

        const files = readdirSync(AtlasManager.atlasCacheFolder);
        const validCachedImages = new Set(Object.entries(this.atlasCache).map(([key, value]) => `${key}-${value}`));

        let atlasesRemoved = 0;
        for (const folder of files) {
            const path = join(AtlasManager.atlasCacheFolder, folder);

            const stat = statSync(path);
            const date = Date.now() - stat.atimeMs;

            // Remove files that have been invalidated and are over 7 days old.
            if (date > util.daysToMs(7)) {
                const existsInCache = validCachedImages.has(folder);

                if (!existsInCache) {
                    atlasesRemoved++;
                    rmSync(path, {
                        recursive: true
                    });
                }
            }
        }

        if (atlasesRemoved > 0) {
            this.logger.info("Atlas", `Cleaned ${atlasesRemoved} old atlases from cache.`);
        }
    }

    async buildAtlases(queuedAtlases: Array<{ name: Atlas; hash: string }>): Promise<void> {
        await this.imageManager.renderImages();

        const start = Date.now();

        let threadsLeft = Math.max(availableParallelism() - 2, 1);
        let atlasesPerThread = Math.ceil(queuedAtlases.length / threadsLeft);

        const promises: Array<Promise<void>> = [];
        const count = queuedAtlases.length;

        let workers = 0;
        while (queuedAtlases.length) {
            threadsLeft--;
            workers++;

            const atlases = queuedAtlases.splice(0, atlasesPerThread);
            atlasesPerThread = Math.ceil(queuedAtlases.length / threadsLeft);

            const promise = new Promise<void>(resolvePromise => {
                const proc = Bun.spawn(["bun", resolve(import.meta.dirname, "atlasWorker.ts")], {
                    ipc: (msg: WorkerToMainMsg, _subprocess, _handle) => {
                        const data = msg;

                        for (const atlas of data) {
                            const atlasPath = this.getAtlasFolderPath(atlas.name, atlas.hash);

                            mkdirSync(atlasPath, { recursive: true });
                            promises.push(promise);

                            for (let i = 0; i < atlas.data.length; i++) {
                                const sheet = atlas.data[i];
                                const filePath = join(atlasPath, sheet.data.meta.image!);

                                writeFileSync(filePath, Buffer.from(sheet.buffer));
                                writeFileSync(join(atlasPath, `${atlas.name}-${i}.json`), JSON.stringify(sheet.data));
                            }
                        }

                        proc.kill();
                        resolvePromise();
                    }
                });

                proc.send(atlases satisfies MainToWorkerMsg);
            });

            promises.push(promise);
        }

        this.logger.info("Atlas", `Rendering ${count} atlases with ${workers} workers.`);
        await Promise.all(promises);

        const end = Date.now();
        this.logger.info("Atlas", `Built all atlases after ${end - start} ms.`);
    }
}

export type Atlas = "main";
