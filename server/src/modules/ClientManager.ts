import type { ServerEntity } from "../entities/Entity.ts";
import type { Player } from "../entities/Player.ts";
import type { Game } from "./Game.ts";
import type { Packet } from "@/common/net.ts";
import type { ServerWebSocket } from "bun";

import { GameConstants, PacketType, type PlayerSaveData } from "@/common/constants.ts";
import { DebugFlags, DebugPacket } from "@/common/net/DebugPacket.ts";
import { UpdatePacket } from "@/common/net/UpdatePacket.ts";
import { RectHitbox } from "@/common/utils/hitbox.ts";
import { math } from "@/common/utils/math.ts";
import { PacketStream } from "@/common/utils/PacketStream.ts";
import { v2, type Vec2 } from "@/common/utils/v2.ts";

export class ClientManager {
    clients: Client[] = [];

    constructor(readonly game: Game) {}

    add(socket: ServerWebSocket<SocketData>): Client {
        const client = new Client(this.game, socket);

        this.clients.push(client);
        socket.data.client = client;

        return client;
    }

    remove(socket: ServerWebSocket<SocketData>): void {
        const client = socket.data.client;

        this.clients.splice(this.clients.indexOf(client), 1);

        if (client.player) client.game.playerManager.removePlayer(client.player);
    }

    sendPackets(dt: number): void {
        for (let i = 0; i < this.clients.length; i++) {
            const client = this.clients[i];

            if (client.socket.readyState !== 1 || !client.sentJoinPacket) continue;
            client.sendPackets(dt);
        }
    }
}

export class Client {
    player?: Player;

    pingSequence = 0;

    speed = 1;
    direction = v2.new(1, 0);

    debug = true;
    forceSendDebugInfo = true;

    sentJoinPacket = false;

    private packetStream = PacketStream.alloc(1 << 16);
    private visibleEntities = new Set<ServerEntity>();

    private firstPacket = true;

    constructor(
        readonly game: Game,
        readonly socket: ServerWebSocket<SocketData>,
        public position: Vec2 = v2.new(GameConstants.sectorWidth / 2, GameConstants.sectorWidth / 2)
    ) {}

    processPacket(buffer: ArrayBuffer): void {
        const packetStream = new PacketStream(buffer);
        let packet: Packet | undefined = undefined;

        try {
            packet = packetStream.deserializeClientPacket();
        } catch (err) {
            this.game.logger.warn("Server", "Failed to deserialize packet:", err);
            this.socket.close();
        }

        if (packet === undefined) return;

        if (!this.player && packet.type === PacketType.Join) {
            if (packet.guest) {
                this.player = this.game.playerManager.addPlayer(this, packet, packet.team);
                this.sentJoinPacket = true;
            } else {
                const { username, token } = packet;
                this.game
                    .fetch("/user/login", JSON.stringify({ username, token }))
                    .then(res => {
                        if (res.status === 200) {
                            res.json().then((data: PlayerSaveData) => {
                                this.player = this.game.playerManager.addPlayer(this, packet, data.team, data);
                                this.sentJoinPacket = true;
                            });
                        } else {
                            this.game.logger.warn("Failed to authenticate client.");
                            this.socket.close();
                        }
                    })
                    .catch(err => {
                        this.game.logger.warn("Failed to authenticate client:", err);
                        this.socket.close();
                    });
            }

            return;
        }

        if (!this.player) return;

        switch (packet.type) {
            case PacketType.Input: {
                this.pingSequence = packet.inputSequence;
                this.player.processInput(packet);
                break;
            }
            case PacketType.Respawn: {
                if (!this.player.dead) break;
                this.game.playerManager.resetPlayer(this.player);
                break;
            }
            case PacketType.Disconnect: {
                this.game.playerManager.removePlayer(this.player);
                break;
            }
            case PacketType.DebugToggle: {
                if (this.game.config.allowDebugging) {
                    this.debug = packet.enabled;
                    this.forceSendDebugInfo = packet.enabled;
                }
                break;
            }
        }
    }

