<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, ReservationRequestStatus, type CreateReservationRequestDTO, type ReservationRequestDTO } from '../../api/reservation.api';
import type { AxiosError, AxiosResponse } from 'axios';
import { type RoomAvailabilityListDTO, type RoomReservationQueryDTO, RoomAPI, type RoomReservationQueryResponseDTO } from '../../api/room.api';
import HeatmapCalendar from '../../components/HeatmapCalendar.vue';
import { RefSymbol } from '@vue/reactivity';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const roomId = ref(-1);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const reservationQuery = ref<RoomReservationQueryResponseDTO | null>(null);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formGuestCount = ref(1);

const loading = ref(false);
const error = ref('');

onMounted(() => {
    auth.checkLocalStorage();
    roomId.value = parseInt(route.params.id as string);
    loadRoomAvailability();

    formDateTo.value.setDate(formDateFrom.value.getDate() + 1);
    onFromDateChanged();

    queryReservationInfo();
});
onMounted(() => { formDateTo.value.setDate(formDateFrom.value.getDate() + 7); });

const queryReservationInfo = () => {
    const dto: RoomReservationQueryDTO = {
        roomId: roomId.value,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        guestCount: formGuestCount.value,
    };

    RoomAPI.queryForReservation(dto).then((res: AxiosResponse<RoomReservationQueryResponseDTO>) => {
        reservationQuery.value = res.data;
    }).catch((err: AxiosError) => {
        error.value = "Could not fetch room reservation info. Try again later";
        console.error(err);
    });
}

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
    let dateFrom = strippedDate(new Date(formDateFrom.value));
    let dateTo = strippedDate(new Date(formDateTo.value));

    if (dateFrom >= dateTo) {
        dateTo.setDate(dateFrom.getDate() + 1);
        dateTo = strippedDate(dateTo);
    }

    formDateFrom.value = dateFrom;
    formDateTo.value = dateTo;

    queryReservationInfo();
}

const strippedDate = (date: Date): Date => {
    let dateNew = new Date(date);
    dateNew.setHours(0, 0, 0, 0);
    return dateNew;
}

const onGuestCountChange = (newValue: number) => {
    formGuestCount.value = newValue;
    queryReservationInfo();
}

</script>

<template>
    <h3>Create new reservation for <RouterLink :to="`/room/${roomId}`">room {{ roomId }}</RouterLink>
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
                <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)"
                    v-on:value-change="queryReservationInfo" date-format="dd MM" showIcon class="w-full" />
            </FloatLabel>

            <FloatLabel class="mt-small">
                <InputNumber id="guestCount" v-model="formGuestCount" class="w-full" :min="1" :max="999" fluid
                    @input="(e) => { onGuestCountChange(e.value as number); }" />
                <label for="basePrice">Number of guests</label>
            </FloatLabel>
            <br />

            <div v-if="reservationQuery !== null">
                <div v-if="reservationQuery.available">
                    Total cost: ${{ reservationQuery.totalCost }}

                </div>
                <div v-else>
                    You cannot book a reservation at this time.
                </div>
            </div>
            <br />

            <Button type="submit" :disabled="!reservationQuery?.available">Submit a request</Button>
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