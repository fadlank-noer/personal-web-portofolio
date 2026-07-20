<template>
    <div class="basis-1/12 relative">
        <div class="x-bullet w-7 h-7 bg-(--primary-color) rounded-full absolute top-8">
        </div>
        <div
            :class="[
                'x-lines',
                'w-3',
                'h-full',
                'bg-gradient-to-b',
                'absolute',
                'left-2',
                'top-9',
                'from-[var(--primary-color)]',
                'via-[var(--secondary-color)]',
                'to-[var(--gradient-first)]',
                isLast ? 'hidden' : ''
            ]" 
        >
        </div>
    </div>
</template>

<script setup>
defineProps({
    isLast: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
/* Optional: Add styles if needed */
</style>