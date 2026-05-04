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

import { DefinitionList } from "../utils/DefinitionList";

import type { WeaponDefKey } from "./weaponDefs";

export interface ShipDef {
    readonly type: "ship";
    /**
     * The English name of the ship.
     */
    name: string;
    /**
     * The price of the ship.
     */
    price: number;
    /**
     * The base health of the ship.
     */
    hp: number;
    /**
     * The base agility of the ship.
     */
    agility: number;
    /**
     * The base cargo size of the ship.
     */
    cargo: number;
    /**
     * The base speed of the ship.
     */
    speed: number;
    /**
     * The number of unlocked weapon slots the ship contains.
     */
    slots: number;
    /**
     * The hitbox radius of the ship.
     */
    width: number;
    /**
     * Whether the ship is considered an elite ship.
     * @default false
     */
    elite: boolean;
    /**
     * The custom slot for elite ships.
     * @default ""
     */
    customWeapon: "" | WeaponDefKey;
}

const rawDefs = {
    r0: {
        name: "Rank 0",
        type: "ship",
        price: 7500,
        hp: 80,
        agility: 1.5,
        cargo: 6000,
        speed: 0.7,
        slots: 1,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r1: {
        name: "Rank 1",
        type: "ship",
        price: 12500,
        hp: 100,
        agility: 1.75,
        cargo: 8000,
        speed: 0.7,
        slots: 2,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r2: {
        name: "Rank 2",
        type: "ship",
        price: 2e4,
        hp: 120,
        agility: 0.85,
        cargo: 15e3,
        speed: 0.6,
        slots: 3,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r3: {
        name: "Rank 3",
        type: "ship",
        price: 25e3,
        hp: 60,
        agility: 1.9,
        cargo: 3e3,
        speed: 0.8,
        slots: 3,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r4: {
        name: "Rank 4",
        type: "ship",
        price: 4e4,
        hp: 100,
        agility: 1.9,
        cargo: 2500,
        speed: 0.6,
        slots: 4,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r5: {
        name: "Rank 5",
        type: "ship",
        price: 5e4,
        hp: 120,
        agility: 1.3,
        cargo: 5e3,
        speed: 0.52,
        slots: 5,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r6: {
        name: "Rank 6",
        type: "ship",
        price: 75e3,
        hp: 90,
        agility: 0.7,
        cargo: 4e3,
        speed: 0.58,
        slots: 6,
        width: 64,
        elite: false,
        customWeapon: ""
    },
    r7: {
        name: "Rank 7",
        type: "ship",
        price: 1e5,
        hp: 130,
        agility: 0.6,
        cargo: 4e3,
        speed: 0.4,
        slots: 6,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r8: {
        name: "Rank 8",
        type: "ship",
        price: 2e5,
        hp: 100,
        agility: 0.7,
        cargo: 3e3,
        speed: 0.5,
        slots: 7,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r9: {
        name: "Rank 9",
        type: "ship",
        price: 25e4,
        hp: 130,
        agility: 0.6,
        cargo: 8e3,
        speed: 0.35,
        slots: 7,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r10: {
        name: "Rank 10",
        type: "ship",
        price: 25e4,
        hp: 120,
        agility: 0.7,
        cargo: 5e3,
        speed: 0.4,
        slots: 8,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r11: {
        name: "Rank 11",
        type: "ship",
        price: 4e5,
        hp: 110,
        agility: 0.6,
        cargo: 2e3,
        speed: 0.42,
        slots: 8,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r12: {
        name: "Rank 12",
        type: "ship",
        price: 4e5,
        hp: 230,
        agility: 0.25,
        cargo: 5e4,
        speed: 0.25,
        slots: 9,
        width: 192,
        elite: false,
        customWeapon: ""
    },
    r13: {
        name: "Rank 13",
        type: "ship",
        price: 5e5,
        hp: 180,
        agility: 0.2,
        cargo: 1e4,
        speed: 0.27,
        slots: 9,
        width: 185,
        elite: false,
        customWeapon: ""
    },
    r14: {
        name: "Rank 14",
        type: "ship",
        price: 1e6,
        hp: 140,
        agility: 0.42,
        cargo: 2e3,
        speed: 0.32,
        slots: 10,
        width: 128,
        elite: false,
        customWeapon: ""
    },
    r15: {
        name: "Rank 15",
        type: "ship",
        price: 1e6,
        hp: 230,
        agility: 0.25,
        cargo: 2e4,
        speed: 0.26,
        slots: 10,
        width: 190,
        elite: false,
        customWeapon: ""
    },
    r16: {
        name: "Rank 16",
        type: "ship",
        price: 2e6,
        hp: 130,
        agility: 0.32,
        cargo: 5e3,
        speed: 0.38,
        slots: 10,
        width: 128,
        elite: true,
        customWeapon: "turbo"
    },
    r17: {
        name: "Rank 17",
        type: "ship",
        price: 25e5,
        hp: 430,
        agility: 0.25,
        cargo: 999999,
        speed: 0.18,
        slots: 10,
        width: 192,
        elite: true,
        customWeapon: ""
    },
    r18: {
        name: "Rank 18",
        type: "ship",
        price: 3e6,
        hp: 260,
        agility: 0.3,
        cargo: 1e4,
        speed: 0.26,
        slots: 10,
        width: 185,
        elite: true,
        customWeapon: "spreadshot"
    },
    r19: {
        name: "Rank 19",
        type: "ship",
        price: 5e6,
        hp: 190,
        agility: 0.42,
        cargo: 5e3,
        speed: 0.34,
        slots: 10,
        width: 128,
        elite: true,
        customWeapon: ""
    },
    r20: {
        name: "Rank 20",
        type: "ship",
        price: 8e6,
        hp: 390,
        agility: 0.2,
        cargo: 2e4,
        speed: 0.24,
        slots: 10,
        width: 190,
        elite: true,
        customWeapon: "gravity_bomb"
    }
    /**
     * Ranks 21-25 have been omitted as they are imbalanced. If this project succeeds, they may be added back.
     */
} satisfies Record<string, ShipDef>;

export type ShipDefKey = keyof typeof rawDefs;

export const ShipDefs = new DefinitionList<ShipDefKey, ShipDef>(rawDefs);
