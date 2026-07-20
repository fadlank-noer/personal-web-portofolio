<template>
    <div id="anchor-experience" class="w-screen min-h-screen mx-auto px-4 md:px-10 py-8 md:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12 text-xl md:text-2xl bg-gradient-to-br from-gray-50 to-gray-100 overflow-x-hidden overflow-y-hidden">
        <!-- Left Column -->
        <div class="w-full">
            <ExperienceHeader />
            <StatsContainer />
        </div>
        
        <!-- Right Column - Work Experience -->
        <div class="w-full">
            <WorkExperience :experiences="experiences" />
        </div>
    </div>
</template>

<script setup>
import ExperienceHeader from './header/ExperienceHeader.vue';
import StatsContainer from './stats/StatsContainer.vue';
import WorkExperience from './timeline/WorkExperience.vue';

const experiences = [
    {
        title: 'CO-Founder',
        company: 'Valtara Capital',
        date: 'Jun 2025 – Present',
        duties: [
            'Make a Technical Decision for the Company',
            'Maintaining Valtara Trade System',
            'Designing a system for the company'
        ],
    },
    {
        title: 'Associate Engineer',
        company: 'PT Meteor Inovasi Digital',
        date: 'Jun 2022 – Jul 2025',
        duties: [
            'Developing an E-wallet app with team as Backend',
            'Developing a Customer Loyalty App with team as Fullstack',
            'Developing a After Sales Service App with team as Backend'
        ],
    },
    {
        title: 'Trainee',
        company: 'PT Dumbways Indonesia Teknologi',
        date: 'Feb 2022 - May 2022',
        duties: [
            'Learning Fullstack Developer Course',
        ],
    },
    {
        title: 'Travel Consultant',
        company: 'PT Dwidaya Worldwide',
        date: 'Apr 2018 - Nov 2021',
        duties: [
            'Ticketing with Travelport galileo, Amadeus and Sabre.',
            'Fulfilling customer needs and exceed the customer expectations from our services.',
            'Tour leader and guiding at guided tours.',
        ],
    },
    {
        title: 'Student',
        company: '57 Vocational Highschool',
        date: 'Jun 2015 - Mar 2018',
        duties: [
            'Learning as Student',
        ],
    }
];
</script>

<style scoped>
/* Optional: Add timeline gradient or animation if needed */
</style>
