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

import type { ServerEntity } from "../entities/Entity";
import type { ValidEntityType } from "@/common/constants";

import { RectHitbox, type Hitbox } from "@/common/utils/hitbox";
import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Grid {
    /**
     * The size of an individual cell, in game units.
     */
    static readonly cellSize = 16;

    readonly width: number;
    readonly height: number;

    private readonly _grid: Set<ServerEntity>[][];

    constructor(width: number, height: number) {
        this.width = Math.floor(width / Grid.cellSize);
        this.height = Math.floor(height / Grid.cellSize);

        this._grid = Array.from(
            { length: this.width + 1 },
            () => Array.from({ length: this.height + 1 }),
            () => new Set()
        );
    }

    /**
     * Add an entity to the grid.
     * @param entity The entity to add.
     */
    addEntity(entity: ServerEntity): void {
        this.updateEntity(entity);
    }

    /**
     * Update an existing entity in the grid.
     * @param entity The entity to update.
     */
    updateEntity(entity: ServerEntity): void {
        this.removeEntity(entity);

        const cells = entity.__gridCells;
        const hitbox = entity.hitbox.toRectangle();

        const min = this._roundToCells(hitbox.min);
        const max = this._roundToCells(hitbox.max);

        for (let i = min.y; i <= max.y; i++) {
            const row = this._grid[i];
            for (let j = min.x; j <= max.x; j++) {
                row[j].add(entity);
                cells.push(v2.new(j, i));
            }
        }
    }

    /**
     * Remove an entity from the grid.
     * @param entity The entity to remove.
     */
    removeEntity(entity: ServerEntity): void {
        const cells = entity.__gridCells;

        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            this._grid[cell.y][cell.x].delete(entity);
        }

        cells.length = 0;
    }

    /**
     * Get all entities near this Hitbox
     * This transforms the Hitbox into a rectangle
     * and gets all entities intersecting it after rounding it to grid cells
     * @param Hitbox The Hitbox
     * @returns A set with the entities near this Hitbox
     */
    intersectsHitbox(hitbox: Hitbox): Set<ServerEntity> {
        const rect = hitbox.toRectangle();

        const min = this._roundToCells(rect.min);
        const max = this._roundToCells(rect.max);

        const entities = new Set<ServerEntity>();

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const cellEntities = xRow[y];
                for (const entity of cellEntities) {
                    entities.add(entity);
                }
            }
        }

        return entities;
    }

    intersectPos(pos: Vec2): Array<ServerEntity<ValidEntityType>> {
        pos = this._roundToCells(pos);
        return [...this._grid[pos.x][pos.y]];
    }

    // TODO: Optimize this.
    intersectLineSegment(a: Vec2, b: Vec2): Set<ServerEntity<ValidEntityType>> {
        return this.intersectsHitbox(RectHitbox.fromLine(a, b));
    }

    private _roundToCells(v: Vec2): Vec2 {
        return {
            x: math.clamp(Math.floor(v.x / Grid.cellSize), 0, this.width),
            y: math.clamp(Math.floor(v.y / Grid.cellSize), 0, this.height)
        };
    }
}
