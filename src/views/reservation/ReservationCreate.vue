<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationRequestStatus, type CreateReservationRequestDTO, type ReservationRequestDTO } from '../../api/reservation.api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const roomId = ref(-1);

const formDTO = ref<CreateReservationRequestDTO>({
    roomId: 0, // Calculated from roomId state
    dateFrom: '',
    dateTo: '',
    guestCount: 0
});

onMounted(() => { auth.checkLocalStorage(); });
onMounted(() => { roomId.value = parseInt(route.params.id as string); });

</script>

<template>
    <h3>Create new reservation for room <RouterLink :to="`/room/${roomId}`">room {{ roomId }}</RouterLink>
    </h3>
</template>

<style lang="css" scoped></style>