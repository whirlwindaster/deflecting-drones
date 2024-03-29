<script lang="ts">
    import type { RobotColor } from '$lib/types';
    import { demonstrator } from '$lib/stores';
    import { onMount } from 'svelte';
    import { wsSend } from '$lib/helpers';

    export let ws: WebSocket;
    export let robot: RobotColor;

    let showControls = false;
    let shouldHideControls = false;

    let handleRobotClick: () => void = () => {};
    let handleCaptureDocumentClick = () => {
        showControls = false;
    };
    let handleBubbleDocumentClick = () => {
        // this event listener hears the robot click after svelte renders the controls,
        // so shouldHideControls is needed to only hide the controls the second time this is called
        // see line 95
        if (shouldHideControls) {
            showControls = false;
            shouldHideControls = false;
            document.removeEventListener('click', handleBubbleDocumentClick, false);
            document.addEventListener('click', handleCaptureDocumentClick, true);
        } else {
            shouldHideControls = true;
        }
    };

    function handleKeyboard(e: KeyboardEvent) {
        switch (e.key) {
            case `${robot}`:
                handleRobotClick();
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (showControls) {
                    wsSend(ws, {
                        category: 'move',
                        robot: robot,
                        direction: 'up'
                    });
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (showControls) {
                    wsSend(ws, {
                        category: 'move',
                        robot: robot,
                        direction: 'right'
                    });
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (showControls) {
                    wsSend(ws, {
                        category: 'move',
                        robot: robot,
                        direction: 'down'
                    });
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (showControls) {
                    wsSend(ws, {
                        category: 'move',
                        robot: robot,
                        direction: 'left'
                    });
                }
                break;
            default:
                showControls = false;
                break;
        }
    }

    onMount(() => {
        document.addEventListener('click', handleCaptureDocumentClick, true);

        demonstrator.subscribe((playerName) => {
            if (playerName === localStorage.getItem('username')) {
                handleRobotClick = () => {
                    showControls = true;
                    shouldHideControls = false;

                    document.removeEventListener('click', handleBubbleDocumentClick, false);
                    document.removeEventListener('click', handleCaptureDocumentClick, true);
                    document.addEventListener('click', handleBubbleDocumentClick, false);
                };
                document.addEventListener('keydown', handleKeyboard);
            } else {
                showControls = false;
                shouldHideControls = false;

                handleRobotClick = () => {};
                document.removeEventListener('click', handleCaptureDocumentClick, true);
                document.removeEventListener('click', handleBubbleDocumentClick, false);
                document.removeEventListener('keydown', handleKeyboard);
            }
        });

        return () => {
            document.removeEventListener('click', handleCaptureDocumentClick, true);
            document.removeEventListener('click', handleBubbleDocumentClick, false);
            document.removeEventListener('keydown', handleKeyboard);
        };
    });
</script>

<!-- keydown events are handled by handleKeyboard -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<img
    class="absolute z-10"
    src={`/robots/${robot}_robot.svg`}
    alt={`${robot} robot`}
    on:click={handleRobotClick}
/>
{#if showControls}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
        class="absolute z-20 -top-10 hover:cursor-pointer"
        src="/up_arrow.svg"
        alt="up arrow"
        on:click|capture={() => {
            wsSend(ws, {
                category: 'move',
                robot: robot,
                direction: 'up'
            });
        }}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
        class="absolute z-20 rotate-90 left-10 hover:cursor-pointer"
        src="/up_arrow.svg"
        alt="right arrow"
        on:click|capture={() =>
            wsSend(ws, {
                category: 'move',
                robot: robot,
                direction: 'right'
            })}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
        class="absolute z-20 rotate-180 top-10 hover:cursor-pointer"
        src="/up_arrow.svg"
        alt="down arrow"
        on:click|capture={() =>
            wsSend(ws, {
                category: 'move',
                robot: robot,
                direction: 'down'
            })}
    />
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <img
        class="absolute z-20 -rotate-90 -left-10 hover:cursor-pointer"
        src="/up_arrow.svg"
        alt="left arrow"
        on:click|capture={() =>
            wsSend(ws, {
                category: 'move',
                robot: robot,
                direction: 'left'
            })}
    />
{/if}
