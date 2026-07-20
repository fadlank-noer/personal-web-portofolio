<template>
    <div class="work-experience w-full mt-2">
        <TimelineItem 
            v-for="(experience, index) in experiences"
            :key="index"
            :experience="experience"
            :isLast="index === experiences.length - 1"
        />
    </div>
</template>

<script setup>
import TimelineItem from './TimelineItem.vue';

defineProps({
    experiences: {
        type: Array,
        required: true
    }
});
</script>

<style scoped>
/* Optional: Add styles if needed */
</style>