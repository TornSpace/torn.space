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

import { EntityPool, ServerEntity } from "./Entity";

import type { Client } from "../modules/ClientManager";
import type { Game } from "../modules/Game";
import type { InputPacket } from "@/common/net/InputPacket";
import type { JoinPacket } from "@/common/net/JoinPacket";
import type { EntitiesNetData } from "@/common/net/UpdatePacket";

import { EntityType, GameConstants, Trail, type LeaderboardEntry } from "@/common/constants";
import { ShipDefs, type ShipDefKey } from "@/common/defs/shipDefs";
import { CircleHitbox } from "@/common/utils/hitbox";
import { math } from "@/common/utils/math";
import { v2, type Vec2 } from "@/common/utils/v2";

export class Player extends ServerEntity {
    readonly __type = EntityType.Player;
    readonly hitbox = new CircleHitbox();

    readonly dirty = {
        id: true,
        hp: true,
        weapons: true,
        ammo: true
    };

    name = "";
    client!: Client;

    velocity = v2.new(0, 0);
    direction = v2.new(0, 0);
    lastDockPosition = v2.new(0, 0); // todo: maybe just reference the entity id?

    moveFwd = false;
    moveBwd = false;
    turnLeft = false;
    turnRight = false;
    jukeLeft = false;
    jukeRight = false;
    drift = false;

    attack = false;
    tryShield = false;
    cslot = false;

    dead = false;

    weapons = {};

    // Asteroids.
    iron = 0;
    copper = 0;
    silver = 0;
    platinum = 0;

    // Timers.
    baseTimer = 0;
    borderTimer = 0;
    cloakTimer = 0;
    empTimer = 0;
    gyroTimer = 0;
    hyperdriveTimer = 0;
    jukeTimer = 0;
    superchargerTimer = 0;

    shield = false;

    money = 8000;
    ship: ShipDefKey = "r0";
    xp = 0;
    rank = 0;
    trail = Trail.None;

    tech = {
        speed: 1,
        radar: 1,
        cargo: 1,
        hp: 1,
        energy: 1,
        agility: 1
    };

    private _hp = 1;
    private _charge = 0;

    get maxHP(): number {
        const def = ShipDefs.typeToDef(this.ship);

        return def.hp * this.tech.hp;
    }

    get hp(): number {
        return this._hp;
    }

    get charge(): number {
        return this._charge;
    }

    set hp(hp: number) {
        if (hp === this.hp) return;

        this.hp = math.clamp(hp, 0, this.maxHP);
        this.dirty.hp = true;
    }

    set charge(charge: number) {
        if (charge === this.charge) return;
        this.charge = math.clamp(this.charge, 0, this.charge);
    }

    override get position(): Vec2 {
        return this.hitbox.position;
    }

    override set position(pos: Vec2) {
        this.hitbox.position = pos;
        this._position = pos;
    }

    init(client: Client, name: string, position: Vec2): void {
        this.client = client;
        this.name = name;
        this.position = position;
    }

    refillAmmo(): void {
        for (let i = 0; i < this.weapons.length; i++) {}
    }

    update(dt: number): void {
        if (this.dead) return;

        if (this.baseTimer >= 0) this.baseTimer -= dt;
        if (this.borderTimer >= 0) this.borderTimer -= dt;
        if (this.cloakTimer >= 0) this.cloakTimer -= dt;
        if (this.empTimer >= 0) this.empTimer -= dt;
        if (this.gyroTimer >= 0) this.gyroTimer -= dt;
        if (this.hyperdriveTimer >= 0) this.hyperdriveTimer -= dt;
        if (this.jukeTimer >= 0) this.jukeTimer -= dt;
        if (this.superchargerTimer >= 0) this.superchargerTimer -= dt;

        // Heal the player over time.
        if (!this.shield && this.hp < this.maxHP) this.hp += GameConstants.player.healRate;

        /**
         * For a player to drift, the following conditions must be satisfied:
         * - They cannot be EMP'd.
         * - They must be pressing the drift key OR (not exclusive) be under the effect of a destabilizer.
         */
        const drifting = this.empTimer <= 0 && (this.gyroTimer > 0 || this.drift);

        // If the player is drifting or EMP'd, they cannot use their shield.
        this.shield = (!drifting && this.empTimer <= 0) || this.baseTimer > 0;

        // The player cannot conduct any further actions while EMP'd.
        if (this.empTimer > 0) return;

        this.move(drifting);
        if (this.attack && this.charge > 0) this.fireWeapon();
    }

