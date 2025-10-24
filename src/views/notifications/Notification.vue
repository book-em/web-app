<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { NotificationAPI, NotificationType, type NotificationDTO } from '../../api/notification.api';
import type { AxiosError, AxiosResponse } from 'axios';

const auth = useAuthStore();
const notifications = ref<NotificationDTO[]>([]); 
const notificationError = ref(''); 
const loading = ref(false); 

onMounted(() => {
    loadNotifications();
});

const loadNotifications = () => {
    loading.value = true;
    notificationError.value = '';

    NotificationAPI.getMyNotifications().then((res: AxiosResponse<NotificationDTO[]>) => {
        notifications.value = res.data;
    }).catch((err: AxiosError) => {
        notificationError.value = err.message;
    }).finally(() => {
        loading.value = false;
    });
}

const formatMessage = (n: NotificationDTO) => {
  switch (n.type) {
    case NotificationType.ReservationRequested:
      return `User ${n.subject} requested a reservation for room ${n.object}`;
    case NotificationType.ReservationCancelled:
      return `User ${n.subject} cancelled the reservation for room ${n.object}`;
    case NotificationType.HostReviewed:
      return `User ${n.subject} left a review for you`;
    case NotificationType.RoomReviewed:
      return `User ${n.subject} reviewed your room ${n.object}`;
    case NotificationType.ReservationAccepted:
      return `Your reservation request for room ${n.object} was accepted by host ${n.subject}`;
    case NotificationType.ReservationDeclined:
      return `Your reservation request for room ${n.object} was declined by host ${n.subject}`;
    default:
      return `Notification type: ${n.type}`;
  }
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
};

const handleClick = async (n: NotificationDTO) => {
  if (!n.isRead) {
    NotificationAPI.markNotificationAsRead(n.id).then(() => {
        n.isRead = true;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
  }
};


</script>

<template>

    <ProgressBar v-if="loading"></ProgressBar>

    <h3>My Notifications</h3>

    <div v-if="notifications.length === 0">
        You currently have no notifications.
    </div>

    <div
        v-for="n in notifications"
        :key="n.id"
        class="notification-item"
        :class="{ unread: !n.isRead }"
        @click="handleClick(n)"
    >
        <div class="message">{{ formatMessage(n) }}</div>
        <div class="time">{{ formatTime(n.createdAt) }}</div>
    </div>

    <Message
        v-show="notificationError.length > 0"
        severity="error"
        size="small"
        variant="simple"
    >
        {{ notificationError }}
    </Message>
    
</template>

<style scoped>
.notification-item {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background-color: #f6f6f6;
}

.notification-item.unread {
  background-color: #e8f0ff;
  font-weight: 600;
}

.message {
  margin-bottom: 0.3rem;
}

.time {
  font-size: 0.8rem;
  color: gray;
}
</style>