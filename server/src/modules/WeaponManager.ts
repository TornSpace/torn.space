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

import type { Player } from "../entities/Player";

import { WeaponDefs } from "@/common/defs/weaponDefs";

enum WeaponState {
    Idle,
    Firing,
    Switching
}

export class WeaponManager {
    queuedWeapon = -1;

    state = WeaponState.Idle;

    stateTicker = 0;

    constructor(readonly player: Player) {}

    fireWeapon(): void {}

    update(dt: number): void {
        if (this.stateTicker > 0) this.stateTicker -= dt;

        if (this.stateTicker <= 0) {
            const wepDef = this.getCurWepDef();

            switch (this.state) {
                case WeaponState.Firing: {
                    this.fireWeapon();
                    break;
                }
                case WeaponState.Switching: {
                    break;
                }
            }
        }

        if (this.queuedWeapon !== -1) {
            this.player.activeWeapon = this.queuedWeapon;
            this.queuedWeapon = -1;

            this.player.setFullDirty();

            this.state = WeaponState.Switching;
            this.stateTicker = 0;
        }
    }

    getCurWepDef(): void {
        return WeaponDefs.typeToDef(this.player.activeWeapon);
    }
}
