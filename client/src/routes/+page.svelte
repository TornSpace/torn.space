<script lang="ts">
    import { onMount } from "svelte";

    import Canvas from "$lib/components/pages/home/Canvas.svelte";
    import Game from "$lib/components/pages/home/Game.svelte";
    import Splash from "$lib/components/pages/home/Splash.svelte";

    import { App, AppState } from "$lib/game/App.svelte";

    // oxlint-disable-next-line no-unassigned-vars
    let canvas: HTMLCanvasElement;

    let app = new App();

    onMount(() => {
        app.init(canvas);

        app.connect();
    });
</script>

{#if app.state === AppState.Splash}
    <Splash />
{:else}
    <Game {app} />
{/if}
<Canvas bind:canvas={canvas} enabled={app.state > AppState.Splash} />
