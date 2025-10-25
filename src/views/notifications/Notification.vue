<script setup lang="ts">

import { onMounted, ref, watch } from 'vue';
import { NotificationAPI, NotificationType, type NotificationDTO } from '../../api/notification.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../../stores/notification-store';

const notifications = ref<NotificationDTO[]>([]); 
const notificationError = ref(''); 
const loading = ref(false); 
const router = useRouter();
const notificationStore = useNotificationStore();

const limit = 10;
let offset = 0; 
const hasMore = ref(false);

onMounted(() => {
    loadNotifications();
});

const loadNotifications = (isLoadMore = false) => {
    if (!isLoadMore) {
        loading.value = true;
        notifications.value = [];
        offset = 0;
        hasMore.value = true;
    }

    NotificationAPI.getMyNotifications(limit, offset)
        .then((res: AxiosResponse<NotificationDTO[]>) => {
            const newNotifications = res.data || [];
            
            if (newNotifications.length === 0) {
                hasMore.value = false; 
                return;
            }

            if (newNotifications.length < limit) {
                hasMore.value = false; 
            }

            notifications.value = isLoadMore 
                ? [...notifications.value, ...newNotifications] 
                : newNotifications;

            offset += newNotifications.length; 
        })
        .catch((err: AxiosError) => {
            if (!isLoadMore) notificationError.value = err.message;
        })
        .finally(() => {
            loading.value = false;
        });
};


const loadMore = () => {
    if (hasMore.value) loadNotifications(true);
};

const roomLink = (roomId: number) => {
  return `<a href="#" onclick="event.preventDefault(); window.__goToRoom(${roomId});">${roomId}</a>`;
};

(window as any).__goToRoom = (id: number) => {
  goToRoom(id);
};

const goToRoom = (roomId: number) => {
  router.push(`/room/${roomId}`);
};

const formatMessage = (n: NotificationDTO) => {
  switch (n.type) {
    case NotificationType.ReservationRequested:
      return `User ${n.subject} requested a reservation for room ${roomLink(n.object)}`;
    case NotificationType.ReservationCancelled:
      return `User ${n.subject} cancelled the reservation for room ${roomLink(n.object)}`;
    case NotificationType.HostReviewed:
      return `User ${n.subject} reviewed you with ${n.starsNumber} stars.`;
    case NotificationType.RoomReviewed:
      return `User ${n.subject} reviewed your room ${roomLink(n.object)} with ${n.starsNumber} stars.`;
    case NotificationType.ReservationAccepted:
      return `Your reservation request for room ${roomLink(n.object)} was accepted.`;
    case NotificationType.ReservationDeclined:
      return `Your reservation request for room ${roomLink(n.object)} was declined.`;
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
        notificationStore.decrementUnread();
    }).catch((err: AxiosError) => {
        console.error(err);
    });
  }
};

const notificationClass = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ReservationAccepted:
      return 'border-green';
    case NotificationType.ReservationDeclined:
      return 'border-red';
    case NotificationType.ReservationRequested:
      return 'border-blue';
    case NotificationType.ReservationCancelled:
      return 'border-orange';
    case NotificationType.HostReviewed:
    case NotificationType.RoomReviewed:
      return 'border-purple';
    default:
      return 'border-gray';
  }
};

watch(() => notificationStore.unreadCount, async (newCount, oldCount) => {
  if (newCount > oldCount) { 
    try {
      const res = await NotificationAPI.getMyNotifications(10, 0);
      const newNotifications = res.data.filter(
        n => !notifications.value.find(old => old.id === n.id)
      );
 
      if (newNotifications.length > 0) {
        for (let i = newNotifications.length - 1; i >= 0; i--) {
          notifications.value.unshift(newNotifications[i]);
        }
        offset += newNotifications.length;
      }
    } catch (err) {
      console.error('Failed to fetch new notifications:', err);
    }
  }
});


</script>

<template>

    <ProgressBar v-if="loading"></ProgressBar>

    <h3>Your Notifications</h3>

    <div v-if="notifications.length === 0">
        You currently have no notifications.
    </div>

    <div
        v-for="n in notifications"
        :key="n.id"
        class="notification-item"
        :class="[notificationClass(n.type), { unread: !n.isRead }]"
        @click="handleClick(n)"
    >
        <div class="notification-content">
            <div class="message" v-html="formatMessage(n)"></div>

            <div class="meta">
                <span class="time">{{ formatTime(n.createdAt) }}</span>
                <span class="status-tag" :class="n.isRead ? 'read' : 'unread'">
                {{ n.isRead ? 'Read' : 'Unread' }}
                </span>
            </div>
        </div>
    </div>

    <div v-if="hasMore && !loading" class="load-more-wrapper">
      <Button class="p-button-outlined" @click="loadMore">
        Load More
      </Button>

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
  border-left: 6px solid;
  border-radius: 6px;
  margin-bottom: 0.8rem;
  background-color: #f9fafb; 
  transition: background 0.18s, transform 0.06s;
  display: flex;
  align-items: flex-start;
}

.notification-item.unread:hover {
  background-color: #ffe6ea; 
  transform: translateY(-1px);
}

.notification-item.unread {
  background-color: #fff1f2;
  cursor: pointer;
}

/* Left-border colors per type */
.notification-item.border-green { border-left-color: #10b981; } /* emerald */
.notification-item.border-red { border-left-color: #ef4444; } /* red-500 */
.notification-item.border-blue { border-left-color: #3b82f6; } /* blue-500 */
.notification-item.border-orange { border-left-color: #f97316; } /* orange-500 */
.notification-item.border-purple { border-left-color: #be0bf5; } /* purple-500 */
.notification-item.border-gray { border-left-color: #9ca3af; } /* gray */

.notification-content { flex: 1; }
.message { font-size: 1rem; margin-bottom: 0.4rem; color: #111827; }

.meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #6b7280; }
.time { margin-right: 0.6rem; }

.status-tag { padding: 0.2rem 0.6rem; border-radius: 10px; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
.status-tag.read { background-color: #e5e7eb; color: #374151; }
.status-tag.unread { background-color: #ef4444; color: white; }

.load-more-wrapper {
  text-align: center;
  margin-top: 1rem;
}

</style>
