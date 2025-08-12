<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { RoomAPI, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const room = ref<RoomDTO | null>(null);

const warning = ref('');
const error = ref('');
const formLoading = ref(false);

const loadRoom = () => {
    const roomId: number = parseInt(route.params.id as string);

    RoomAPI.findById(roomId).then((res: AxiosResponse<RoomDTO>) => {
        room.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

onMounted(() => loadRoom());

</script>

<template>

    <div v-if="room != null">

        {{ room.name }}<br />
        {{ room.description }}<br />
        {{ room.address }}<br />
        {{ room.minGuests }} - {{ room.maxGuests }} people<br />
        <ul>
            <li v-for="commodity in room.commodities">{{ commodity }}</li> <br />
        </ul>

        <div class="preview-grid">
            <div v-for="img in room.photos" class="preview-item">
                <Image :src="`http://localhost:8505/img/${img}`" preview></Image>
            </div>
        </div>
    </div>

</template>

<style lang="css" scoped>
.preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 10px;
}

.preview-item {
    position: relative;
    width: 220px;
    height: 220px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
}

.preview-item :deep(.p-image img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>