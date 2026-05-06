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

import { collision, type IntersectionResponse, type LineIntersection } from "./collision";
import { math } from "./math";
import { assert } from "./util";
import { v2, type Vec2 } from "./v2";

// oxfmt-ignore
const checkFns: Array<Array<{ fn: (a: Hitbox, b: Hitbox) => boolean; reverse: boolean; }>> = [];
// oxfmt-ignore
const intersectionFns: Array<Array<{ fn: (a: Hitbox, b: Hitbox) => IntersectionResponse; reverse: boolean; }>> = [];
const lineIntersectionFns: Array<(hitbox: Hitbox, a: Vec2, b: Vec2) => LineIntersection> = [];

export enum HitboxType {
    Circle,
    Rect
}

export interface CircleHitboxJSON {
    readonly type: HitboxType.Circle;
    readonly radius: number;
    readonly position: Vec2;
}

export interface RectHitboxJSON {
    readonly type: HitboxType.Rect;
    readonly min: Vec2;
    readonly max: Vec2;
}

export type Hitbox = CircleHitbox | RectHitbox;
export type HitboxJSON = CircleHitboxJSON | RectHitboxJSON;

export abstract class BaseHitbox<T extends HitboxType = HitboxType> {
    static readonly type: HitboxType;
    abstract type: HitboxType;

    /**
     * Clone this {@link Hitbox}.
     */
    abstract clone(): Hitbox;
    /**
     * Scale this {@link Hitbox}. Mutates the original {@link Hitbox}.
     * @param factor The factor to scale by.
     */
    abstract scale(factor: number): void;
    abstract transform(position: Vec2, rotation: number, scale: number): Hitbox;
    /**
     * Transforms this {@link Hitbox} into a {@link RectHitbox|Rectangle} hitbox.
     */
    abstract toRectangle(): RectHitbox;
    /**
     * Determine if a point falls within this {@link Hitbox}.
     * @param point The point to check.
     */
    abstract isPointInside(point: Vec2): boolean;
    abstract toJSON(): HitboxJSON & { type: T };

    static fromJSON(data: HitboxJSON): Hitbox {
        switch (data.type) {
            case HitboxType.Circle:
                return new CircleHitbox(data.radius, data.position);
            case HitboxType.Rect:
                return new RectHitbox(data.min, data.max);
        }
    }

    /**
     * Checks if this {@link Hitbox} collides with another one.
     * @param other The other {@link Hitbox}.
     */
    collidesWith(other: Hitbox): boolean {
        const collisionFn = checkFns[this.type][other.type];
        assert(collisionFn, `"${this.type}" does not support collision checking with "${other.type}"`);

        return collisionFn.reverse
            ? collisionFn.fn(other, this as unknown as Hitbox)
            : collisionFn.fn(this as unknown as Hitbox, other);
    }

    /**
     * Checks if this {@link Hitbox} intersects with another one.
     * @param other The other {@link Hitbox}.
     * @returns The intersection response with normal direction and penetration depth.
     */
    getIntersection(other: Hitbox): IntersectionResponse {
        const collisionFn = intersectionFns[this.type][other.type];
        assert(collisionFn, `"${this.type}" does not support intersection with "${other.type}"`);

        const res = collisionFn.reverse
            ? collisionFn.fn(other, this as unknown as Hitbox)
            : collisionFn.fn(this as unknown as Hitbox, other);

        if (res && collisionFn.reverse) res.normal = v2.inv(res.normal);

        return res;
    }

    /**
     * Check if a line intersects with this {@link Hitbox}.
     * @param a One endpoint of the line
     * @param b The other endpoint of the line.
     * @returns An intersection response containing the intersection position and normal vector.
     */
    intersectsLine(a: Vec2, b: Vec2): LineIntersection {
        const intersectionFn = lineIntersectionFns[this.type];
        assert(intersectionFn, `Hitbox "${this.type}" does not support line intersection.`);

        return intersectionFn(this as unknown as Hitbox, a, b);
    }
}

