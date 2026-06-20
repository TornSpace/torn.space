<script lang="ts">
    import type { App } from "$lib/game/App.svelte.ts";
  import { Team } from "@/common/constants.ts";
    
    const { app }: { app: App } = $props();
</script>

<div>
    <div class="bg-card text-info px-6 pt-2 pb-4 rounded-bl-2xl select-none">
        <h3 class="text-2xl text-center mb-2">Leaderboard</h3>
        <table class="w-70 max-w-70 text-sm">
            <thead>
                <tr>
                    <th></th>
                    <th class="text-left font-normal px-1">Name</th>
                    <th class="text-right font-normal">Exp</th>
                    <th class="text-right font-normal">Rank</th>
                </tr>
            </thead>
            <tbody>
                {#each app.leaderboard as entry, i (i)}
                    <tr>
                        <td>{i + 1}.</td>
                        <td>
                            <span
                                class="rounded-sm px-1 py-0.5"
                                class:text-human={app.playerManager.getPlayerData(entry.playerId).team === Team.Human}
                                class:text-alien={app.playerManager.getPlayerData(entry.playerId).team === Team.Alien}
                                class:text-cyborg={app.playerManager.getPlayerData(entry.playerId).team === Team.Cyborg}
                                class:bg-human-dark={entry.playerId === app.playerId && app.player?.team === Team.Human}
                                class:bg-alien-dark={entry.playerId === app.playerId && app.player?.team === Team.Alien}
                                class:bg-cyborg-dark={entry.playerId === app.playerId && app.player?.team === Team.Cyborg}
                            >{app.playerManager.getPlayerData(entry.playerId).name}</span>
                        </td>
                        <td class="text-right">{entry.xp}</td>
                        <td class="text-right">{entry.rank}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
