<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, ReservationRequestStatus, type CreateReservationRequestDTO, type ReservationRequestDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { useToast } from 'primevue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const reservationRequests = ref<ReservationRequestDTO[]>([]);
const userId = ref(-1);

const reservationRequestError = ref('');
const loading = ref(false);

onMounted(() => {
    auth.checkLocalStorage();

    userId.value = parseInt(route.params.id as string);

    if (auth.id != userId.value) {
        router.push(`/reservation/user/${userId.value}`);
    }

    loadReservations();
});

const loadReservations = () => {
    loading.value = true;
    reservationRequestError.value = '';

    ReservationAPI.getRequestsByGuest().then((res: AxiosResponse<ReservationRequestDTO[]>) => {
        reservationRequests.value = res.data;
    }).catch((err: AxiosError) => {
        reservationRequestError.value = err.message;
    }).finally(() => {
        loading.value = false;
    });
}

const deleteRequest = (reservationRequestId: number) => {
    ReservationAPI.deleteRequest(reservationRequestId).then((res) => {
        loadReservations();
    }).catch((err: AxiosError) => {
        reservationRequestError.value = err.message;
    });
}

</script>

<template>
    <ProgressBar v-if="loading"></ProgressBar>

    <h3>Your reservations</h3>
    <div v-if="true">
        You have no reservations.
    </div>
    <div>

    </div>

    <h3>Your requests</h3>
    <div>
        <div v-if="reservationRequests.length == 0">
            You have no active reservation requests.
        </div>
        <DataTable v-else :value="reservationRequests" tableStyle="width: 80%; margin: auto">
            <Column field="roomId" header="Room ID">
                <template #body="slotProps">
                    <RouterLink :to="`/room/${slotProps.data.roomId}`">#{{ slotProps.data.roomId }}</RouterLink>
                </template>
            </Column>
            <Column field="dateFrom">
                <template #header>
                    Start day <i class="pi pi-forward"></i>
                </template>
                <template #body="slotProps">
                    {{ new Date(slotProps.data.dateFrom).toDateString() }}
                </template>
            </Column>
            <Column field="dateTo">
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
            <Column header="Delete">
                <template #body="slotProps">
                    <Button v-on:click="deleteRequest(slotProps.data.id)" severity="danger">Delete</Button>
                </template>
            </Column>
        </DataTable>

        <Message v-show="reservationRequestError.length > 0" severity="error" size="small" variant="simple">
            {{ reservationRequestError }}
        </Message>

    </div>
</template>

<style lang="css" scoped></style>