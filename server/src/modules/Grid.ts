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

import { EntityType, GameConstants } from "@/common/constants";
import { RectHitbox } from "@/common/utils/hitbox";
import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Grid {
    /**
     * The number of grid cells per sector.
     * @default 9
     */
    static readonly cellsPerSector = 9;

    /**
     * The size of an individual cell, in game units.
     * Be careful not to let `GameConstants.sectorWidth * GameConstants.mapSize / Grid.cellSize` become too big!
     */
    static readonly cellSize = GameConstants.sectorWidth / Grid.cellsPerSector;

    readonly width: number;
    readonly height: number;

    private readonly _grid: Set<ServerEntity>[][];

    constructor(width: number, height: number) {
        this.width = Math.floor(width / Grid.cellSize);
        this.height = Math.floor(height / Grid.cellSize);

        this._grid = Array.from({ length: this.width + 1 }, () =>
            Array.from({ length: this.height + 1 }, () => new Set())
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

        const sectorPos = v2.mult(entity.sector, GameConstants.sectorWidth);

        const min = this._roundToCells(v2.add(hitbox.min, sectorPos));
        const max = this._roundToCells(v2.add(hitbox.max, sectorPos));

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
     * Get all entities near this hitbox.
     * This transforms the hitbox into a rectangle and gets all entities intersecting it after rounding it to grid cells and clamping to the target sector.
     * @param rect The hitbox.
     * @param sector The sector to check in. All entities outside of this sector will be discarded.
     * @returns A set with the entities near this Hitbox.
     */
    intersectsHitbox(rect: RectHitbox, sector: Vec2): Set<ServerEntity> {
        const { min, max } = this._roundToSector(rect.min, rect.max, sector);
        const entities = new Set<ServerEntity>();

        for (let x = min.x; x <= max.x; x++) {
            const xRow = this._grid[x];
            for (let y = min.y; y <= max.y; y++) {
                const cellEntities = xRow[y];
                for (const entity of cellEntities) {
                    // Visibility modifiers.
                    if (entity.__type === EntityType.Player && (entity.docked || entity.cloakTimer > 0)) continue;
                    entities.add(entity);
                }
            }
        }

        return entities;
    }

    intersectPos(pos: Vec2, sector: Vec2): ServerEntity[] {
        pos = this._roundToCells(v2.add(pos, v2.mult(sector, GameConstants.sectorWidth)));
        return [...this._grid[pos.x][pos.y]];
    }

    intersectLineSegment(a: Vec2, b: Vec2, sector: Vec2): Set<ServerEntity> {
        return this.intersectsHitbox(RectHitbox.fromLine(a, b), sector);
    }

    private _roundToCells(v: Vec2): Vec2 {
        return {
            x: math.clamp(Math.floor(v.x / Grid.cellSize), 0, this.width),
            y: math.clamp(Math.floor(v.y / Grid.cellSize), 0, this.height)
        };
    }

    private _roundToSector(min: Vec2, max: Vec2, sector: Vec2): Record<"min" | "max", Vec2> {
        const rawMin = this._roundToCells(min);
        const rawMax = this._roundToCells(max);

        const trueMin = v2.maxComp(rawMin, v2.mult(sector, Grid.cellsPerSector));
        const trueMax = v2.minComp(rawMax, v2.mult(sector, Grid.cellsPerSector));

        return {
            min: trueMin,
            max: trueMax
        };
    }
}
