<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, ReservationRequestStatus, type CreateReservationRequestDTO, type ReservationRequestDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from 'axios';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const roomId = ref(-1);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formGuestCount = ref(1);

const error = ref('');

onMounted(() => { auth.checkLocalStorage(); });
onMounted(() => { roomId.value = parseInt(route.params.id as string); });
onMounted(() => { formDateTo.value.setDate(formDateFrom.value.getDate() + 7); });

const onSubmitReservationRequest = () => {
    const dto: CreateReservationRequestDTO = {
        roomId: roomId.value,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        guestCount: formGuestCount.value
    };

    ReservationAPI.createRequest(dto).then((res: AxiosResponse<ReservationRequestDTO>) => {
        const req = res.data;
        console.log(req);

        error.value = '';
    }).catch((err: AxiosError) => {
        error.value = err.message;
    });
}

const onFromDateChanged = () => {
    const dateFrom = new Date(formDateFrom.value);
    const dateTo = new Date(formDateTo.value);
    if (dateFrom >= dateTo) {
        let dateToNew = dateTo;
        dateToNew.setDate(dateFrom.getDate() + 1);
        formDateTo.value = dateToNew;
    }
}

</script>

<template>
    <h3>Create new reservation for room <RouterLink :to="`/room/${roomId}`">room {{ roomId }}</RouterLink>
    </h3>

    <form @submit.prevent="onSubmitReservationRequest" class="flex flex-col gap-4">
        <FloatLabel class="mt-small">
            <label for="fromDate">From</label>
            <DatePicker id="fromDate" v-model="formDateFrom" v-on:value-change="onFromDateChanged" date-format="dd MM"
                showIcon class="w-full" />
        </FloatLabel>

        <FloatLabel class="mt-small">
            <label for="toDate">To</label>
            <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)" date-format="dd MM" showIcon
                class="w-full" />
        </FloatLabel>

        <FloatLabel class="mt-small">
            <InputNumber id="guestCount" v-model="formGuestCount" class="w-full" :min="1" :max="999" fluid />
            <label for="basePrice">Number of guests</label>
        </FloatLabel>

        <Button type="submit">Submit a request</Button>
        <br />
        <small>The host will be notified about your request. You may delete it if you change your mind.</small>

        <Message v-show="error.length > 0" severity="error" size="small" variant="simple">
            {{ error }}
        </Message>

    </form>
</template>

<style lang="css" scoped>
.mt-small {
    margin-top: 2em;
}

.mt-big {
    margin-top: 5em;
}

.mr-small {
    margin-right: 1em;
}
</style>