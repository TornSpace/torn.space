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

export const GameConstants = {
    base: {
        /**
         * The docking radius of the base.
         */
        radius: 50
    },
    /**
     * The relative speed at which the game runs at. The absolute speed is this multiplied by the tickrate.
     */
    gameSpeed: 1,
    leaderboardMaxEntries: 25,
    lootRadius: 16,
    /**
     * How many sectors per side on the map.
     */
    mapSize: 7,
    /**
     * The sector width (in game units).
     */
    sectorWidth: 1432,
    /**
     * The maximum possible position. Must be a multiple of 2.
     */
    maxPosition: 2048,
    maxEntityId: (1 << 16) - 1,
    maxChatLength: 256,
    player: {
        defaultName: "Guest",
        maxNameLength: 16,
        /**
         * The rate at which players heal per tick.
         * The default is 6 hp per second.
         * @default 0.05
         */
        healRate: 0.05,
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
        viewRadius: 10,
        /**
         * The maximum number of weapon slots a player can have.
         */
        weaponSlots: 10
    },
    /**
     * Exp to rank conversion.
     * Note: This is **intentionally** initially specified as an object so that it is easier to read.
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
