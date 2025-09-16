<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { RoomAPI, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { RoomImageURL } from '../../api/util';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const rooms = ref<RoomDTO[]>([]);

const warning = ref('');
const error = ref('');
const formLoading = ref(false);

const findByHostId = () => {
    RoomAPI.findByHostId(auth.id).then((res: AxiosResponse<RoomDTO[]>) => {
        rooms.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const createNewRoom = () => {
    router.push("/new-room");
}

onMounted(() => findByHostId());

</script>

<template>
    <div class="container">

        <Button @click="createNewRoom">New room</Button>

        <div class="list">
            <div v-if="rooms.length > 0">
                <div v-for="room in rooms" class="flex-container">
                    <div class="flex-items">
                        <RouterLink :to="`/room/${room.id}`">{{ room.name }}</RouterLink>
                    </div>

                    <div class="flex-items">
                        <div class="preview-grid">
                            <div v-for="img in room.photos.slice(0, 4)" class="preview-item">
                                <Image :src="`${RoomImageURL}/img/${img}`"></Image>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                You don't have any rooms.
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

.container {
    margin: 2em;
}

.list {
    margin-top: 1em;
}

.flex-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: normal;
    align-items: normal;
    align-content: normal;

    background-color: var(--p-color-text);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
    margin-top: 1em;
}

.flex-items:nth-child(1) {
    display: block;
    flex-grow: 0;
    flex-shrink: 2;
    flex-basis: auto;
    align-self: auto;
    order: 0;
    margin: 20px;
    min-width: 20%;
}

.flex-items:nth-child(2) {
    display: block;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
    order: 0;
    margin: 20px;

}
</style>