<script lang="ts">
    import { onMount } from 'svelte';
    import {
        DEFAULT_CONFIG,
        type Coordinate,
        type GameConfig,
        type GenericMessageToPlayer,
        type RobotColor,
        type Tile,
        type Bid,
        type Goal
    } from '$lib/types';
    import TileComponent from './TileComponent.svelte';
    import { demonstrator } from '$lib/stores';
    import TextDisplay from './TextDisplay.svelte';
    import { secondsToClockString, toSeconds, wsSend } from '$lib/helpers';

    let board: Tile[][] = [];
    for (let x = 0; x < 16; x++) {
        const row: Tile[] = [];
        for (let y = 0; y < 16; y++) {
            row.push({
                goal: null,
                robot: null,
                right_wall: false,
                left_wall: false,
                top_wall: false,
                bottom_wall: false,
                coord: { x: x, y: y }
            });
        }
        board.push(row);
    }

    let log: string[] = [];
    let players: [string, number][] = [];
    let amHost: boolean = false;
    let round: number = 0;
    let currentGoal: Goal | null;
    let myName: string;
    let m_demonstrator: string = '';
    let demo_moves: number = 0;
    let bids: Bid[] = [];
    let gameCode: string = '';
    let timer: number = 0;
    let gameConfig: GameConfig = DEFAULT_CONFIG;
    let robotPositions: Record<RobotColor, Coordinate> = {
        r: { x: 0, y: 0 },
        y: { x: 0, y: 0 },
        g: { x: 0, y: 0 },
        u: { x: 0, y: 0 },
        b: { x: 0, y: 0 }
    };

    demonstrator.subscribe((playerName) => (m_demonstrator = playerName));

    let interval: NodeJS.Timer | number;
    let bidInput: string = '';
    let chatInput: string = '';

    function scrollChat() {
        (document.getElementById('chatEnd') as HTMLElement).scrollIntoView({
            block: 'nearest',
            inline: 'nearest'
        });
    }

    let chatFocused = false;

    let ws: WebSocket;

    onMount(() => {
        ws = new WebSocket(
            `ws://dd-api.whirlwinda.st/er/ws?uuid=${localStorage.getItem('uuid')}`
        );

        ws.onerror = () => {
            window.alert('websocket connection failed. create or join a new game');
        };
        ws.onmessage = (m) => {
            const message = JSON.parse(m.data) as GenericMessageToPlayer;
            if (message.log) {
                log = [...log, `[SERVER]: ${message.log}`];
                scrollChat();
            }
            switch (message.category) {
                case 'chat':
                    //log = [`${message.name}: ${message.msg}`, ...log];
                    log = [...log, `${message.name}: ${message.msg}`];
                    scrollChat();
                    break;
                case 'check_in':
                    players = message.players.map((playerName) => [playerName, 0]);
                    amHost = message.is_host;
                    myName = message.name;
                    gameCode = message.game_code;
                    gameConfig = message.game_config;
                    for (const goal of message.goals) {
                        board[goal.coord.x][goal.coord.y].goal = goal;
                    }
                    for (const right_wall of message.right_walls) {
                        board[right_wall.x][right_wall.y].right_wall = true;
                        board[right_wall.x + 1][right_wall.y].left_wall = true;
                    }
                    for (const bottom_wall of message.bottom_walls) {
                        board[bottom_wall.x][bottom_wall.y].bottom_wall = true;
                        board[bottom_wall.x][bottom_wall.y + 1].top_wall = true;
                    }
                    board = board;
                    break;
                case 'player_update':
                    if (message.add) {
                        players = [...players, [message.name, 0]];
                    } else {
                        players = players.filter(([playerName, _]) => playerName !== message.name);
                    }
                    break;
                case 'robot_update':
                    for (const [robot, coord] of message.robots) {
                        board[robotPositions[robot].x][robotPositions[robot].y].robot = null;
                        board[coord.x][coord.y].robot = robot;
                        robotPositions[robot] = coord;
                    }
                    // TODO make sure this assignment is needed
                    board = board;
                    break;
                case 'timer':
                    clearInterval(interval);
                    timer = message.seconds;
                    interval = setInterval(() => {
                        timer -= 1;
                        if (timer === 0) clearInterval(interval);
                    }, 1000);
                    break;
                case 'new_round':
                    currentGoal = message.goal;
                    bids = [];
                    round += 1;
                    demonstrator.set('');
                    demo_moves = 0;
                    break;
                case 'bid':
                    bids.unshift({ player: message.name, moves: message.moves });
                    for (let i = 0; i < bids.length - 1; i++) {
                        if (bids[i].moves >= bids[i + 1].moves) {
                            const temp = bids[i];
                            bids[i] = bids[i + 1];
                            bids[i + 1] = temp;
                        }
                    }
                    bids = bids;
                    break;
                case 'demonstrator':
                    bids.shift();
                    bids = bids;
                    demonstrator.set(message.name);
                    demo_moves = message.moves;
                    break;
                case 'score':
                    for (let i = 0; i < players.length; i++) {
                        if (players[i][0] === message.name) {
                            players[i][1] += message.points;
                            break;
                        }
                    }
                    players = players.sort(([_, aScore], [__, bScore]) =>
                        bScore > aScore ? 1 : -1
                    );
                    break;
            }
        };

        function handleKeyboard(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                if (chatFocused) {
                    wsSend(ws, {
                        category: 'chat',
                        msg: chatInput
                    });
                    chatInput = '';
                } else if (round) {
                    wsSend(ws, {
                        category: 'bid',
                        moves: parseInt(bidInput)
                    });
                    bidInput = '';
                }
            }
        }

        document.addEventListener('keydown', handleKeyboard);

        return () => {
            document.removeEventListener('keydown', handleKeyboard);
            ws.close();
        };
    });
