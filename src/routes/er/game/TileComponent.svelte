<script lang="ts">
    import RobotComponent from "./RobotComponent.svelte";
    import type { Tile } from "$lib/types"

    export let ws: WebSocket;
    export let tile: Tile;    
</script>

<div class={`border-2 border-dark_grey relative pb-[100%] bg-${(tile.coord.x + tile.coord.y) % 2 === 0 ? "background " : "background_dark " }${tile.right_wall ? "border-r-grey " : ""}${tile.left_wall ? "border-l-grey " : ""}${tile.top_wall ? "border-t-grey " : ""}${tile.bottom_wall ? "border-b-grey " : ""}`}>
    {#if tile.goal}
        <img 
            class="absolute z-0"
            src={`/goals/${tile.goal.color}_${tile.goal.shape}.svg`}
            alt={`${tile.goal.color} ${tile.goal.shape} goal`}
        />
    {/if}
    {#if tile.robot}
        <RobotComponent robot={tile.robot} ws={ws} />
    {/if}
</div>
