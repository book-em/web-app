<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth-store';
import type { MenuItem } from 'primevue/menuitem';
import { UserRole } from '../api/user.api';
import { useRouter } from 'vue-router';
import { NotificationAPI } from '../api/notification.api'; 
import { useNotificationStore } from '../stores/notification-store';


const notificationStore = useNotificationStore();
const auth = useAuthStore();
const navbarItems = ref<MenuItem[]>([]);
const router = useRouter();
let pollingInterval: number | undefined;


onMounted(() => {
    auth.checkLocalStorage();
    computeNavbar();
    fetchUnreadNotifications(); 
    pollingInterval = window.setInterval(fetchUnreadNotifications, 7000);
});

onUnmounted(() => {
    if (pollingInterval) clearInterval(pollingInterval);
    notificationStore.setUnreadCount(0);
});


const fetchUnreadNotifications = async () => {
    try {
        const res = await NotificationAPI.getUnreadNotificationCount(); 
        notificationStore.setUnreadCount(res.data.unreadCount);
        console.log("Unread notifications:", res.data.unreadCount);
    } catch (err) {
        console.error("Failed to fetch unread notifications", err);
    }
};

watch(() => auth.role, (newValue, oldValue) => {
    computeNavbar();
});
watch(() => auth.isLoggedIn, (newValue, oldValue) => {
    computeNavbar();
});
watch(() => auth.id, (newValue, oldValue) => {
    computeNavbar();
});
watch(() => notificationStore.unreadCount, () => {computeNavbar();});

const logOut = () => {
    auth.logout();
    router.push("/login");
};

const computeNavbar = () => {
    navbarItems.value = [];
    navbarItems.value.push({ label: "Book'em", icon: 'pi pi-home', command: () => goto('/') });

    const goto = (to: string) => {
        router.push(to);
    }

    if (auth.isLoggedIn) {
        navbarItems.value.push({
            label: auth.username,
            icon: 'pi pi-user',
            items: [
                { label: `${auth.username} (${auth.role})`, disabled: true, class: "label" },
                { label: 'Settings', icon: 'pi pi-cog', command: () => goto('/my-settings') },
                { label: 'Log out', icon: 'pi pi-sign-out', command: () => logOut() },
            ]
        });
    } else {
        navbarItems.value.push({ label: 'Log in', icon: 'pi pi-user', command: () => goto('/login') });
        navbarItems.value.push({ label: 'Register', icon: 'pi pi-user-plus', command: () => goto('/register') });
    }

    if (auth.isLoggedIn) {

        switch (auth.role) {
            case UserRole.Admin:
                break;
            case UserRole.Guest:
                navbarItems.value.push({ label: 'My Reservations', icon: 'pi pi-book', command: () => goto(`/reservation/user/${auth.id}`) });
                navbarItems.value.push({ label: 'History', icon: 'pi pi-history', command: () => goto('/reservation/history') });
                navbarItems.value.push({ label: 'Notifications' + (notificationStore.unreadCount > 0 ? ` (${notificationStore.unreadCount})` : ''),
                 icon: 'pi' + (notificationStore.unreadCount > 0 ? ` pi-exclamation-circle` : ' pi-bell'), command: () => goto('/notifications') });
                break;
            case UserRole.Host:
                navbarItems.value.push({ label: 'New Room', icon: 'pi pi-plus-circle', command: () => goto('/new-room') });
                navbarItems.value.push({ label: 'My Rooms', icon: 'pi pi-building', command: () => goto('/my-rooms') });
                navbarItems.value.push({ label: 'Reservations', icon: 'pi pi-address-book', command: () => goto(`/reservation/host`) });
                navbarItems.value.push({ label: 'Notifications' + (notificationStore.unreadCount > 0 ? ` (${notificationStore.unreadCount})` : ''),
                 icon: 'pi' + (notificationStore.unreadCount > 0 ? ` pi-exclamation-circle` : ' pi-bell'), command: () => goto('/notifications') });
                navbarItems.value.push({ label: 'Ratings', icon: 'pi pi-star', command: () => goto('/') });
                break;
        }
    }

    console.log(auth.role);
}

const menubarClass = computed(() => {
    switch (auth.role) {
        case UserRole.Admin:
            return 'menubar-admin';
        case UserRole.Guest:
            return 'menubar-guest';
        case UserRole.Host:
            return 'menubar-host';
        default:
            return 'menubar-default';
    }
});

</script>

<template>
    <nav class="navbar">
        <Menubar :model="navbarItems" :class="menubarClass" />
    </nav>
</template>

<style lang="css" scoped>
.menubar-default {
    background-image: linear-gradient(to right, var(--p-surface-0), var(--p-surface-200));
}

.menubar-guest {
    background-image: linear-gradient(to right, var(--p-surface-0), var(--p-blue-100));
}

.menubar-host {
    background-image: linear-gradient(to right, var(--p-surface-0), var(--p-yellow-100));
}

.menubar-admin {
    background-image: linear-gradient(to right, var(--p-surface-0), var(--p-teal-100));
}

:deep(.label) {
    background: none !important;
    color: var(--p-text-color);
    cursor: default !important;
    pointer-events: none;
    opacity: 1 !important;
    font-style: italic;
    margin-bottom: 0.5em;
    padding-bottom: 0.5em;
    border-bottom: 1px solid var(--p-text-color);
}

:deep(.pi-exclamation-circle) {
  color: red !important;
}

</style>