<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, ReservationRequestStatus, type CreateReservationRequestDTO, type ReservationRequestDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { type RoomAvailabilityListDTO, RoomAPI } from '../../api/room.api';
import HeatmapCalendar from '../../components/HeatmapCalendar.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const roomId = ref(-1);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formGuestCount = ref(1);

const loading = ref(false);
const error = ref('');

onMounted(() => { auth.checkLocalStorage(); });
onMounted(() => {
    roomId.value = parseInt(route.params.id as string);
    loadRoomAvailability();
});
onMounted(() => { formDateTo.value.setDate(formDateFrom.value.getDate() + 7); });

const loadRoomAvailability = () => {
    loading.value = true;

    RoomAPI.findCurrentAvailabilityListOfRoom(roomId.value)
        .then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
            roomAvailability.value = res.data;
            console.log(res.data);
        })
        .catch((err: AxiosError) => {
            console.error(err);
        })
        .finally(() => {
            loading.value = false;
            ensureAvailabilityExists();
        });
};

const ensureAvailabilityExists = () => {
    if (roomAvailability.value === null) {
        // TODO: Notify the user that the room is never available.
        roomAvailability.value = {
            id: 0,
            effectiveFrom: new Date().toISOString(),
            items: [],
            roomId: roomId.value,
        };
    }
}

const onSubmitReservationRequest = () => {
    const dto: CreateReservationRequestDTO = {
        roomId: roomId.value,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        guestCount: formGuestCount.value
    };

    loading.value = true;

    ReservationAPI.createRequest(dto).then((res: AxiosResponse<ReservationRequestDTO>) => {
        const req = res.data;
        error.value = '';
        router.push(`/reservation/user/${auth.id}`);
    }).catch((err: AxiosError) => {
        console.log(err);
        if (err.status == 409) {
            error.value = "You already have a reservation booked for this room";
        } else if (err.status == 400) {
            error.value = "Invalid data, please make sure the room can be booked at this time";
        } else {
            error.value = err.message;
        }
    }).finally(() => {
        loading.value = false;
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

    <div v-if="loading">
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>
    <div>

        <div v-if="roomAvailability !== null">
            <HeatmapCalendar :availabilityItems="roomAvailability.items" :year="new Date().getFullYear()" />
        </div>

        <form @submit.prevent="onSubmitReservationRequest" class="flex flex-col gap-4">
            <FloatLabel class="mt-small">
                <label for="fromDate">From</label>
                <DatePicker id="fromDate" v-model="formDateFrom" v-on:value-change="onFromDateChanged"
                    date-format="dd MM" showIcon class="w-full" />
            </FloatLabel>

            <FloatLabel class="mt-small">
                <label for="toDate">To</label>
                <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)" date-format="dd MM"
                    showIcon class="w-full" />
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
    </div>
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