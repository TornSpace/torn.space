<script lang="ts">
    import type { App } from "$lib/game/App.svelte";

    import BaseMenu from "./game/BaseMenu.svelte";

    const { app }: { app: App } = $props();
</script>

<BaseMenu {app} />
