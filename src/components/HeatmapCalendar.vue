<template>
    <div class="heatmap-calendar">
        <div class="weekday-labels">
            <div v-for="day in weekdays" :key="day" class="weekday-label">
                {{ day }}
            </div>
        </div>

        <div class="calendar-grid">
            <div v-for="(week, wIndex) in weeks" :key="wIndex" class="week-column">
                <div v-for="weekday in weekdays" :key="weekday">
                    <div v-if="week[weekday]" :class="['day-square', getStatusClass(week[weekday].status)]"
                        :title="week[weekday].date"></div>
                    <div v-else class="day-square empty"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
    availabilityItems: {
        type: Array,
        required: true
    },
    year: {
        type: Number,
        default: new Date().getFullYear()
    }
});

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function buildAvailabilityMap(items) {
    const map = {};

    items.forEach(item => {
        const start = new Date(item.dateFrom);
        const end = new Date(item.dateTo);

        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + 1); // HACK: It doesn't want to include the last day, so we do last day+1.

        const rangeLength = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;

        for (let i = 0; i < rangeLength; i++) {
            const d = new Date(start.getTime() + i * 86400000);
            const iso = d.toISOString().split('T')[0];

            if (!map[iso] || rangeLength < map[iso].rangeLength) {
                map[iso] = {
                    status: item.available,
                    rangeLength
                };
            }
        }
    });

    // Flatten to just status
    const flatMap = {};
    Object.keys(map).forEach(date => {
        flatMap[date] = map[date].status;
    });

    return flatMap;
}

const weeks = computed(() => {
    const start = new Date(props.year, 0, 1);
    const end = new Date(props.year + 1, 0, 1); // HACK: It doesn't want to include the last day, so we do last day+1.
    const availabilityMap = buildAvailabilityMap(props.availabilityItems);

    const allDays = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().split('T')[0];
        const weekdayIndex = d.getDay(); // 0 = Sunday
        const weekday = weekdayIndex === 0 ? 'Sun' : weekdays[weekdayIndex - 1];
        allDays.push({
            date: iso,
            weekday,
            status: availabilityMap[iso] ?? null
        });
    }

    // Group into weeks starting on Monday
    const weekBuckets = [];
    let currentWeek = {};

    allDays.forEach(day => {
        if (day.weekday === 'Mon' && Object.keys(currentWeek).length > 0) {
            weekBuckets.push(fillWeek(currentWeek));
            currentWeek = {};
        }
        currentWeek[day.weekday] = day;
    });

    if (Object.keys(currentWeek).length > 0) {
        weekBuckets.push(fillWeek(currentWeek));
    }

    return weekBuckets;
});

const fillWeek = (week): object => {
    // Fill missing weekdays with null to keep grid aligned
    const filled = {};
    weekdays.forEach(day => {
        filled[day] = week[day] || null;
    });
    return filled;
}

const getStatusClass = (status: boolean | null): string => {
    if (status === true) return 'available';
    if (status === false) return 'disabled';
    return 'nodata';
}

</script>

<style scoped>
.heatmap-calendar {
    display: flex;
    flex-direction: row;
    gap: 8px;
    overflow-x: auto;
    padding: 8px;
}

.weekday-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-right: 4px;
}

.weekday-label {
    font-size: 12px;
    color: #4b5563;
    height: 16px;
}

.calendar-grid {
    display: flex;
    gap: 4px;
}

.week-column {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.day-square {
    width: 16px;
    height: 16px;
    border-radius: 2px;
}

.available {
    background-color: #4ade80;
}

.disabled {
    background-color: #f87171;
}

.nodata {
    background-color: #d1d5db;
}

.empty {
    background-color: transparent;
    pointer-events: none;
}
</style>