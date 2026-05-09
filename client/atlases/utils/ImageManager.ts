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

import { loadImage, type Image } from "@napi-rs/canvas";

import { readdirSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join, resolve } from "node:path";

import { AtlasManager } from "./AtlasManager";

import { util } from "../../../common/src/utils/util";

import type { Logger } from "../../../common/src/utils/Logger";
import type { Edges } from "./detectEdges";
import type { ParentMsg } from "./imageWorker";

export class ImageManager {
    private cache: ImageCache = {};
    private renderQueue = new Map<string, string>();

    constructor(readonly logger: Logger) {}

    get(key: string): ImageCache[string] | undefined {
        return this.cache[key];
    }

    async loadFromDisk(): Promise<void> {
        const file = Bun.file(AtlasManager.imgCacheFile);

        if (await file.exists()) this.cache = await file.json();
        else this.cache = {};
    }

    async saveToDisk(): Promise<void> {
        await Bun.write(AtlasManager.imgCacheFile, JSON.stringify(this.cache));
    }

    async clearCache(): Promise<void> {
        const files = readdirSync(AtlasManager.imgCacheFolder);
        const validCachedImages = new Set(Object.values(this.cache).map(i => i.hash));

        let filesRemoved = 0;
        for (const path of files) {
            const file = Bun.file(join(AtlasManager.imgCacheFolder, path));
            const stat = await file.stat();

            const date = Date.now() - stat.atimeMs;

            // Remove files that have been invalidated and are over 7 days old.
            if (date > util.daysToMs(7)) {
                const hashKey = path.replace(".png", "");
                const existsInCache = validCachedImages.has(hashKey);

                if (!existsInCache) {
                    filesRemoved++;
                    await file.delete();
                }
            }
        }

        if (filesRemoved > 0) this.logger.info("Atlas", `Cleaned ${filesRemoved} files from cache.`);
    }

    queueImage(path: string, hash: string): void {
        this.renderQueue.set(path, hash);
    }

    async getCachedImage(path: string): Promise<UnpackedImage> {
        const cached = this.cache[path];
        if (!cached) throw new Error(`Couldn't find cached image "${path}".`);

        const fullPath = path.endsWith(".png")
            ? resolve(AtlasManager.imgFolder, path)
            : resolve(import.meta.dirname, join(AtlasManager.imgCacheFolder, `${cached.hash}.png`));
        return {
            edges: cached.edges,
            image: await loadImage(fullPath)
        };
    }

    async renderImages(): Promise<void> {
        if (this.renderQueue.size === 0) return;

        const renderQueue = [...this.renderQueue.entries()].map(([path, hash]) => ({ path, hash }));
        const start = Date.now();
        const promises: Array<Promise<void>> = [];

        let threadsLeft = Math.max(availableParallelism() - 2, 1);

        let imagesPerThread = renderQueue.length;
        if (renderQueue.length > 25) imagesPerThread = Math.ceil(renderQueue.length / threadsLeft);

        const total = renderQueue.length;

        let workers = 0;
        while (renderQueue.length) {
            threadsLeft--;
            workers++;

            const images = renderQueue.splice(0, imagesPerThread);
            imagesPerThread = Math.ceil(renderQueue.length / threadsLeft);

            const promise = new Promise<void>(resolvePromise => {
                const proc = Bun.spawn(["bun", resolve(import.meta.dirname, "imageWorker.ts")], {
                    serialization: "json",
                    ipc: (message: ImageCache, _subprocess, _handle) => {
                        Object.assign(this.cache, message);

                        proc.kill();
                        resolvePromise();
                    }
                });

                proc.send({ images } satisfies ParentMsg);
            });

            promises.push(promise);
        }

        this.logger.info("Atlas", `Rendering ${total} images with ${workers} workers.`);

        await Promise.all(promises);
        await this.saveToDisk();

        this.renderQueue.clear();

        const end = Date.now();

        this.logger.info("Atlas", `Rendered all images after ${end - start} ms.`);
    }
}

export type ImageCache = Record<string, CachedImage>;
export type CachedImage = { edges: Edges; hash: string };
export type UnpackedImage = { edges: Edges; image: Image };
