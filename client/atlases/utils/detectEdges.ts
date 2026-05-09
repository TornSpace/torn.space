/*
 * MIT License
 *
 * Copyright (c) 2020 Guillaume Martigny
 * Copyright (c) 2026 DamienVesper (https://github.com/TornSpace/torn.space) [AGPL-3.0]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { Canvas } from "@napi-rs/canvas";

export interface Edges {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

interface Options {
    tolerance: number;
}

const defaultOptions = {
    tolerance: 0
};

/**
 * Check pixel transparency.
 * @param tolerance Tolerance level.
 */
const checkOpacityLevel =
    (tolerance: number) =>
    (pixels: Uint8ClampedArray): boolean => {
        let transparent = true;
        for (let i = 3, l = pixels.length; i < l && transparent; i += 4) {
            transparent = transparent && pixels[i] <= 255 * tolerance;
        }

        return transparent;
    };

/**
 * Smartly detect edges of an image
 * @param canvas - Tainted canvas element
 * @param options - Some options
 */
export function detectEdges(canvas: Canvas, options?: Partial<Options>): Edges {
    const { tolerance } = {
        ...defaultOptions,
        ...options
    };

    const isTransparent = checkOpacityLevel(tolerance);
    const ctx = canvas.getContext("2d");

    const { width, height } = canvas;
    let pixels: Uint8ClampedArray;

    let top = -1;
    do {
        ++top;
        pixels = ctx.getImageData(0, top, width, 1).data;

        if (top >= height) {
            throw new Error("Can't detect edges.");
        }
    } while (isTransparent(pixels));

    // Left
    let left = -1;
    do {
        ++left;
        pixels = ctx.getImageData(left, top, 1, height - top).data;
    } while (isTransparent(pixels));

    // Bottom
    let bottom = -1;
    do {
        ++bottom;
        pixels = ctx.getImageData(left, height - bottom - 1, width - left, 1).data;
    } while (isTransparent(pixels));

    // Right
    let right = -1;
    do {
        ++right;
        pixels = ctx.getImageData(width - right - 1, top, 1, height - (top + bottom)).data;
    } while (isTransparent(pixels));

    return {
        top,
        right,
        bottom,
        left
    };
}
