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

import { Application, Ticker } from "pixi.js";

import { Camera } from "./Camera";
import { BaseManager } from "./entities/Base";
import { LootManager } from "./entities/Loot";
import { PlayerManager, type Player } from "./entities/Player";
import { AssetManager } from "./modules/AssetManager";
import { AudioManager } from "./modules/AudioManager";
import { ConfigManager } from "./modules/ConfigManager.svelte";
import { EntityManager } from "./modules/EntityManager";
import { InputManager } from "./modules/InputManager";
import { Localization } from "./modules/Localization.svelte";

import type { Packet } from "@/common/net";
import type { JoinedPacket } from "@/common/net/JoinedPacket";

import { EntityType, GameConstants, PacketType, Team } from "@/common/constants";
import { DisconnectPacket } from "@/common/net/DisconnectPacket";
import { JoinPacket } from "@/common/net/JoinPacket";
import { UpdatePacket } from "@/common/net/UpdatePacket";
import { math } from "@/common/utils/math";
import { PacketStream } from "@/common/utils/PacketStream";

export enum AppState {
    Loading,
    Splash,
    Lore,

    // Anything below is part of the ingame UI.
    Space,
    Home,
    Shop,
    Quests,
    Achievements,
    More,
    Register
}

export class App {
    config = new ConfigManager();
    pixi = new Application();
    camera = new Camera(this);
    localization = new Localization();
    socket?: WebSocket;

    audioManager = new AudioManager(this);
    inputManager = new InputManager(this);

    assetManager?: AssetManager;
    entityManager: EntityManager;

    // beamManager = new BeamManager();
    // blastManager = new BlastManager();
    // bulletManager = new BulletManager();
    // missileManager = new MissileManager();
    // asteroidManager = new AsteroidManager();
    baseManager = new BaseManager();
    lootManager = new LootManager();
    // planetManager = new PlanetManager();
    // turretManager = new TurretManager();
    // vortexManager = new VortexManager();
    playerManager = new PlayerManager();

    state = $state.raw(AppState.Splash);

    fps = $state.raw(0);

    fpsTicker = 0;
    serverDt = 0;
    lastUpdateTime = 0;
    deltaTimes: number[] = [];

    playerId = 0;

    // UI stuff.
    loginUser = $state("");
    loginPass = $state("");

    registerUser = $state("");
    registerPass = $state("");

    guestTeamSelect = $state(Team.Human);

    get player(): Player | undefined {
        return this.entityManager.getById<Player>(this.playerId);
    }

    constructor() {
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
    }

    async init(canvas: HTMLCanvasElement): Promise<void> {
        await this.pixi.init({
            canvas,
            resizeTo: window,
            resolution: window.devicePixelRatio ?? 1,
            antialias: true,
            preference: "webgl",
            eventMode: "none"
        });

        this.localization.setLocale(this.config.config.language);
        this.assetManager = new AssetManager(this, this.pixi.renderer);
    }

    connect(): void {
        // TODO: Use config details.
        const addr = "ws://127.0.0.1:8081/play";

        if (this.socket) {
            this.socket.onclose = function (): void {};
            this.socket.onmessage = function (): void {};
            this.socket.onerror = function (): void {};

            this.socket.close();
            this.socket = undefined;
        }

        this.socket = new WebSocket(addr);
        this.socket.binaryType = "arraybuffer";

        this.socket.onmessage = (event: MessageEvent<ArrayBuffer>): void => {
            this.onMessage(event.data);
        };

        this.socket.onclose = (): void => {
            this.state = AppState.Splash;
        };

        this.socket.onerror = (err): void => {
            console.error(err);
            // TODO: Log to webhook.
        };
    }

    join(): void {
        const packet = new JoinPacket();

        // TODO: Pull from config.
        packet.protocol = 0;

        if (this.loginUser && this.loginPass) {
            packet.guest = false;
            packet.username = this.loginUser;
            packet.token = this.loginPass;
        } else packet.guest = true;

        this.sendPacket(packet);
    }

    startGame(packet: JoinedPacket): void {
        this.state = AppState.Space;
        this.playerId = packet.playerId;
    }

    disconnect(reason: string): void {
        const packet = new DisconnectPacket();
        packet.reason = reason;

        this.sendPacket(packet);
    }

    onMessage(data: ArrayBuffer): void {
        const stream = new PacketStream(data);

        while (true) {
            const packet = stream.deserializeServerPacket();
            if (packet === undefined) break;

            switch (packet.type) {
                case PacketType.Joined:
                    this.startGame(packet);
                    break;
                case PacketType.Update:
                    this.updateFromPacket(packet);
                    break;
            }
        }
    }

    resize(): void {
        this.camera.resize();
    }

    sendPacket(packet: Packet): void {
        if (this.socket !== undefined && this.socket.readyState === this.socket.OPEN) {
            const stream = PacketStream.alloc(128);
            stream.serializeClientPacket(packet);

            this.socket.send(stream.getBuffer());
        }
    }

    update(ticker: Ticker): void {
        const dt = math.clamp(ticker.deltaMS / 1000, 0.001, 0.125) * GameConstants.gameSpeed;

        this.deltaTimes.push(dt);
        this.fpsTicker += dt;

        this.inputManager.update(dt);
        this.entityManager.update(dt);
        this.audioManager.update();

        this.camera.render(dt);

        this.inputManager.flushInputs();

        if (this.fpsTicker > 2) {
            this.fpsTicker = 0;

            const avgDt = this.deltaTimes.reduce((a, b) => a + b) / this.deltaTimes.length;

            this.fps = Math.round(1 / avgDt);
            this.deltaTimes.length = 0;
        }
    }

    updateFromPacket(packet: UpdatePacket): void {
        const now = performance.now();

        this.serverDt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        for (let i = 0; i < packet.deletedEntities.length; i++) {
            this.entityManager.deleteEntity(packet.deletedEntities[i]);
        }
    }
}
