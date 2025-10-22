<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RoomAPI, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import RoomAvailabilityEditor from '../../components/room/RoomAvailabilityEditor.vue';
import RoomPriceEditor from '../../components/room/RoomPriceEditor.vue';
import { useAuthStore } from '../../stores/auth-store';
import { UserRole } from '../../api/user.api';
import { RoomImageURL } from '../../api/util';
import Tag from 'primevue/tag';
import RoomActiveRequestEditor from '../../components/room/RoomActiveRequestEditor.vue';

const route = useRoute();
const router = useRouter();
const room = ref<RoomDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const auth = useAuthStore();
const loading = ref(false);

onMounted(() => { auth.checkLocalStorage(); });
onMounted(() => loadRoom());

const loadRoom = () => {
    const roomId: number = parseInt(route.params.id as string);

    loading.value = true;

    RoomAPI.findById(roomId).then((res: AxiosResponse<RoomDTO>) => {
        room.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
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

const gotoReservation = () => {
    const roomId: number = parseInt(route.params.id as string);

    router.push(`/reservation/new/${roomId}`);
}

</script>

<template>
    <div v-if="loading">
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>
    <div v-if="room">
        <h2>{{ room.name }}</h2>
        <p>{{ room.description }}</p>

        <Tabs value="0">
            <TabList>
                <Tab value="0"><i class="pi pi-info-circle"> Details</i></Tab>
                <template v-if="auth.role == UserRole.Host">
                    <Tab value="1"><i class="pi pi-calendar"> Availability</i></Tab>
                    <Tab value="2"><i class="pi pi-dollar"> Price</i></Tab>
                    <Tab v-if="!room.autoApprove" value="3"><i class="pi pi-question-circle room-icon"> Reservation requests</i></Tab>
                </template>
            </TabList>

            <TabPanels>
                <template v-if="auth.role == UserRole.Guest">
                    <Button v-on:click="gotoReservation">Book a reservation</Button>
                </template>
                <TabPanel value="0">
                    <div class="room-info">
                        <div class="room-info-section">
                            <i class="pi pi-map-marker room-icon"></i>
                            <span>{{ room.address }}</span>
                        </div>
                        <div class="room-info-section">
                            <i class="pi pi-users room-icon"></i>
                            <span>{{ room.minGuests }} - {{ room.maxGuests }} guests</span>
                        </div>
                        <div class="room-info-section">
                            <i class="pi pi-list room-icon"></i>
                            <div class="room-commodities">
                                <Tag v-for="commodity in room.commodities" :key="commodity" severity="info" :value="commodity"/>
                            </div>
                        </div>
                        <div class="room-info-section auto-approve-status">
                            <i class="pi pi-check-circle room-icon" v-if="room.autoApprove"></i>
                            <i class="pi pi-clock room-icon" v-else></i>
                            <Tag v-if="room.autoApprove" value="Instant booking" />
                            <Tag v-else class="warning-tag" value="Host approval needed" />
                        </div>
                    </div>

                    <Galleria :value="room.photos" :responsiveOptions="galleryResponsiveOptions" :numVisible="5"
                        containerStyle="max-width: 80%; margin: auto;" class="preview-item">
                        <template #item="slotProps">
                            <Image :src="`${RoomImageURL}/img/${slotProps.item}`" preview
                                style="width: 300px; height: 300px; object-fit: cover;" />
                        </template>
                        <template #thumbnail="slotProps">
                            <img :src="`${RoomImageURL}/img/${slotProps.item}`"
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

                <TabPanel value="3">
                    <RoomActiveRequestEditor :roomId="room.id" />
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

.room-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.2rem 0;
    padding: 1rem;
    background-color: var(--surface-card);
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.room-info-section {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}

.room-icon {
    color: var(--primary-color);
    font-size: 1.1rem;
}

.room-commodities {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.warning-tag {
  background-color: color-mix(in srgb, var(--warning-color) 60%, transparent);
  color: var(--warning-color-text);
}
</style>