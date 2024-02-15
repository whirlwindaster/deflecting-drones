<script>
    import pregame from '$lib/images/pregame.png'
    import bidding from '$lib/images/bidding.png';
    import solution1 from '$lib/images/solution1.png';
    import solution2 from '$lib/images/solution2.png';
    import demonstration from '$lib/images/demonstration.png';
    import next_round from '$lib/images/next_round.png';
    import { goto } from '$app/navigation';
</script>

<div class="bg-primary shadow-2xl rounded-lg p-8 m-8">
    <h1 class="hover:cursor-pointer hover:underline text-center" on:click={() => { goto('/er'); }} on:keydown={() => { goto('/er'); }}> home</h1>
    <h1 class="text-4xl text-center my-2">How to Play</h1>
    <p class="text-xl my-2">
        When you first create or join a game, you will see a screen like this:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="The pre-game display, showing the players in the room, the game code, and the game configuration." src={pregame} />
    </div>
    <p class="text-xl my-2">
        You can share the game code, seen in the top right corner, to allow others to join your game.
        You can also view the players in the game and the game configuration.
        If you're the host, you can change the game configuration here.
    </p>
    <p class="text-xl my-2">
        Once you're ready to start, the host will click the 'start!' button in the bottom right corner. You will then see this:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="The beginning of a round." src={bidding} />
    </div>
    <p class="text-xl my-2">
        Robots have been randomly placed on the board and the first round has begun.
    </p>
    <p class="text-xl my-2">
        The board state at the beginning of each round is a puzzle
        with the objective of getting the robot of the corresponding color to the goal displayed on the right
        (in this case, the green moon) by moving the robots. A robot can move up, down, left, or right, but once it moves,
        it cannot stop until it hits a wall or another robot. For the rainbow goal, the board can be solved by
        moving any robot to it.
    </p>
    <p class="text-xl my-2">
        In the allotted time, you will calculate a solution to this puzzle. For example, this board state has an 8-move solution:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="An 8-move solution." src={solution1} />
    </div>
    <p class="text-xl my-2">
        Once you've found a solution, enter the number of moves your solution takes
        in the 'enter bid' box in the bottom right corner, then click 'submit bid!'. Note that a solution must have at least 2 moves.
    </p>
    <p class="text-xl my-2">
        Once you do, your bid will appear in the 'queued bids' section and the post-bid timer will be set.
        In this time, any player (including you) may submit their own competing bids. If another player makes a bid with fewer moves than yours,
        it will be placed before yours in the queue. And indeed, this board state has a solution with fewer than 8 moves:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="A 6-move solution involving the blue robot." src={solution2} />
    </div>
    <p class="text-xl my-2">
        As you can see, you may use robots besides the one corresponding to the goal in your solution.
        In this case, the blue robot stops the green robot early, giving it a quicker path to the goal.
        Since this solution takes fewer than 8 moves, it's placed first in the queue.
    </p>
    <p class="text-xl my-2">
        Once the timer is up, the player with the lowest bid will demonstrate their solution (in case of a tie, the earliest bidder goes first).
        When it's your turn to demonstrate, your board's background will change colors:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="The demonstration screen." src={demonstration} />
    </div>
    <p class="text-xl my-2">
        Clicking on a robot will reveal a menu allowing you to move it up, down, left, or right.
        Robots can also be controlled by pressing the corresponding letter key ((r)ed, (g)reen, bl(u)e, (y)ellow, (b)lack) followed by an arrow key.
        Your solution must take exactly as many moves as your bid - no more, no less.
    </p>
    <p class="text-xl my-2">
        If you fail your demonstration, the robot positions will reset, you will lose a point, and the next bidder in the queue will demonstrate their solution.
        If you succeed, the robots will stay, you will gain a point, and the next round will start:
    </p>
    <div class="bg-accent shadow-inner p-4 rounded-lg max-w-[70%]">
        <img alt="The beginning of a new round." src={next_round} />
    </div>
    <p class="text-xl my-2">
        A new goal will be given (here, the yellow planet), and the process will repeat until the end of the game.
    </p>
    <h1 class="hover:cursor-pointer hover:underline text-center" on:click={() => { goto('/er'); }} on:keydown={() => { goto('/er'); }}> home</h1>
</div>
