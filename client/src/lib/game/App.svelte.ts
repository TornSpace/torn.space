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

import { AudioManager } from "./AudioManager";
import { Camera } from "./Camera";
import { LootManager } from "./entities/Loot";
import { PlayerManager, type Player } from "./entities/Player";
import { EntityManager } from "./EntityManager";
import { InputManager } from "./InputManager";

import { EntityType, GameConstants } from "@/common/constants";
import { Packet } from "@/common/net";
import { UpdatePacket } from "@/common/net/UpdatePacket";
import { math } from "@/common/utils/math";
import { PacketStream } from "@/common/utils/PacketStream";

export enum AppState {
    Splash,

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
    pixi = new Application();
    camera = new Camera(this);
    socket?: WebSocket;

    audioManager = new AudioManager(this);
    inputManager = new InputManager(this);

    entityManager: EntityManager;

    lootManager = new LootManager();
    playerManager = new PlayerManager();

    state = $state.raw(AppState.Splash);

    fps = $state.raw(0);

    fpsTicker = 0;
    serverDt = 0;
    lastUpdateTime = 0;
    deltaTimes: number[] = [];

    playerId = 0;

    get player(): Player | undefined {
        return this.entityManager.getById<Player>(this.playerId);
    }

    constructor() {
        this.entityManager = new EntityManager(this, {
            [EntityType.Loot]: this.lootManager,
            [EntityType.Player]: this.playerManager
        });
    }

    init(canvas: HTMLCanvasElement): void {
        this.pixi.init({
            canvas,
            resizeTo: window,
            resolution: window.devicePixelRatio ?? 1,
            antialias: true,
            preference: "webgl",
            eventMode: "none"
        });
    }

    connect(): void {
        // TODO: Use config details.
        const addr = "";

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

    onMessage(data: ArrayBuffer): void {
        const stream = new PacketStream(data);

        while (true) {
            const packet = stream.deserializeServerPacket();
            if (packet === undefined) break;

            switch (true) {
                case packet instanceof UpdatePacket:
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

        for (const id of packet.deletedEntities) this.entityManager.deleteEntity(id);
    }
}
