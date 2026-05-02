<script lang="ts">
    import { onMount } from "svelte";

    import Splash from "$lib/components/pages/home/Splash.svelte";
    import Canvas from "$lib/components/pages/home/Canvas.svelte";

    import { App, AppState } from "$lib/game/App.svelte";

    // oxlint-disable-next-line no-unassigned-vars
    let canvas: HTMLCanvasElement;

    let app = new App();
;

    onMount(() => {
        app.init(canvas);
    });
</script>

<Splash enabled={app.state === AppState.Splash} />
<Canvas bind:canvas={canvas} enabled={app.state > AppState.Splash} />
