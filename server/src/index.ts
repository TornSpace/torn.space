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

import { config } from "./config";
import { Game } from "./modules/Game";

import type { SocketData } from "./modules/ClientManager";

import { Logger } from "@/common/utils/Logger";

const game = new Game(config);
const logger = new Logger(config.logging);

Bun.serve<SocketData, "/serverinfo" | "/play">({
    hostname: config.gameServer.host,
    port: config.gameServer.port,
    tls: config.gameServer.ssl
        ? {
              key: Bun.file(config.gameServer.ssl.key),
              cert: Bun.file(config.gameServer.ssl.cert)
          }
        : undefined,
    routes: {
        "/serverinfo": _req =>
            Response.json(
                {
                    playerCount: game.playerManager.players.length
                },
                {
                    headers: {
                        // TODO: Change this to something more restrictive.
                        "Access-Control-Allow-Origin": "*"
                    }
                }
            ),
        "/play": (req, server) => {
            const upgraded = server.upgrade(req, {
                data: {
                    client: undefined
                } as unknown as SocketData
            });

            if (!upgraded) return new Response("Websocket upgrade failed", { status: 500 });
            return new Response("Upgrade successful.");
        }
    },
    async fetch(_request, _server) {
        return new Response("Not found!", { status: 404 });
    },
    websocket: {
        idleTimeout: 30,
        open(socket) {
            game.clientManager.add(socket);
        },
        message(socket, message) {
            if (message instanceof Buffer) socket.data.client.processPacket(message.buffer);
            else {
                logger.warn("Server", `Received invalid message type: ${typeof message}.`);
                socket.close();
            }
        },
        close(socket) {
            game.clientManager.remove(socket);
        }
    }
});

// oxfmt-ignore
logger.info("Server", `************************************************************************************************************************`);
// oxfmt-ignore
logger.info("Server", ` ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄        ▄     ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▄▄▄▄▄ `);
// oxfmt-ignore
logger.info("Server", `▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░▌      ▐░▌   ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌`);
// oxfmt-ignore
logger.info("Server", ` ▀▀▀▀█░█▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░▌░▌     ▐░▌   ▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀▀▀ `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌▐░▌    ▐░▌   ▐░▌          ▐░▌       ▐░▌▐░▌       ▐░▌▐░▌          ▐░▌          `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌ ▐░▌   ▐░▌   ▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄█░▌▐░█▄▄▄▄▄▄▄█░▌▐░▌          ▐░█▄▄▄▄▄▄▄▄▄ `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░▌  ▐░▌  ▐░▌   ▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌▐░▌          ▐░░░░░░░░░░░▌`);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░▌       ▐░▌▐░█▀▀▀▀█░█▀▀ ▐░▌   ▐░▌ ▐░▌    ▀▀▀▀▀▀▀▀▀█░▌▐░█▀▀▀▀▀▀▀▀▀ ▐░█▀▀▀▀▀▀▀█░▌▐░▌          ▐░█▀▀▀▀▀▀▀▀▀ `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░▌       ▐░▌▐░▌     ▐░▌  ▐░▌    ▐░▌▐░▌             ▐░▌▐░▌          ▐░▌       ▐░▌▐░▌          ▐░▌          `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░█▄▄▄▄▄▄▄█░▌▐░▌      ▐░▌ ▐░▌     ▐░▐░▌ ▄  ▄▄▄▄▄▄▄▄▄█░▌▐░▌          ▐░▌       ▐░▌▐░█▄▄▄▄▄▄▄▄▄ ▐░█▄▄▄▄▄▄▄▄▄ `);
// oxfmt-ignore
logger.info("Server", `     ▐░▌     ▐░░░░░░░░░░░▌▐░▌       ▐░▌▐░▌      ▐░░▌▐░▌▐░░░░░░░░░░░▌▐░▌          ▐░▌       ▐░▌▐░░░░░░░░░░░▌▐░░░░░░░░░░░▌`);
// oxfmt-ignore
logger.info("Server", `      ▀       ▀▀▀▀▀▀▀▀▀▀▀  ▀         ▀  ▀        ▀▀  ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀            ▀         ▀  ▀▀▀▀▀▀▀▀▀▀▀  ▀▀▀▀▀▀▀▀▀▀▀ `);
// oxfmt-ignore
logger.info("Server", `                                                                                                                        `);
// oxfmt-ignore
logger.info("Server", `***************************f*********************************************************************************************`);
// oxfmt-ignore
logger.info("Server", "This program is free software: you can redistribute it and / or modify it under the terms of the GNU Affero General");
// oxfmt-ignore
logger.info("Server", "Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any");
// oxfmt-ignore
logger.info("Server", "later version. You should have received a copy of the GNU Affero General Public License along with this program. If not,");
logger.info("Server", "see <https://www.gnu.org/licenses/>.");
logger.info("Server", "");
logger.info("Server", "");
logger.info("Server", "Source code is available at https://github.com/TornSpace/torn.space.");
