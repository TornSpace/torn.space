<script lang="ts">
    let username = $state("");
    let password = $state("");

    function loginUser(e: SubmitEvent): void {
        e.preventDefault();
    }
</script>

<div class="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300 animate-in fade-in slide-in-from-right">
    <span class="font-bold text-xl">Returning Players</span>
    <form onsubmit={loginUser} class="flex flex-col items-center gap-2 w-full transition-opacity duration-300">
        <input type="text" placeholder="Username" autocomplete="username" required bind:value={username} class="h-12 rounded-xl p-3">
        <input type="password" placeholder="Password" autocomplete="current-password" required bind:value={password} class="h-12 rounded-xl p-3 w-full">

        <input type="submit" value="Login" class="h-12 rounded-xl p-3 text-[1rem]">
    </form>
</div>

<style>
    div {
        animation-duration: 1s;
    }

    input:not([type=submit]) {
        background-color: hsla(0, 0%, 20%, 0.5);
    }

    input[type=submit] {
        background-color: hsla(0, 0%, 47%, 0.5);
        width: 100%;
    }
</style>
