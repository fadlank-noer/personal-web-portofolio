<template>
    <div class="w-full flex">
        <!-- Bullet and Lines -->
        <TimelineBullet :isLast="isLast" />

        <!-- Work Experience -->
        <div class="work-div basis-10/12 my-7 bg-white rounded-lg shadow-md p-5 md:p-6 hover:shadow-lg transition-shadow duration-300">
            <div class="flex justify-between items-start mb-4">
                <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{{ experience.date }}</span>
                <i class="text-lg font-semibold text-(--primary-color)">{{ experience.company }}</i>
            </div>

            <h3 class="text-2xl md:text-3xl font-bold my-3 text-gray-800">{{ experience.title }}</h3>
            <ul class="space-y-2">
                <li
                    v-for="(duty, dutyIndex) in experience.duties"
                    :key="dutyIndex"
                    class="flex items-start"
                >
                    <span class="text-(--primary-color) mr-2 mt-1">•</span>
                    <span class="text-gray-700">{{ duty }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import TimelineBullet from './TimelineBullet.vue';

defineProps({
    experience: {
        type: Object,
        required: true
    },
    isLast: {
        type: Boolean,
        default: false
    }
});
</script>

<style scoped>
/* Optional: Add styles if needed */
</style>