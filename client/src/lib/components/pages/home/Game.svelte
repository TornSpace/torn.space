<script lang="ts">
    import { AppState, type App } from "$lib/game/App.svelte";

    import BaseMenu from "./game/BaseMenu.svelte";
    import Radar from "./game/Radar.svelte";
    import Map from "./game/Map.svelte";

    const { app }: { app: App } = $props();

    let mapCanvas = $state<HTMLCanvasElement>();
    let radarCanvas = $state<HTMLCanvasElement>();
</script>

<BaseMenu {app} />
<Map enabled={app.state > AppState.Splash} bind:canvas={mapCanvas} />
<Radar enabled={app.state === AppState.Space} bind:canvas={radarCanvas} />
