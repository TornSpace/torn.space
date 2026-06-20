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

import { createCanvas, loadImage } from "@napi-rs/canvas";

import { join, relative } from "node:path";

import { AtlasManager } from "./AtlasManager.ts";
import { detectEdges, type Edges } from "./detectEdges.ts";

import { Logger } from "../../../common/src/utils/Logger.ts";

import type { ImageCache } from "./ImageManager.ts";

const canvas = createCanvas(0, 0);
const ctx = canvas.getContext("2d");

const logger = new Logger({
    timestamp: false,
    info: false,
    debug: false,
    warn: false,
    error: true
});

process.on("message", async function (data: ParentMsg) {
    const images: ImageCache = {};
    for (const image of data.images) {
        const edges = await renderImage(image.path, image.hash);
        images[relative(AtlasManager.imgFolder, image.path).replace(/\\/g, "/")] = {
            hash: image.hash,
            edges
        };
    }

    process.send!(images);
});

async function renderImage(path: string, hash: string): Promise<Edges> {
    const filename = path.endsWith(".svg") ? join(AtlasManager.imgCacheFolder, `${hash}.png`) : path;

    // I hate Windows!
    const img = await loadImage(path);

    canvas.width = Math.ceil(img.width);
    canvas.height = Math.ceil(img.height);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let edges: Edges;
    try {
        edges = detectEdges(canvas, { tolerance: 0 });
    } catch (err) {
        logger.error("Atlas", `Failed to detect edges for "${path}":`, err);
        edges = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        };
    }

    if (path.endsWith(".svg")) {
        const buffer = canvas.toBuffer("image/png");
        await Bun.file(filename).write(buffer);
    }

    return edges;
}

export interface ParentMsg {
    images: Array<{ path: string; hash: string }>;
}
