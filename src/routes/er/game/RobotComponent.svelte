<script lang="ts">
    import type { RobotColor } from "$lib/types";
    import { demonstrator } from "$lib/stores";
    import { onMount } from "svelte";
    import { wsSend } from "$lib/helpers";
    import { clickoutside } from '@svelte-put/clickoutside';

    export let ws: WebSocket;
    export let robot: RobotColor;

    let showControls = false;

    function handleKeyboard(e: KeyboardEvent) {
        switch (e.key) {
            case (`${robot}`):
                onClick();
                break;
            case ("ArrowUp"):
                if (showControls) {
                    wsSend(ws, {
                        category: "move",
                        robot: robot,
                        direction: "up"
                    });
                }
                break;
            case ("ArrowRight"):
                if (showControls) {
                    wsSend(ws, {
                        category: "move",
                        robot: robot,
                        direction: "right"
                    });
                }
                break;
            case ("ArrowDown"):
                if (showControls) {
                    wsSend(ws, {
                        category: "move",
                        robot: robot,
                        direction: "down"
                    });
                }
                break;
            case ("ArrowLeft"):
                if (showControls) {
                    wsSend(ws, {
                        category: "move",
                        robot: robot,
                        direction: "left"
                    });
                }
                break;
            default:
                showControls = false;
                break;
        }
    }

    // think about this
    let onClick: () => void = () => {};

    onMount(() => {
        demonstrator.subscribe((playerName) => {
            if (playerName === localStorage.getItem("username")) {
                onClick = () => {
                    showControls = true;
                }
            }
            else {
                onClick = () => {};
            }
        })

        //document.addEventListener("click", () => {setTimeout(() => showControls = false, 1000);});
        document.addEventListener("keydown", handleKeyboard);
    });
    
</script>

{#if robot}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
        class="absolute z-10"
        src={`/robots/${robot}_robot.svg`}
        alt={`${robot} robot`}
        on:click={onClick}
    />
    {#if showControls}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
            class="absolute z-20 -top-10 hover:cursor-pointer"
            src="/up_arrow.svg"
            alt="up arrow"
            on:click={() => {
                wsSend(ws, {
                    category: "move",
                    robot: robot,
                    direction: "up"
                });
            }}
            use:clickoutside
            on:clickoutside={() => {
                console.log('lol lmao');
                showControls = false;
            }}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
            class="absolute z-20 rotate-90 left-10 hover:cursor-pointer"
            src="/up_arrow.svg"
            alt="right arrow"
            on:click={() => wsSend(ws, {
                category: "move",
                robot: robot,
                direction: "right"
            })}
            use:clickoutside
            on:clickoutside={() => showControls = false}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
            class="absolute z-20 rotate-180 top-10 hover:cursor-pointer"
            src="/up_arrow.svg"
            alt="down arrow"
            on:click={() => wsSend(ws, {
                category: "move",
                robot: robot,
                direction: "down"
            })}
            use:clickoutside
            on:clickoutside={() => showControls = false}
        />
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <img
            class="absolute z-20 -rotate-90 -left-10 hover:cursor-pointer"
            src="/up_arrow.svg"
            alt="left arrow"
            on:click={() => wsSend(ws, {
                category: "move",
                robot: robot,
                direction: "left"
            })}
            use:clickoutside
            on:clickoutside={() => showControls = false}
        />
    {/if}
{/if}