    move(drifting: boolean): void {
        if (this.hyperdriveTimer > 0) {
        }

        // Update position from velocity.
        v2.add(this.position, this.velocity);

        // Juking.
        if ((this.jukeLeft || this.jukeRight) && this.charge > 0) {
            this.charge = -22;

            this.jukeTimer = (this.trail === Trail.Random ? 1.25 : 1) * (this.jukeLeft ? 22 : -22);
        }

        if (Math.abs(this.jukeTimer) > 1) {
            this.position.x += this.jukeTimer * this.direction.y;
            this.position.y -= this.jukeTimer * this.direction.x;

            this.jukeTimer *= 0.36;
        }
    }

    fireWeapon(): void {}

    /**
     * Process a given input packet.
     * @param packet The packet to process.
     */
    processInput(packet: InputPacket): void {
        if (this.dead) return;

        this.moveFwd = packet.moveFwd;
        this.moveBwd = packet.moveBwd;
        this.turnLeft = packet.turnLeft;
        this.turnRight = packet.turnRight;
        this.jukeLeft = packet.jukeLeft;
        this.jukeRight = packet.jukeRight;
        this.drift = packet.drift;

        this.attack = packet.attack;
        this.tryShield = packet.shield;
        this.cslot = packet.cslot;

        if (this.weapons[packet.queuedSlot]) this.weaponManager.queuedSlot = packet.queuedSlot;
    }

    get data(): Required<EntitiesNetData[EntityType.Player]> {
        return {
            position: this.position,
            direction: this.direction,
            full: {
                dead: this.dead
            }
        };
    }
}

export class PlayerManager extends EntityPool<Player> {
    override readonly type = EntityType.Player;

    players: Player[] = [];
    newPlayers: Player[] = [];
    deletedPlayers: number[] = [];

    leaderboard: LeaderboardEntry[] = [];
    leaderboardDirty = true;

    constructor(game: Game) {
        super(game, Player);
    }

    add(client: Client, packet: JoinPacket, position: Vec2): Player {
        const player = this.allocEntity(
            client,
            packet.username || `${GameConstants.player.defaultName} ${this.game.guestIdx}`,
            position
        );

        this.newPlayers.push(player);
        this.players.push(player);

        this.resetPlayer(player);
        this.updateLeaderboard();

        this.game.logger.info("Server", `"${player.name} joined the game.`);

        return player;
    }

    resetPlayer(player: Player): void {
        player.position = player.lastDockPosition;

        this.game.grid.updateEntity(player);

        player.hp = player.maxHP;
        player.jettisonCargo();
        player.refillAmmo();

        player.dead = false;

        player.setFullDirty();

        for (const key in player.dirty) {
            player.dirty[key as keyof typeof player.dirty] = true;
        }

        player.activeSlot = 0;
    }

    removePlayer(player: Player): void {
        player.destroy();
        this.deletedPlayers.push(player.id);

        this.game.logger.info(`"${player.name}" left the game.`);
    }

    updateLeaderboard(): void {
        const count = Math.min(this.players.length, GameConstants.leaderboardMaxEntries);
        const newBoard = this.players
            .map(x => ({ playerId: x.id, xp: x.xp, rank: x.rank }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, count);

        if (this.isLeaderboardDirty(newBoard)) {
            this.leaderboard = newBoard;
            this.leaderboardDirty = true;
        }
    }

    isLeaderboardDirty(other: LeaderboardEntry[]): boolean {
        if (this.leaderboard.length !== other.length) return true;

        for (let i = 0; i < other.length; i++) {
            const newEntry = other[i];
            const oldEntry = this.leaderboard[i];

            if (newEntry.playerId !== oldEntry.playerId) return true;
            if (newEntry.xp !== oldEntry.xp) return true;
            if (newEntry.rank !== oldEntry.rank) return true;
        }

        return false;
    }

    flush(): void {
        this.deletedPlayers.length = 0;
        this.newPlayers.length = 0;

        this.leaderboardDirty = false;

        for (let i = 0; i < this.players.length; i++) {
            const player = this.players[i];
            for (const key in player.dirty) player.dirty[key as keyof Player["dirty"]] = false;

            // Delete unregistered players.
            if (!player.__type) {
                this.players.slice(i, 1);
                continue;
            }
        }
    }
}