export class CircleHitbox extends BaseHitbox {
    static override readonly type = HitboxType.Circle;
    override readonly type = HitboxType.Circle;

    constructor(
        public radius: number,
        public position = v2.new(0, 0)
    ) {
        super();
    }

    override clone(): CircleHitbox {
        return new CircleHitbox(this.radius, v2.clone(this.position));
    }

    override scale(factor: number): void {
        this.radius *= factor;
    }

    override transform(position: Vec2, rotation = 0, scale = 1): CircleHitbox {
        const r = this.radius * scale;
        const pos = v2.add(v2.rotate(v2.mult(this.position, scale), rotation), position);

        return new CircleHitbox(r, pos);
    }

    override toRectangle(): RectHitbox {
        return new RectHitbox(
            v2.new(this.position.x - this.radius, this.position.y - this.radius),
            v2.new(this.position.x + this.radius, this.position.y + this.radius)
        );
    }

    override isPointInside(point: Vec2): boolean {
        return v2.distance(point, this.position) < this.radius;
    }

    override toJSON(): CircleHitboxJSON {
        return {
            type: this.type,
            position: this.position,
            radius: this.radius
        };
    }
}

export class RectHitbox extends BaseHitbox {
    static override readonly type = HitboxType.Rect;
    override readonly type = HitboxType.Rect;

    constructor(
        public min: Vec2,
        public max: Vec2
    ) {
        super();
    }

    /**
     * Creates a new {@link RectHitbox} from the bounds of a circle.
     * @param r The radius of the circle.
     * @param pos The center of the circle.
     */
    static fromCircle(radius: number, position: Vec2): RectHitbox {
        return new RectHitbox(
            v2.new(position.x - radius, position.y - radius),
            v2.new(position.x + radius, position.y + radius)
        );
    }

    /**
     * Creates a new {@link RectHitbox} from the bounds of a line.
     * @param a One endpoint of the line
     * @param b The other endpoint of the line.
     */
    static fromLine(a: Vec2, b: Vec2): RectHitbox {
        return new RectHitbox(
            v2.new(math.min(a.x, b.x), math.min(a.y, b.y)),
            v2.new(math.max(a.x, b.x), math.max(a.y, b.y))
        );
    }

    /**
     * Creates a new {@link RectHitbox} from the dimensions and center of a rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @param pos The center of the rectangle.
     */
    static fromRect(width: number, height: number, pos = v2.new(0, 0)): RectHitbox {
        const size = v2.new(width / 2, height / 2);
        return new RectHitbox(v2.sub(pos, size), v2.add(pos, size));
    }

    override clone(): RectHitbox {
        return new RectHitbox(v2.clone(this.min), v2.clone(this.max));
    }

    override scale(scale: number): void {
        const centerX = (this.min.x + this.max.x) / 2;
        const centerY = (this.min.y + this.max.y) / 2;

        this.min = v2.new((this.min.x - centerX) * scale + centerX, (this.min.y - centerY) * scale + centerY);
        this.max = v2.new((this.max.x - centerX) * scale + centerX, (this.max.y - centerY) * scale + centerY);
    }

    override transform(position: Vec2, rotation = 0, scale = 1): RectHitbox {
        const e = v2.mult(v2.sub(this.max, this.min), 0.5);
        const c = v2.add(this.min, e);

        const pts = [
            v2.new(c.x - e.x, c.y - e.y),
            v2.new(c.x - e.x, c.y + e.y),
            v2.new(c.x + e.x, c.y - e.y),
            v2.new(c.x + e.x, c.y + e.y)
        ];

        const min = v2.new(Number.MAX_VALUE, Number.MAX_VALUE);
        const max = v2.new(-Number.MAX_VALUE, -Number.MAX_VALUE);

        for (let i = 0; i < pts.length; i++) {
            const p = v2.add(v2.rotate(v2.mult(pts[i], scale), rotation), position);

            min.x = math.min(min.x, p.x);
            min.y = math.min(min.y, p.y);
            max.x = math.max(max.x, p.x);
            max.y = math.max(max.y, p.y);
        }

        return new RectHitbox(min, max);
    }

