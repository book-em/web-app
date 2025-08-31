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

const error = ref('');
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
    error.value = '';

    ReservationAPI.getRequestsByGuest().then((res: AxiosResponse<ReservationRequestDTO[]>) => {
        reservationRequests.value = res.data;
    }).catch((err: AxiosError) => {
        error.value = err.message;
    }).finally(() => {
        loading.value = false;
    });
}

const deleteRequest = (reservationRequestId: number) => {
    ReservationAPI.deleteRequest(reservationRequestId).then((res) => {
        loadReservations();
    }).catch((err: AxiosError) => {
        error.value = err.message;
    });
}

</script>

<template>
    <Message v-show="error.length > 0" severity="error" size="small" variant="simple">
        {{ error }}
    </Message>

    <ProgressBar v-if="loading"></ProgressBar>

    <h3>Your reservations</h3>
    <div>

    </div>

    <h3>Your requests</h3>
    <div>
        <div v-for="req in reservationRequests">
            <ul>
                <li>id = {{ req.id }}</li>
                <li>room = {{ req.roomId }}</li>
                <li>from = {{ new Date(req.dateFrom).toDateString() }}</li>
                <li>to = {{ new Date(req.dateTo).toDateString() }}</li>
                <li>guests = {{ req.guestCount }}</li>
                <li>cost = {{ req.cost }}</li>

                <Button v-on:click="deleteRequest(req.id)">Delete</Button>
            </ul>
        </div>
    </div>
</template>

<style lang="css" scoped></style>