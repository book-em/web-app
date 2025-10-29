<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { ReservationAPI, type ReservationRequestDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from "axios";

const props = defineProps<{ roomId: number }>();
const requests = ref<ReservationRequestDTO[]>([]); 
const requestsError = ref(''); 
const loading = ref(false); 

onMounted(() => {
    loadRequests();
});
watch(() => props.roomId, () => loadRequests());

const loadRequests = () => {
    loading.value = true;
    requestsError.value = '';

    ReservationAPI.getRequestsByRoom(props.roomId).then((res: AxiosResponse<ReservationRequestDTO[]>) => {
        requests.value = res.data;
    }).catch((err: AxiosError) => {
        requestsError.value = err.message;
    }).finally(() => {
        loading.value = false;
    });
};

const acceptRequest = (reservationRequestId: number) => {
    loading.value = true;
    requestsError.value = '';

    ReservationAPI.approveRequest(reservationRequestId)
        .then(() => {
            loadRequests();
        })
        .catch((err: AxiosError) => {
            if (err.response?.status === 404) {
                requestsError.value = "Reservation request not found or deleted.";
            } else {
                requestsError.value = (err.response?.data as { error: string })?.error ?? "An unknown error occurred.";        
            }
        })
        .finally(() => {
            loading.value = false;
        });
};


const rejectRequest = (reservationRequestId: number) => {
    loading.value = true;
    requestsError.value = '';

    ReservationAPI.rejectRequest(reservationRequestId)
        .then(() => {
            loadRequests();
        })
        .catch((err: AxiosError) => {
            if (err.response?.status === 404) {
                requestsError.value = "Reservation request not found or deleted.";
            } else {
                requestsError.value = (err.response?.data as { error: string })?.error ?? "An unknown error occurred.";        
            }
        })
        .finally(() => {
            loading.value = false;
        });
};
</script>

<template>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>
    <div v-if="requests.length === 0">
        You have no active reservation requests for this room.
    </div>
    <DataTable v-else :value="requests" tableStyle="width: 100%; margin: auto; table-layout: fixed">
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
        <Column field="guestCancelCount">
            <template #header>
                <i class="pi pi-ban"></i> Guest cancellations
            </template>
        </Column>
        <Column style="width: 6rem">
            <template #body="slotProps">
                <Button v-on:click="acceptRequest(slotProps.data.id)" severity="success">Accept</Button>
            </template>
        </Column>
        <Column style="width: 6rem">
            <template #body="slotProps">
                <Button v-on:click="rejectRequest(slotProps.data.id)" severity="danger">Reject</Button>
            </template>
        </Column>
    </DataTable>

    <Message v-show="requestsError.length > 0" severity="error" size="small" variant="simple">
        {{ requestsError }}
    </Message>
</template>

<style scoped></style>