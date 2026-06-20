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

import { createCanvas, Image } from "@napi-rs/canvas";
import { type Bin, MaxRectsPacker, type Rectangle } from "maxrects-packer";
import sharp from "sharp";

import { AtlasManager, type Atlas } from "./AtlasManager.ts";

import type { Logger } from "../../../common/src/utils/Logger.ts";
import type { AtlasDef } from "../AtlasDef.ts";
import type { WorkerToMainMsg } from "./atlasWorker.ts";
import type { Edges } from "./detectEdges.ts";
import type { CachedImage, ImageManager } from "./ImageManager.ts";
import type { SpritesheetData } from "pixi.js";

export class AtlasBuilder {
    static readonly imageCache = new Map<string, CachedImage>();

    readonly def: AtlasDef;
    readonly packer = new MaxRectsPacker(4096, 4096, 8, {
        border: 8,
        square: true
    });

    readonly rects: Array<{
        width: number;
        height: number;
        size: number;
        data: ImageData;
    }> = [];

    readonly atlases: WorkerToMainMsg[0]["data"] = [];

    constructor(
        readonly name: Atlas,
        readonly manager: ImageManager,
        readonly logger: Logger
    ) {
        this.def = AtlasManager.atlases[name];
    }

    async build(): Promise<void> {
        this.logger.info("Atlas", `Building atlas ${this.name}.`);

        const start = Date.now();

        await this.pack();
        await this.generateAtlases();

        const elapsed = Date.now() - start;
        this.logger.info("Atlas", `Finished building ${this.name} after ${elapsed} ms.`);
    }

    async pack(): Promise<void> {
        const promises: Promise<void>[] = [];

        for (const file of this.def.images) {
            let key: string | string[] = file.split("/").at(-1)!.split(".");
            key.pop(); // remove file extension
            key = `${key.join(".")}.img`;

            promises.push(this.loadImage(key, file));
        }

        await Promise.all(promises);

        // sort all rects by their size for more optimized packing that generates
        // less spritesheets
        // Sort all rectangles by their size for more optimized packing, which generates less spritesheets.
        this.rects.sort((a, b) => b.size - a.size);

        for (const rect of this.rects) {
            this.packer.add(rect.width, rect.height, rect.data);
        }
    }

    async generateAtlases(): Promise<void> {
        const promises: Promise<void>[] = [];
        for (let i = 0; i < this.packer.bins.length; i++) {
            const bin = this.packer.bins[i];
            promises.push(this.renderSheet(`${this.name}-${i}`, bin));
        }

        await Promise.all(promises);
    }

    async loadImage(key: string, path: string): Promise<void> {
        const { image, edges } = await this.manager.getCachedImage(path);

        // need to test more if floor, ceil or round is better here...
        // or maybe a combination of them?
        const width = image.width - edges.left - edges.right;
        const height = image.height - edges.top - edges.bottom;

        this.rects.push({
            width,
            height,
            // used for sorting
            // max(width, height) gives more optimized packing from my tests
            size: Math.max(width, height),
            data: {
                image,
                key: key,
                edges: edges,
                width: image.width,
                height: image.height
            }
        });
    }

    async renderSheet(name: string, bin: Bin<Rectangle>): Promise<void> {
        const canvas = createCanvas(bin.width, bin.height);
        const ctx = canvas.getContext("2d");

        const sheetData: SpritesheetData = {
            meta: {
                image: `${name}.png`,
                size: {
                    w: bin.width,
                    h: bin.height
                },
                scale: 1
            },
            frames: {}
        };

        for (const rect of bin.rects) {
            const data = rect.data as ImageData;

            const frameData = {
                frame: {
                    x: Math.ceil(rect.x),
                    y: Math.ceil(rect.y),
                    w: Math.ceil(rect.width),
                    h: Math.ceil(rect.height)
                },
                rotated: false,
                trimmed: true,
                spriteSourceSize: {
                    x: Math.ceil(data.edges.left),
                    y: Math.ceil(data.edges.top),
                    w: Math.ceil(rect.width),
                    h: Math.ceil(rect.height)
                },
                sourceSize: {
                    w: Math.ceil(data.width),
                    h: Math.ceil(data.height)
                }
            };
            sheetData.frames[data.key] = frameData;

            const frame = frameData.frame;

            ctx.drawImage(
                data.image,
                // Unscaled image position and size.
                data.edges.left,
                data.edges.top,
                data.image.width - (data.edges.left + data.edges.right),
                data.image.height - (data.edges.top + data.edges.bottom),
                // Scaled image position and size (if we implemented scaling, not applicable here).
                frame.x,
                frame.y,
                frame.w,
                frame.h
            );
        }

        let buffer: Buffer;
        if (this.def.compress) {
            buffer = await sharp(canvas.toBuffer("image/png"))
                .png({
                    compressionLevel: 9,
                    quality: 99,
                    dither: 0
                })
                .toBuffer();
        } else {
            // TODO: Try and get some compression from this. Maybe use canvas.encode()?
            buffer = Buffer.from(canvas.toBuffer("image/png"));
        }

        this.atlases.push({
            data: sheetData,
            buffer
        });
    }
}

interface ImageData {
    image: Image;
    key: string;
    edges: Edges;
    width: number;
    height: number;
}
