<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { type CreateRoomAvailabilityItemDTO, type CreateRoomAvailabilityListDTO, RoomAPI, type RoomAvailabilityItemDTO, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import RoomAvailabilityEditor from '../../components/room/RoomAvailabilityEditor.vue';

const route = useRoute();
const room = ref<RoomDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const roomAvailabilityBeforeEdit = ref<RoomAvailabilityListDTO | null>(null);
const isEditingRoomAvailability = ref(false);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formAvailable = ref(true);

const errorAvailabilityNew = ref('');
const errorAvailability = ref('');

onMounted(() => loadRoom());

const loadRoom = () => {
    const roomId: number = parseInt(route.params.id as string);

    RoomAPI.findById(roomId).then((res: AxiosResponse<RoomDTO>) => {
        room.value = res.data;
        loadRoomAvailability();
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const loadRoomAvailability = () => {
    const roomId: number = parseInt(route.params.id as string);

    RoomAPI.findCurrentAvailabilityListOfRoom(roomId).then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
        console.log(res.data);
        roomAvailability.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}







const galleryResponsiveOptions = ref([
    {
        breakpoint: '1300px',
        numVisible: 4
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);

</script>

<template>
    <div v-if="room">
        <h2>{{ room.name }}</h2>
        <p>{{ room.description }}</p>

        <Tabs value="0">
            <TabList>
                <Tab value="0">Details</Tab>
                <Tab value="1">Availability</Tab>
            </TabList>

            <TabPanels>
                <TabPanel value="0">
                    <p>{{ room.address }}</p>
                    <p>{{ room.minGuests }} - {{ room.maxGuests }} guests</p>
                    <ul>
                        <li v-for="commodity in room.commodities" :key="commodity">{{ commodity }}</li>
                    </ul>

                    <Galleria :value="room.photos" :responsiveOptions="galleryResponsiveOptions" :numVisible="5"
                        containerStyle="max-width: 80%; margin: auto;" class="preview-item">
                        <template #item="slotProps">
                            <Image :src="`http://localhost:8505/img/${slotProps.item}`" preview
                                style="width: 500px; height: 500px; object-fit: cover;" />
                        </template>
                        <template #thumbnail="slotProps">
                            <img :src="`http://localhost:8505/img/${slotProps.item}`"
                                style="width: 100px; height: 100px; object-fit: cover;" />
                        </template>
                    </Galleria>
                </TabPanel>

                <TabPanel value="1">
                    <RoomAvailabilityEditor :roomId="room.id" />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<style lang="css" scoped>
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

.inline-fields {
    display: flex;
    gap: 0em;
}

.inline-fields>* {
    flex: 1;
}
</style>