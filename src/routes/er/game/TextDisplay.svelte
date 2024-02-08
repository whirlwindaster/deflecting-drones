<script lang="ts">
    export let title: string;
    export let content: string;
    export let colSpan: number = 1;
    export let rowSpan: number = 1;
</script>

<div class="col-span-{colSpan} row-span-{rowSpan} bg-primary rounded-lg p-6 text-center w-full">
    <p class="text-center pb-2 text-xl">{title}</p>
    <div class="shadow-inner bg-accent rounded min-h-[50%]">
        <p class="text-center text-7xl font-bold p-2">
            {content}
        </p>
    </div>
</div>