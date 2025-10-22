<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, type ReservationDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from 'axios';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const reservations = ref<ReservationDTO[]>([]); 
const reservationsError = ref(''); 
const loading = ref(false); 
const userId = ref(-1);

onMounted(() => {
    auth.checkLocalStorage();
    userId.value = auth.id

    if (auth.id !== userId.value) {
        router.push('/');
    }

    loadReservations();
});

const loadReservations = () => {
    loading.value = true;
    reservationsError.value = '';

    ReservationAPI.getActiveReservationsByHost().then((res: AxiosResponse<ReservationDTO[]>) => {
        reservations.value = res.data;
    }).catch((err: AxiosError) => {
        reservationsError.value = err.message;
    }).finally(() => {
        loading.value = false;
    });
}

</script>

<template>
    <ProgressBar v-if="loading"></ProgressBar>

    <h3>Active reservations</h3>
    <div v-if="reservations.length === 0">
        You have no active reservations.
    </div>
    <DataTable v-else :value="reservations" tableStyle="width: 100%; margin: auto">
        <Column field="roomId" header="Room ID">
            <template #body="slotProps">
                <RouterLink :to="`/room/${slotProps.data.roomId}`">#{{ slotProps.data.roomId }}</RouterLink>
            </template>
        </Column>
        <Column field="dateFrom" style="width: 18rem">
            <template #header>
                Start day <i class="pi pi-forward"></i>
            </template>
            <template #body="slotProps">
                {{ new Date(slotProps.data.dateFrom).toDateString() }}
            </template>
        </Column>
        <Column field="dateTo" style="width: 18rem">
            <template #header>
                <i class="pi pi-backward"></i> End day
            </template>
            <template #body="slotProps">
                {{ new Date(slotProps.data.dateTo).toDateString() }}
            </template>
        </Column>
        <Column field="guestCount">
            <template #header>
                <i class="pi pi-users"></i> Guests
            </template>
        </Column>
        <Column field="cost">
            <template #header>
                <i class="pi pi-money-bill"></i> Cost
            </template>
            <template #body="slotProps">
                ${{ slotProps.data.cost }}
            </template>
        </Column>
    </DataTable>

    <Message v-show="reservationsError.length > 0" severity="error" size="small" variant="simple">
        {{ reservationsError }}
    </Message>
</template>

<style lang="css" scoped></style>