    override toRectangle(): this {
        return this;
    }

    override isPointInside(point: Vec2): boolean {
        return point.x > this.min.x && point.y > this.min.y && point.x < this.max.x && point.y < this.max.y;
    }

    override toJSON(): RectHitboxJSON {
        return {
            type: this.type,
            min: v2.clone(this.min),
            max: v2.clone(this.max)
        };
    }
}

function setCheckFn<
    A extends HitBoxCtr,
    B extends HitBoxCtr,
    AInst = Hitbox & { type: A["type"] },
    BInst = Hitbox & { type: B["type"] }
>(hitboxA: A, hitboxB: B, fn: (a: AInst, b: BInst) => boolean): void {
    const setFunction = (
        typeA: HitboxType,
        typeB: HitboxType,
        fn: (a: AInst, b: BInst) => boolean,
        reverse: boolean
    ): void => {
        checkFns[typeA] ??= [];
        checkFns[typeA][typeB] = {
            fn: fn as (a: Hitbox, B: Hitbox) => boolean,
            reverse
        };
    };

    setFunction(hitboxA.type, hitboxB.type, fn, false);
    if (hitboxA.type !== hitboxB.type) setFunction(hitboxB.type, hitboxA.type, fn, true);
}

function setIntersectionFn<
    A extends HitBoxCtr,
    B extends HitBoxCtr,
    AInst = Hitbox & { type: A["type"] },
    BInst = Hitbox & { type: B["type"] }
>(hitboxA: A, hitboxB: B, fn: (a: AInst, b: BInst) => IntersectionResponse): void {
    const setFunction = (
        typeA: HitboxType,
        typeB: HitboxType,
        fn: (a: AInst, b: BInst) => IntersectionResponse,
        reverse: boolean
    ): void => {
        intersectionFns[typeA] ??= [];
        intersectionFns[typeA][typeB] = {
            fn: fn as (a: Hitbox, B: Hitbox) => IntersectionResponse,
            reverse
        };
    };
    setFunction(hitboxA.type, hitboxB.type, fn, false);
    if (hitboxA.type !== hitboxB.type) {
        setFunction(hitboxB.type, hitboxA.type, fn, true);
    }
}

function setLineIntersectionFn<A extends HitBoxCtr>(
    hitbox: A,
    fn: (hitbox: Hitbox & { type: A["type"] }, a: Vec2, b: Vec2) => LineIntersection
): void {
    lineIntersectionFns[hitbox.type] = fn as (typeof lineIntersectionFns)[number];
}

// oxfmt-ignore
setCheckFn(CircleHitbox, CircleHitbox, (a, b) => collision.checkCircleCircle(a.position, a.radius, b.position, b.radius));
setCheckFn(CircleHitbox, RectHitbox, (a, b) => collision.checkRectCircle(b.min, b.max, a.position, a.radius));
setCheckFn(RectHitbox, RectHitbox, (a, b) => collision.checkRectRect(a.min, a.min, b.min, b.max));

// oxfmt-ignore
setIntersectionFn(CircleHitbox, CircleHitbox, (a, b) => collision.circleCircleIntersection(a.position, a.radius, b.position, b.radius));
// oxfmt-ignore
setIntersectionFn(RectHitbox, CircleHitbox, (a, b) => collision.rectCircleIntersection(a.min, a.max, b.position, b.radius));
setIntersectionFn(RectHitbox, RectHitbox, (a, b) => collision.rectRectIntersection(a.min, a.max, b.min, b.max));

// oxfmt-ignore
setLineIntersectionFn(CircleHitbox, (hitbox, a, b) => collision.lineIntersectsCircle(a, b, hitbox.position, hitbox.radius));
setLineIntersectionFn(RectHitbox, (hitbox, a, b) => collision.lineIntersectsRect(a, b, hitbox.min, hitbox.max));

type HitBoxCtr = { type: HitboxType };
