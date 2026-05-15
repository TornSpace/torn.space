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

import { Container } from "pixi.js";

import type { App } from "../App.svelte";

import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Camera {
    readonly container = new Container({
        sortableChildren: true,
        isRenderGroup: true,
        eventMode: "none"
    });

    _pos = $state(v2.new(0, 0));
    _oldPos = v2.new(0, 0);

    interpTicker = 0;

    width = 1;
    height = 1;

    /**
     * How many pixels each game unit is.
     */
    static scale = 64;
    /**
     * Player zoom.
     */
    private _zoom = 15;

    constructor(readonly app: App) {}

    static vecToScreen(a: Vec2): Vec2 {
        return v2.mult(a, this.scale);
    }

    static unitToScreen(a: number): number {
        return a * this.scale;
    }

    get position(): Vec2 {
        return this._pos;
    }

    set position(pos: Vec2) {
        this._oldPos = v2.clone(this._pos);
        this._pos = v2.clone(pos);

        this.interpTicker = 0;
    }

    get zoom(): number {
        return this._zoom;
    }

    set zoom(zoom: number) {
        if (zoom === this._zoom) return;

        this._zoom = zoom;
        this.resize();
    }

    resize(): void {
        this.width = this.app.pixi.screen.width;
        this.height = this.app.pixi.screen.height;

        const minDim = math.min(this.width, this.height);
        const maxDim = math.max(this.width, this.height);

        const maxScreenDim = math.max(minDim * (16 / 9), maxDim);

        this.container.scale.set((maxScreenDim * 0.5) / (this._zoom * Camera.scale));
        this.render(1);
    }

    render(dt: number): void {
        this.interpTicker += dt;

        const t = math.clamp(this.interpTicker / this.app.serverDt, 0, 1);

        const pos = Camera.vecToScreen(v2.lerp(this._oldPos, this.position, t));
        const cameraPos = v2.inv(
            v2.add(v2.mult(pos, this.container.scale.x), v2.new(-this.width / 2, -this.height / 2))
        );

        this.container.position.copyFrom(cameraPos);
    }

    addObject(obj: Container): void {
        this.container.addChild(obj);
    }
}