</script>

<body class="min-h-screen bg-gradient-to-b from-background_dark to-background m-9">
    <div class="grid grid-cols-7 grid-rows-4 gap-6">
        <!-- left panes -->
        <div class="grid grid-rows-subgrid grid-cols-subgrid row-span-4 col-span-2 gap-6">
            <!-- leaderboard -->
            <div class="col-span-2 row-span-2 bg-primary rounded-lg p-6">
                <p class="text-xl text-center pb-2">leaderboard</p>
                <div class="overflow-y-scroll bg-accent shadow-inner rounded min-h-max h-max">
                    <ol class="list-decimal pl-6">
                        {#each players as [playerName, score]}
                            <li class="py-2">{`${playerName}: ${score}`}</li>
                        {/each}
                    </ol>
                </div>
            </div>

            <!-- chat -->
            <div class="col-span-2 row-span-2 bg-primary rounded-lg p-6 h-full">
                <p class="text-xl text-center pb-2">chat</p>
                <div
                    class="overflow-y-scroll bg-accent shadow-inner rounded min-h-[75%] max-h-[75%]"
                >
                    {#each log as msg}
                        <p>{msg}</p>
                    {/each}
                    <div id="chatEnd" />
                </div>
                <div class="flex items-center pt-4 gap-2">
                    <input
                        class="bg-accent w-4/5 shadow-inner rounded"
                        bind:value={chatInput}
                        on:focus={() => {
                            chatFocused = true;
                        }}
                        on:blur={() => {
                            chatFocused = false;
                        }}
                    />
                    <button
                        class="bg-accent rounded w-1/5 shadow hover:cursor-default hover:shadow-md"
                        on:click={() => {
                            wsSend(ws, {
                                category: 'chat',
                                msg: chatInput
                            });
                            chatInput = '';
                        }}
                    >
                        send
                    </button>
                </div>
            </div>
        </div>

        <!-- board -->
        <div
            class="col-span-3 row-span-4 bg-{m_demonstrator === myName
                ? 'danger'
                : 'primary'} rounded-lg p-6"
        >
            <div class="grid grid-cols-16 border-dark_grey border-2 border-solid shadow">
                {#each Array(16) as _, y}
                    {#each Array(16) as _, x}
                        <TileComponent tile={board[x][y]} {ws} />
                    {/each}
                {/each}
            </div>
        </div>

        {#if round}
            <TextDisplay title="timer" content={secondsToClockString(timer)} textSize={6} />
            <TextDisplay title="round" content={round.toString()} textSize={7} />

            <!-- goal display -->
            <div class="bg-primary rounded-lg p-6 text-center">
                <p class="text-center pb-2 text-xl">goal</p>
                <div class="shadow-inner bg-accent rounded min-h-[70%]">
                    <img
                        class="mx-auto w-24 h-24"
                        src={`/goals/${currentGoal?.color || 'm'}_${
                            currentGoal?.shape || 'vortex'
                        }.svg`}
                        alt={`${currentGoal?.color || 'm'} ${currentGoal?.shape || 'vortex'} goal`}
                    />
                </div>
            </div>

            <TextDisplay
                title="showing bid"
                content={m_demonstrator ? `${m_demonstrator}: ${demo_moves}` : ''}
            />

            <!-- queued bids -->
            <div class="col-span-2 bg-primary rounded-lg p-6 text-center">
                <p class="text-center pb-2 text-xl">queued bids</p>
                <div class="shadow-inner bg-accent rounded min-h-[70%]">
                    {#each bids as bid, rank}
                        <p class="py-1">{`${rank + 1}. ${bid.player}: ${bid.moves}`}</p>
                    {/each}
                </div>
            </div>

            <!-- bid submit -->
            <div
                class="flex flex-col justify-center items-center col-span-2 bg-primary min-w-full rounded-lg p-6"
            >
                <input
                    class="bg-accent shadow-inner rounded w-full p-3 mb-2 text-center"
                    type="number"
                    min="2"
                    max="500"
                    placeholder="enter bid"
                    bind:value={bidInput}
                />
                <button
                    class="bg-accent border-background rounded p-3 w-full mt-2 hover:shadow"
                    on:click={() => {
                        wsSend(ws, {
                            category: 'bid',
                            moves: parseInt(bidInput)
                        });
                        bidInput = '';
                    }}
                >
                    submit bid!
                </button>
            </div>
        {:else}
            <!-- game code -->
            <div class="col-span-2 bg-primary rounded-lg p-6 text-center w-full">
                <p class="text-center pb-2 text-xl">code</p>
                <div class="shadow-inner bg-accent rounded h-max">
                    <p class="text-center text-7xl font-bold p-2">{gameCode}</p>
                </div>
            </div>

            <!-- game config -->
            <div class="col-span-2 row-span-2 bg-primary rounded-lg p-6 text-center">
                <div class="bg-accent rounded shadow-inner h-full">
                    <p class="text-xl p-6">rounds: {gameConfig.num_rounds}</p>
                    <p class="text-xl p-6">
                        pre-bid timeout: {secondsToClockString(
                            toSeconds(gameConfig.pre_bid_timeout)
                        )}
                    </p>
                    <p class="text-xl p-6">
                        post-bid timeout: {secondsToClockString(
                            toSeconds(gameConfig.post_bid_timeout)
                        )}
                    </p>
                    <p class="text-xl p-6">
                        demo timeout: {secondsToClockString(toSeconds(gameConfig.demo_timeout))}
                    </p>
                </div>
            </div>

            <!-- start button -->
            <div class="col-span-2 p-6 bg-primary rounded-lg">
                {#if amHost}
                    <button
                        class="rounded bg-accent border-background p-4 w-full h-full text-center shadow hover:shadow-lg text-8xl font-light"
                        on:click={() => {
                            wsSend(ws, {
                                category: 'start'
                            });
                        }}
                    >
                        start!
                    </button>
                {:else}
                    <button
                        class="rounded bg-grey p-4 w-full h-full text-center shadow mx-auto text-8xl font-light cursor-default"
                    >
                        start!
                    </button>
                {/if}
            </div>
        {/if}
    </div>
</body>
