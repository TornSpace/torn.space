<script lang="ts">
    let {
        canvas = $bindable(),
        enabled
    }: {
        canvas: HTMLCanvasElement
        enabled: boolean
    } = $props();
</script>

<canvas bind:this={canvas} class:hidden={!enabled}></canvas>
