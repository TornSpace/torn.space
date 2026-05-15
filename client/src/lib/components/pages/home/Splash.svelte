<script lang="ts">
    import { AppState, type App } from "$lib/game/App.svelte";
    import Guest from "./splash/Guest.svelte";
    import Links from "./splash/Links.svelte";
    import Login from "./splash/Login.svelte";
    import Logo from "./splash/Logo.svelte";
    import Lore from "./splash/Lore.svelte";
    import Settings from "./splash/Settings.svelte";

    import Gradient from "$lib/img/ui/backgrounds/gradient.png";

    const { app }: { app: App } = $props();
</script>

<div class="w-screen h-screen text-white overflow-hidden font-game">
    <div class="bg-black/50 w-full h-full duration-300 animate-in fade-in"></div>
    <img src={Gradient} alt="Vignette" class="absolute top-0 left-0 w-full h-full duration-300 animate-in fade-in">
    <div class="absolute top-0 left-0 flex flex-col xl:flex-row justify-around items-center w-full h-full px-50 pb-50" class:hidden={app.state !== AppState.Splash}>
        <Guest {app} />
        <Logo />
        <Login bind:username={app.loginUser} bind:password={app.loginPass} />
    </div>
    {#if app.state === AppState.Lore}
        <Lore {app} text={app.localization.translation.lore[app.guestTeamSelect]} team={app.guestTeamSelect} />
    {:else}
        <Links />
        <div class="absolute bottom-2 right-2 duration-1500 animate-in fade-in">
            <Settings {app} />
        </div>
    {/if}
</div>
