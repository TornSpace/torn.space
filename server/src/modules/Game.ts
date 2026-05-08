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

import { ClientManager } from "./ClientManager";
import { EntityManager } from "./EntityManager";
import { Grid } from "./Grid";

import { PlayerManager } from "../entities/Player";
import { BaseManager } from "../entities/universe/Base";
import { LootManager } from "../entities/universe/Loot";

import type { Config } from "../../../config.d";
import type { Packet } from "@/common/net";

import { EntityType, GameConstants } from "@/common/constants";
import { Logger } from "@/common/utils/Logger";
import { math } from "@/common/utils/math";
import { PacketStream } from "@/common/utils/PacketStream";
import { util } from "@/common/utils/util";
import { v2 } from "@/common/utils/v2";

export class Game {
    grid = new Grid(
        GameConstants.sectorWidth * GameConstants.mapSize,
        GameConstants.sectorWidth * GameConstants.mapSize
    );

    entityManager: EntityManager;
    clientManager = new ClientManager(this);

    // beamManager = new BeamManager(this);
    // blastManager = new BlastManager(this);
    // bulletManager = new BulletManager(this);
    // missileManager = new MissileManager(this);
    // asteroidManager = new AsteroidManager(this);
    baseManager = new BaseManager(this);
    lootManager = new LootManager(this);
    // planetManager = new PlanetManager(this);
    // turretManager = new TurretManager(this);
    // vortexManager = new VortexManager(this);
    playerManager = new PlayerManager(this);

    packetStream = new PacketStream(new ArrayBuffer(1 << 10));

    now = performance.now();

    tpsAvg = 0;
    tpsMin = 0;
    tpsMax = 0;

    msptAvg = 0;

    perfTicker = 0;
    tickTimes: number[] = [];
    deltaTimes: number[] = [];

    debugTpsDirty = true;
    debugObjCountDirty = true;

    timer: Timer;
    logger: Logger;

    // TODO: Make sure this doesn't go above a `Uint8`.
    guestIdx = 0;

    constructor(readonly config: Config) {
        this.logger = new Logger(this.config.logging);
        this.logger.splash("Server");
        this.logger.info("Server", `Bound to ${config.gameServer.host}:${config.gameServer.port}.`);

        this.entityManager = new EntityManager(this, {
            // [EntityType.Beam]: this.beamManager,
            // [EntityType.Blast]: this.blastManager,
            // [EntityType.Bullet]: this.bulletManager,
            // [EntityType.Missile]: this.missileManager,
            // [EntityType.Asteroid]: this.asteroidManager,
            [EntityType.Base]: this.baseManager,
            [EntityType.Loot]: this.lootManager,
            // [EntityType.Planet]: this.planetManager,
            // [EntityType.Turret]: this.turretManager,
            // [EntityType.Vortex]: this.vortexManager,
            [EntityType.Player]: this.playerManager
        });

        this.timer = setInterval(this.update.bind(this), 1000 / config.tps);

        // Spawn bases.
        for (const [team, sectors] of Object.entries(GameConstants.base.spawns)) {
            for (let i = 0; i < sectors.length; i++) {
                const sector = sectors[i];
                const sectorVec = v2.new(sector[0], sector[1]);

                this.baseManager.allocEntity(parseInt(team), sectorVec);
                this.logger.debug("Game", `Spawned base in sector ${util.sectorToString(sectorVec)}.`);
            }
        }

        this.logger.info("Game", `Spawned ${this.baseManager.pool.length} bases.`);
    }

    /**
     * Make a request to the API server.
     * @param endpoint The API endpoint. Must begin with `/`.
     * @param method The HTTP Request method to use.
     * @param body An optional payload to send.
     */
    fetch(endpoint: string, method: RequestInit["method"], body?: RequestInit["body"]): Promise<Response> {
        return fetch(this.config.gameServer.apiUrl + endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.secrets.TORN_GS_KEY}`
            },
            body
        });
    }

    update(): void {
        const now = performance.now();
        const dt = math.clamp((now - this.now) / 1000, 0.001, 0.125) * GameConstants.gameSpeed;

        this.now = now;

        // Update entities.
        this.entityManager.update(dt);

        // Cache entity serializations.
        this.entityManager.serializeEntities();
        this.clientManager.sendPackets(dt);

        this.debugTpsDirty = false;
        this.debugObjCountDirty = false;

        // Reset.
        this.packetStream.stream.index = 0;

        this.playerManager.flush();

        this.deltaTimes.push(dt);
        this.tickTimes.push(performance.now() - this.now);

        this.perfTicker += dt;

        if (this.perfTicker > 5) {
            this.perfTicker = 0;

            this.tpsAvg = Math.round(1 / this.deltaTimes.reduce((a, b) => a + b) / this.deltaTimes.length);
            this.tpsMin = Math.round(1 / Math.max(...this.deltaTimes));
            this.tpsMax = Math.round(1 / Math.min(...this.deltaTimes));

            this.deltaTimes.length = 0;

            this.msptAvg = this.tickTimes.reduce((a, b) => a + b) / this.tickTimes.length;

            this.debugTpsDirty = true;
        }
    }

    sendPacket(packet: Packet): void {
        this.packetStream.serializeServerPacket(packet);
    }
}