    sendPackets(dt: number): void {
        this.sendUpdatePacket(dt);

        if (this.debug) {
            this.sendDebugPacket();
            this.forceSendDebugInfo = false;
        }

        this.packetStream.stream.writeBytes(this.game.packetStream.stream, 0, this.game.packetStream.stream.byteIndex);

        const buffer = this.packetStream.getBuffer();
        this.sendData(buffer);

        this.packetStream.stream.index = 0;
        this.firstPacket = false;
    }

    sendUpdatePacket(dt: number): void {
        if (!this.player) return;
        const updatePacket = new UpdatePacket();

        // Calculate visible, deleted, and dirty entities, and send them to the client.
        const rect = RectHitbox.fromCircle(GameConstants.player.viewRadius, this.position);
        const newVisibleEntities = this.game.grid.intersectsHitbox(rect, this.player.sector);

        for (const entity of this.visibleEntities) {
            if (!newVisibleEntities.has(entity)) updatePacket.deletedEntities.push(entity.id);
        }

        for (const entity of newVisibleEntities) {
            if (!this.visibleEntities.has(entity) || this.game.entityManager.dirtyFull[entity.id]) {
                updatePacket.serverFullEntities.push(entity);
            } else if (this.game.entityManager.dirtyPart[entity.id]) updatePacket.serverPartialEntities.push(entity);
        }

        this.visibleEntities = newVisibleEntities;

        if (this.player) {
            updatePacket.playerData = this.player;
            updatePacket.playerDataDirty = this.player.dirty;

            updatePacket.newPlayers = this.firstPacket
                ? this.game.playerManager.players
                : this.game.playerManager.newPlayers;

            updatePacket.deletedPlayers = this.game.playerManager.deletedPlayers;
        } else {
            // TODO: Finish this.
            // Spectators.
            this.position = v2.add(this.position, v2.mult(this.direction, this.speed * dt));

            updatePacket.cameraPosition = this.position;
            updatePacket.cameraPositionDirty = true;

            // Map bounds.
            if (this.position.x < 0 || this.position.x > GameConstants.maxPosition) this.direction.x *= -1;
            if (this.position.y < 0 || this.position.y > GameConstants.maxPosition) this.direction.y *= -1;

            this.position.x = math.clamp(this.position.x, 0, GameConstants.maxPosition);
            this.position.y = math.clamp(this.position.y, 0, GameConstants.maxPosition);
        }

        //
        // Projectile manager content here.
        //

        if (this.firstPacket || this.game.playerManager.leaderboardDirty) {
            updatePacket.leaderboardDirty = true;
            updatePacket.leaderboard = this.game.playerManager.leaderboard;
        }

        //
        // hit manager
        //

        updatePacket.updateSequence = this.pingSequence;

        this.sendPacket(updatePacket);
    }

    sendDebugPacket(): void {
        const debugPacket = new DebugPacket();

        debugPacket.tpsAvg = this.game.tpsAvg;
        debugPacket.tpsMin = this.game.tpsMin;
        debugPacket.tpsMax = this.game.tpsMax;

        if (this.game.debugTpsDirty || this.forceSendDebugInfo) debugPacket.flags |= DebugFlags.TPS;

        debugPacket.msptAvg = this.game.msptAvg;

        debugPacket.entityCounts = this.game.entityManager.counts;

        if (this.game.debugObjCountDirty || this.forceSendDebugInfo) debugPacket.flags |= DebugFlags.Objects;

        if (debugPacket.flags > 0) this.sendPacket(debugPacket);
    }

    sendPacket(packet: Packet): void {
        this.packetStream.serializeServerPacket(packet);
    }

    sendData(data: ArrayBuffer): void {
        try {
            this.socket.sendBinary(data);
        } catch (err) {
            this.game.logger.error("Server", "Error sending data:", err);
        }
    }
}

export interface SocketData {
    client: Client;
}
