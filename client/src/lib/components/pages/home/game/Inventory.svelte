<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    import { ShipDefs } from "@/common/defs/shipDefs";

    const { app }: { app: App } = $props();
    
    // oxlint-disable-next-line typescript/no-extra-non-null-assertion
    const def = $derived(ShipDefs.typeToDef(app.player!?.ship));
</script>

<div class="flex">
    <div class="grow"></div>
    <div class="flex justify-end bg-black/45 rounded-tl-2xl rounded-bl-2xl pe-4 py-1 select-none">
        <table class="text-sm text-info opacity-50 transition-opacity duration-1000 hover:opacity-100" class:opacity-100={app.wepSwitchTicker > 0}>
            <thead>
                <tr>
                    <th class="text-right font-normal pe-10">Weapon</th>
                    <th class="text-right font-normal">Ammo</th>
                </tr>
            </thead>
            <tbody>
                {#if app.playerId && app.player}
                    {#each app.player.weapons as weapon, i (i)}
                        <tr>
                            <td
                                class="text-right pe-10"
                                class:text-cyborg={app.player.activeWeapon === i}
                                class:text-warning={i + 1 > def.slots}
                            >{app.localization.translation.weapons[weapon].name}:&nbsp;&nbsp;{i}</td>
                            <td class="text-right"
                                    class:text-cyborg={app.player.activeWeapon === i}
                                    class:text-warning={i + 1 > def.slots}
                            >{app.player.ammo[i] === -2 ? "Only One" : app.player.ammo[i] === -1 ? "Inf." : app.player.ammo[i]}</td>
                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>
