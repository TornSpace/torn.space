<script lang="ts">
    import { SortOrder, type LeaderboardEntry } from "./helpers";

    import { Team } from "@/common/constants";

    let sortOrder = $state(SortOrder.Experience);
    let data = $state<LeaderboardEntry[]>([]);

    function sortLB (): void {}
</script>

<main class="text-white min-h-screen w-full absolute top-0 left-0 bg-black/50">
    <div class="container mx-auto">
        <h1 class="text-center text-4xl font-semibold mt-10 mb-2">Leaderboard</h1>
        <div class="table-wrapper">
            <div class="table-actions flex mx-5 mt-2 mb-4">
                <select onchange={sortLB} bind:value={sortOrder}>
                    <option value={SortOrder.Experience}>Sort By</option>
                    <option value={SortOrder.ELO}>ELO</option>
                    <option value={SortOrder.Kills}>Kills</option>
                    <option value={SortOrder.Money}>Money</option>
                    <option value={SortOrder.Tech}>Tech</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Experience</th>
                        <th scope="col">ELO</th>
                        <th scope="col">Rank</th>
                        <th scope="col">Kills</th>
                        <th scope="col">Money</th>
                        <th scope="col">Tech</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data as entry, i (i)}
                        <tr
                            class:text-human={entry.t === Team.Human}
                            class:text-alien={entry.t === Team.Alien}
                            class:text-cyborg={entry.t === Team.Cyborg}
                        >
                            <td aria-label="position">{entry.p}.</td>
                            <td aria-label="name">{entry.n}</td>
                            <td aria-label="xp">{entry.x}</td>
                            <td aria-label="elo">{entry.e}</td>
                            <td aria-label="rank">{entry.r}</td>
                            <td aria-label="kills">{entry.k}</td>
                            <td aria-label="money">{entry.m}</td>
                            <td aria-label="tech">{entry.r}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</main>
