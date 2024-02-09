<script lang="ts">
    export let title: string;
    export let content: string;
    export let colSpan: number = 1;
    export let rowSpan: number = 1;
    export let textSize: number = 1;
    export let bold: boolean = true;
</script>

<div class="col-span-{colSpan} row-span-{rowSpan} bg-primary rounded-lg p-6 text-center">
    <p class="text-center text-wrap pb-2 text-xl">{title}</p>
    <div class="flex items-center shadow-inner bg-accent rounded min-h-[73%]">
        <p class="text-center text-wrap min-w-full align-middle text-{textSize === 1 ? "" : textSize}xl {bold ? "font-bold" : ""} p-2">
            {content}
        </p>
    </div>
</div>