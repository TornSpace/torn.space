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

import { Application, Assets, Graphics, Texture, Ticker, TilingSprite } from "pixi.js";

import { BaseManager } from "./entities/Base.ts";
import { LootManager } from "./entities/Loot.ts";
import { PlayerManager, type Player } from "./entities/Player.svelte";
import { AssetManager } from "./modules/AssetManager.ts";
import { AudioManager } from "./modules/AudioManager.ts";
import { Camera } from "./modules/Camera.svelte";
import { ConfigManager } from "./modules/ConfigManager.svelte";
import { EntityManager } from "./modules/EntityManager.svelte";
import { InputManager } from "./modules/InputManager.ts";
import { Localization } from "./modules/Localization.svelte";

import type { ClientEntity } from "./entities/ClientEntity.ts";
import type { Packet } from "@/common/net.ts";
import type { DebugPacket } from "@/common/net/DebugPacket.ts";
import type { JoinedPacket } from "@/common/net/JoinedPacket.ts";

import { EntityType, GameConstants, type LeaderboardEntry, PacketType, Team } from "@/common/constants.ts";
import { DisconnectPacket } from "@/common/net/DisconnectPacket.ts";
import { JoinPacket } from "@/common/net/JoinPacket.ts";
import { UpdatePacket } from "@/common/net/UpdatePacket.ts";
import { math } from "@/common/utils/math.ts";
import { PacketStream } from "@/common/utils/PacketStream.ts";
import { assert } from "@/common/utils/util.ts";
import { v2, type Vec2 } from "@/common/utils/v2.ts";

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

    assetManager!: AssetManager;
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
    ticker = 0;

    fpsTicker = 0;
    serverDt = 0;
    lastUpdateTime = 0;
    deltaTimes: number[] = [];
    wepSwitchTicker = $state(0);

    playerId = $state(0);

    // UI stuff.
    loginUser = $state("");
    loginPass = $state("");

    registerUser = $state("");
    registerPass = $state("");

    guestTeamSelect = $state(Team.Human);
    guestMode = true;

    leaderboard = $state.raw<LeaderboardEntry[]>([]);

    // PIXI stuff.
    bgSprite?: TilingSprite;
    mapGraphics = new Graphics();
    mapStars: Vec2[] = [];

    // Debug info.
    ping = 0;
    debug = $state({
        tpsAvg: 0,
        tpsMin: 0,
        tpsMax: 0,
        msptAvg: 0,
        entityCounts: [] as DebugPacket["entityCounts"]
    });

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
        this.localization.setLocale(this.config.config.language);

        await this.pixi.init({
            canvas,
            resizeTo: window,
            resolution: window.devicePixelRatio ?? 1,
            antialias: true,
            preference: "webgl",
            eventMode: "none"
        });

        this.assetManager = new AssetManager(this, this.pixi.renderer);
        this.audioManager.init();
        this.inputManager.init();

        this.pixi.ticker.add(this.update.bind(this));
        this.pixi.renderer.on("resize", this.resize.bind(this));

        this.pixi.stage.addChild(this.camera.container);

        this.resize();
        this.connect();
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
        packet.protocol = GameConstants.protocol;

        if (this.loginUser && this.loginPass) {
            this.guestMode = false;
            packet.guest = false;
            packet.username = this.loginUser;
            packet.token = this.loginPass;
        } else {
            this.guestMode = true;
            packet.guest = true;
            packet.team = this.guestTeamSelect;
        }

        this.sendPacket(packet);
    }

    startGame(packet: JoinedPacket): void {
        this.state = AppState.Space;
        this.playerId = packet.playerId;

        this.drawMap();
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
                case PacketType.Debug:
                    this.updateDebugInfo(packet);
                    break;
                case PacketType.Joined:
                    this.startGame(packet);
                    break;
                case PacketType.Update:
                    this.updateFromPacket(packet);
                    break;
            }
        }
    }

    /**
     * Sets up the game for drawing the background. Called only once.
     */
    drawMap(): void {
        const bgTex = Assets.get<Texture>("space.img");
        this.bgSprite = new TilingSprite({
            texture: bgTex,
            width: 2048 * 3,
            height: 2048 * 3,
            anchor: 0.5
        });

        this.camera.addObject(this.bgSprite);
        this.camera.addObject(this.mapGraphics);

        this.drawBackground();

        for (let i = 0; i < GameConstants.client.starCount; i++) {
            this.mapStars[i] = v2.new(Math.random(), Math.random());
        }
    }

    /**
     * Draws background image, vignette, and stars.
     * Called once every update frame.
     */
    drawBackground(): void {
        if (!this.bgSprite) return;

        // Space image background.
        const bgDelta = v2.new(
            math.remap(
                math.mod(
                    this.camera.position.x * GameConstants.client.backgroundSpeed,
                    this.camera.width / Camera.scale
                ),
                0,
                this.camera.width,
                0,
                this.bgSprite.texture.width
            ),
            math.remap(
                math.mod(
                    this.camera.position.y * GameConstants.client.backgroundSpeed,
                    this.camera.height / Camera.scale
                ),
                0,
                this.camera.height,
                0,
                this.bgSprite.texture.height
            )
        );

        this.bgSprite.position.copyFrom(Camera.vecToScreen(v2.sub(this.camera.position, bgDelta)));
        this.mapGraphics.clear();

        // Vignette background. Probably can simplify calculations here.
        const dims = v2.new(this.camera.width, this.camera.height);

        const chalfdims = v2.mult(dims, 1 / (2 * this.camera.container.scale.x * Camera.scale));
        const cmin = v2.sub(this.camera.position, chalfdims);
        const cmax = v2.add(this.camera.position, chalfdims);

        const vmin = Camera.vecToScreen(cmin);
        const vmax = Camera.vecToScreen(cmax);

        this.mapGraphics.rect(vmin.x, vmin.y, vmax.x - vmin.x, vmax.y - vmin.y).fill({ color: 0x000000, alpha: 0.5 });

        // Stars background.
        const wm = (vmax.x - vmin.x) / GameConstants.client.starMirrors;
        const hm = (vmax.y - vmin.y) / GameConstants.client.starMirrors;

        const rdims = v2.new(wm, hm);

        for (let i = 0; i < this.mapStars.length; i++) {
            const star = this.mapStars[i];
            const color = `rgb(${128 + 32 * (i % 4)},${128 + 32 * ((i / 4) % 4)},${128 + 32 * ((i / 16) % 4)})`;

            let parallax = (100 - i) / 100.0;
            parallax = parallax ** 4;

            // Star position relative to viewport center.
            const starPos = v2.mulComp(star, rdims);

            // Stars have a minimum size of 1x1 (game units) and maximum size of 3x3. Game units are 1px on a 1920x1080 screen.
            const starSize = 3 - i / (GameConstants.client.starCount / 2);
            this.mapGraphics.setStrokeStyle({ width: starSize });

            const dx = Camera.unitToScreen(this.camera.position.x) * parallax * GameConstants.client.starSpeed;
            const dy = Camera.unitToScreen(this.camera.position.y) * parallax * GameConstants.client.starSpeed;

            const x = Camera.unitToScreen(this.camera.position.x) + math.mod(starPos.x - dx, wm);
            const y = Camera.unitToScreen(this.camera.position.y) + math.mod(starPos.y - dy, hm);

            for (let j = 0; j < GameConstants.client.starMirrors; j++) {
                for (let k = 0; k < GameConstants.client.starMirrors; k++) {
                    const min = v2.new(
                        j * wm + x - this.camera.width / (2 * this.camera.container.scale.x),
                        k * hm + y - this.camera.height / (2 * this.camera.container.scale.y)
                    );
                    const max = v2.add(min, v2.new(starSize));

                    this.mapGraphics.rect(min.x, min.y, max.x - min.x, max.y - min.y).fill({ color });
                }
            }

            // TODO: Hyperdrive line effect.
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
        this.ticker = (this.ticker + dt) % Number.MAX_SAFE_INTEGER;

        this.deltaTimes.push(dt);
        this.fpsTicker += dt;

        this.inputManager.update(dt);
        this.entityManager.update(dt);
        this.audioManager.update();

        this.drawBackground();

        this.camera.render(dt);

        this.inputManager.flushInputs();

        if (this.fpsTicker > 2) {
            this.fpsTicker = 0;

            const avgDt = this.deltaTimes.reduce((a, b) => a + b) / this.deltaTimes.length;

            this.fps = Math.round(1 / avgDt);
            this.deltaTimes.length = 0;
        }

        if (this.wepSwitchTicker > 0) this.wepSwitchTicker -= dt;
    }

    updateFromPacket(packet: UpdatePacket): void {
        const now = performance.now();

        this.serverDt = (now - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = now;

        for (let i = 0; i < packet.deletedEntities.length; i++) {
            this.entityManager.deleteEntity(packet.deletedEntities[i]);
        }

        for (let i = 0; i < packet.newPlayers.length; i++) {
            const newPlayer = packet.newPlayers[i];
            this.playerManager.playerData.set(newPlayer.id, {
                name: newPlayer.name,
                team: newPlayer.team
            });
        }

        for (let i = 0; i < packet.deletedPlayers.length; i++) {
            this.playerManager.playerData.delete(packet.deletedPlayers[i]);
        }

        for (let i = 0; i < packet.fullEntities.length; i++) {
            const entityData = packet.fullEntities[i];
            assert(entityData.__type, "Invalid entity type.");

            let entity: ClientEntity | undefined = this.entityManager.getById(entityData.id);

            if (entity === undefined) {
                entity = this.entityManager.createEntity(entityData.__type, entityData.id, entityData.data);
            } else this.entityManager.updateFullEntity(entityData.id, entityData.data);
        }

        for (let i = 0; i < packet.partialEntities.length; i++) {
            const entityData = packet.partialEntities[i];
            this.entityManager.updatePartialEntity(entityData.id, entityData.data);
        }

        if (packet.leaderboardDirty) this.leaderboard = packet.leaderboard;

        if (packet.cameraPositionDirty) this.camera.position = packet.cameraPosition;
        else if (this.player) {
            this.camera.position = this.player.position;

            if (packet.playerDataDirty.weapons) this.player.weapons = packet.playerData.weapons;
            if (packet.playerDataDirty.ammo) this.player.ammo = packet.playerData.ammo;
        }

        if (packet.updateSequence === this.inputManager.inputSequence && this.inputManager.sequenceInFlight) {
            this.inputManager.sequenceInFlight = false;
            const now = performance.now();
            this.ping = now - this.inputManager.lastSequenceTime;
        }
    }

    updateDebugInfo(packet: DebugPacket): void {
        this.debug.tpsAvg = packet.tpsAvg;
        this.debug.tpsMin = packet.tpsMin;
        this.debug.tpsMax = packet.tpsMax;
        this.debug.msptAvg = packet.msptAvg;

        if (packet.entityCounts.length) this.debug.entityCounts = packet.entityCounts;
    }
}
