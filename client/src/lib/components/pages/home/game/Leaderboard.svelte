<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    
    const { app }: { app: App } = $props();
</script>

<div>
    <h3 class="text-2xl">Leaderboard</h3>
    <table>
        <thead>
            <tr>
                <th></th>
                <th>Name</th>
                <th>Exp</th>
                <th>Rank</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>
