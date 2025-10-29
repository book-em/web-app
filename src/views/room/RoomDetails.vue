<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RoomAPI, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import RoomAvailabilityEditor from '../../components/room/RoomAvailabilityEditor.vue';
import RoomPriceEditor from '../../components/room/RoomPriceEditor.vue';
import HostRatings from '../../components/EntityRatings.vue';
import { useAuthStore } from '../../stores/auth-store';
import { UserAPI, UserRole, type UserDTO } from '../../api/user.api';
import { RoomImageURL } from '../../api/util';
import Tag from 'primevue/tag';
import RoomActiveRequestEditor from '../../components/room/RoomActiveRequestEditor.vue';
import EntityRatings from '../../components/EntityRatings.vue';

const route = useRoute();
const router = useRouter();
const room = ref<RoomDTO | null>(null);
const host = ref<UserDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const auth = useAuthStore();
const loading = ref(false);
const error = ref('');

onMounted(() => { auth.checkLocalStorage(); });
onMounted(() => loadRoom());

const loadRoom = async () => {
  const roomId = Number(route.params.id);
  loading.value = true;
  try {
    const roomRes = await RoomAPI.findById(roomId);
    room.value = roomRes.data;

    const hostRes = await UserAPI.findById(room.value.hostID);
    host.value = hostRes.data;
  } catch (err) {
    if (err.response?.status === 404) {
        error.value = "Room not found or deleted.";
    } else {
        error.value = (err.response?.data as { error: string })?.error ?? "An unknown error occurred.";        
    }  
    console.log(err as AxiosError);
  } finally {
    loading.value = false;
  }
};

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

    <Message v-show="error.length > 0" style="margin: 7px;" severity="error" size="medium" variant="simple">{{ error }}</Message>
    
    <div v-if="room">
        <h2>{{ room.name }}</h2>
        <p>{{ room.description }}</p>

<Tabs value="0">
  <TabList>
    <Tab value="0"><i class="pi pi-info-circle"> Details</i></Tab>
    <Tab value="1"><i class="pi pi-star"> Reviews</i></Tab>

    <template v-if="auth.role == UserRole.Host">
      <Tab value="2"><i class="pi pi-calendar"> Availability</i></Tab>
      <Tab value="3"><i class="pi pi-dollar"> Price</i></Tab>
      <Tab v-if="!room.autoApprove" value="4"><i class="pi pi-question-circle room-icon"> Reservation requests</i></Tab>
    </template>
  </TabList>

  <TabPanels>
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
            <Tag v-for="commodity in room.commodities" :key="commodity" severity="info" :value="commodity" />
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

      <template v-if="auth.role == UserRole.Guest">
        <Button @click="gotoReservation">Book a reservation</Button>
      </template>
    </TabPanel>

    <TabPanel value="1">
      <EntityRatings
        v-if="room !== null"
        target-type="room"
        :target-id="room.id"
        title="Room Rating"
        :primary-name="room.name"
      />
      <EntityRatings
        v-if="host !== null"
        target-type="host"
        :target-id="room.hostID"
        title="Host Rating"
        :primary-name="host.name"
        :secondary-name="host.surname"
      />

      <Message v-else severity="info" size="small" variant="simple">
        Reviews aren't available at the moment.
      </Message>

    </TabPanel>

    <TabPanel value="2">
      <RoomAvailabilityEditor :roomId="room.id" />
    </TabPanel>

    <TabPanel value="3">
      <RoomPriceEditor :roomId="room.id" />
    </TabPanel>

    <TabPanel value="4">
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