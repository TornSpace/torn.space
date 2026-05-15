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

import type { WeaponDefKey } from "./defs/weaponDefs";
import type { Vec2 } from "./utils/v2";

export enum EntityType {
    Invalid,
    // Beam,
    // Blast,
    // Bullet,
    // Missile,
    // Asteroid,
    Base,
    Loot,
    // Planet,
    // Turret,
    // Vortex,
    Player
}

export interface LeaderboardEntry {
    playerId: number;
    rank: number;
    xp: number;
}

export enum PacketType {
    // Client (to server)
    Join, // MUST ALWAYS BE FIRST
    Disconnect,
    DebugToggle,
    Chat,
    Input,
    Respawn,

    // Server (to client)
    Announcement,
    ChatServer,
    Death,
    Debug,
    Joined,
    Kill,
    Raid,
    Update
}

export interface PlayerSaveData {
    id: number;
    xp: number;
    rank: number;
    team: Team;
    balance: number;
    lives: number;
    guild?: number;
    ship: number;
    trail: Trail;
    sector: Vec2;
    weapons: WeaponDefKey[];
    speed: number;
    radar: number;
    cargo: number;
    hp: number;
    energy: number;
    agility: number;

    iron: number;
    silver: number;
    copper: number;
    platinum: number;
    kills: number;
    baseKills: number;
    driftTime: number;

    achievements: number[];
    // quests: number[];
    planets: number[];
    sectors: number[];
}

export enum Team {
    Human,
    Alien,
    Cyborg
}

export enum Trail {
    /**
     * Default trail.
     */
    None,
    /**
     * 1.25x damage.
     */
    Blood,
    /**
     * 1.25x income.
     */
    Money,
    /**
     * 1.25x agility.
     */
    Panda,
    /**
     * 1.25x juking...
     */
    Random,
    /**
     * 1.25x something...
     */
    Rainbow
}

export type ValidEntityType = Exclude<EntityType, EntityType.Invalid>;

/**
 * Game constants.
 * This **MUST** be kept at the bottom of the file!
 */
export const GameConstants = {
    base: {
        /**
         * The docking radius of the base, in game units.
         */
        radius: 0.075,
        /**
         * The speed at which bases rotate.
         */
        rotateSpeed: 0.03,
        /**
         * The sector(s) in which the team base(s) will spawn.
         */
        spawns: {
            [Team.Human]: [
                [4, 2],
                [6, 2],
                [5, 4],
                [4, 6]
            ],
            [Team.Alien]: [
                [1, 0],
                [3, 0],
                [2, 2],
                [5, 1]
            ],
            [Team.Cyborg]: [
                [1, 3],
                [0, 5],
                [2, 6],
                [3, 4]
            ]
        }
    },
    /**
     * Client-specific configuration.
     */
    client: {
        /**
         * The rate at which the client experiences background traversal.
         */
        backgroundSpeed: 0.03125,
        /**
         * Star mirror count.
         */
        starMirrors: 3,
        /**
         * Total star count.
         */
        starCount: 30,
        /**
         * Base star movement speed.
         */
        starSpeed: 0.09375
    },
    /**
     * The relative speed at which the game runs at. The absolute speed is this multiplied by the tickrate.
     */
    gameSpeed: 1,
    /**
     * The maximum number of entries the leaderboard can support.
     */
    leaderboardMaxEntries: 25,
    /**
     * The pickup radius of loot.
     */
    lootRadius: 16,
    /**
     * How many sectors per side on the map.
     */
    mapSize: 7,
    /**
     * The sector width (in game units).
     */
    sectorWidth: 224,
    /**
     * The maximum possible position. Must be a multiple of 2.
     */
    maxPosition: 2048,
    maxEntityId: (1 << 16) - 1,
    maxChatLength: 256,
    player: {
        /**
         * The time, in seconds, before players are kicked for inactivity.
         * @default 300
         */
        afkTimer: 300,
        defaultName: "GUEST",
        maxNameLength: 16,
        /**
         * The rate at which players heal per second.
         * The default is 6 hp per second.
         * @default 6
         */
        healRate: 6,
        /**
         * Starting cash for new players.
         */
        initialBalance: 8e3,
        /**
         * The maximum number of lives a player can have.
         * This is also the default number of lives a player will start with.
         */
        maxLives: 20,
        /**
         * Viewport radius. Should be the maximum of the two viewport dimensions.
         */
        viewRadius: 25,
        /**
         * The maximum number of weapon slots a player can have.
         */
        weaponSlots: 10
    },
    /**
     * The current protocol version. Used to determine if clients are out of date.
     * Increment this whenever a definition or anything related to packet serialization is changed.
     */
    protocol: 0,
    /**
     * Exp to rank conversion.
     * Note: This is **intentionally** specified as an object so that it is easier to read.
     */
    // oxfmt-ignore
    ranks: Object.values({
        r0: 0,
        r1: 1,
        r2: 5,
        r3: 10,
        r4: 20,
        r5: 50,
        r6: 100,
        r7: 200,
        r8: 500,
        r9: 1e3,
        r10: 2e3,
        r11: 4e3,
        r12: 8e3,
        r13: 14e3,
        r14: 2e4,
        r15: 4e4,
        r16: 7e4,
        r17: 1e5,
        r18: 14e4,
        r19: 2e5,
        r20: 3e5,
        r21: 5e5,
        r22: 8e5,
        r23: 1e6,
        r24: 15e5,
        r25: 2e6,
        r26: 3e6,
        r27: 5e6,
        r28: 8e6,
        r29: 12e6,
        r30: 16e6,
        r31: 32e6,
        r32: 64e6,
        r33: 1e7,
        r34: 2e7,
        r35: 4e7,
        r36: 1e8
    })
};
