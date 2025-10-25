import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
    const unreadCount = ref(0);

    const setUnreadCount = (count: number) => {
        unreadCount.value = count;
    };

    const decrementUnread = () => {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
    };

    return { unreadCount, setUnreadCount, decrementUnread };
});
