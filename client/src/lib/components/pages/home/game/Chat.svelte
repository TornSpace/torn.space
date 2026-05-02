<script lang="ts">
    import type { App } from "$lib/game/App.svelte";
    
    const { app }: { app: App } = $props();

    let message = $state("");
</script>

<input type="text" bind:value={message} placeholder="Press enter to chat!" />
