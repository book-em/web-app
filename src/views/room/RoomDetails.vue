<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { RoomAPI, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import RoomAvailabilityEditor from '../../components/room/RoomAvailabilityEditor.vue';
import RoomPriceEditor from '../../components/room/RoomPriceEditor.vue';
import { useAuthStore } from '../../stores/auth-store';
import { UserRole } from '../../api/user.api';

const route = useRoute();
const room = ref<RoomDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const auth = useAuthStore();

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
                <template v-if="auth.role == UserRole.Host">
                    <Tab value="1">Availability</Tab>
                    <Tab value="2">Price</Tab>
                </template>
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

                <TabPanel value="2">
                    <RoomPriceEditor :roomId="room.id" />
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