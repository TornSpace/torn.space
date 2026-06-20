<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    import { EntityType } from "@/common/constants.ts";
    
    const { app }: { app: App } = $props();
</script>

<div class="text-info text-xs text-right mt-2 select-none">
    <span>FPS: {app.fps}</span>
        <br>
        <span>Ping: {app.ping.toFixed(0)} ms</span>
    <br>
    <span>Avg MSPT: {app.debug.msptAvg.toFixed(4)} ms</span>
    <br>
    <span>TPS: {app.debug.tpsAvg}/{app.debug.tpsMin}/{app.debug.tpsMax} (avg/min/max)</span>
    <br>
    <span>Position: {app.camera.position.x.toFixed(1) ?? "NaN"}/{app.camera.position.y.toFixed(1) ?? "NaN"} (x/y)</span>
    <br>
    <br>
    <span>Client Entities: {app.entityManager.entities.length}</span>
    <br>
    {#each Object.entries(app.entityManager.typePoolMap) as [type, pool], i (i)}
        <span>{EntityType[type as unknown as EntityType]}: {pool.activeCount.toString().padStart(5)}/{pool.allocatedCount} -</span>
        <br>
    {/each}
    <br>
    <span>Server Entities: {app.debug.entityCounts.map(x => x.active).reduce((a, b) => a + b)}</span>
    <br>
    {#each app.debug.entityCounts as count, i (i)}
        <span>{EntityType[count.type]}: {count.active.toString().padStart(5)}/{count.allocated} -</span>
        <br>
    {/each}
</div>
