<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { type CreateRoomAvailabilityItemDTO, type CreateRoomAvailabilityListDTO, RoomAPI, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const room = ref<RoomDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formAvailable = ref(true);


const warning = ref('');
const error = ref('');
const formLoading = ref(false);

const loadRoom = () => {
    const roomId: number = parseInt(route.params.id as string);

    RoomAPI.findById(roomId).then((res: AxiosResponse<RoomDTO>) => {
        room.value = res.data;
        loadRoomAvailability();
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const loadRoomAvailability = () => {
    const roomId: number = parseInt(route.params.id as string);

    RoomAPI.findCurrentAvailabilityListOfRoom(roomId).then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
        roomAvailability.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

onMounted(() => loadRoom());

const onAddAvailItem = () => {
    const roomId: number = parseInt(route.params.id as string);

    const itemDTO: CreateRoomAvailabilityItemDTO = {
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        available: formAvailable.value,
    };

    let listDTO: CreateRoomAvailabilityListDTO = {
        roomId,
        items: [itemDTO],
    };

    if (roomAvailability.value !== null) {
        listDTO.items = [itemDTO, ...roomAvailability.value.items];
    }

    // Validate...?

    RoomAPI.updateAvailability(listDTO).then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
        roomAvailability.value = res.data;
    }).catch((err: AxiosError) => {
        console.error(err);
    });

}

</script>

<template>
    <div v-if="room != null">
        {{ room.name }}<br />
        {{ room.description }}<br />
        {{ room.address }}<br />
        {{ room.minGuests }} - {{ room.maxGuests }} people<br />
        <ul>
            <li v-for="commodity in room.commodities">{{ commodity }}</li> <br />
        </ul>

        <div class="preview-grid">
            <div v-for="img in room.photos" class="preview-item">
                <Image :src="`http://localhost:8505/img/${img}`" preview></Image>
            </div>
        </div>

        <div>
            <h2>Room availability</h2>

            <div v-if="roomAvailability == null">
                Nothing
            </div>
            <div v-else>
                <ul>
                    <li v-for="item in roomAvailability.items">
                        From {{ new Date(item.dateFrom).toLocaleDateString() }}
                        to {{ new Date(item.dateTo).toLocaleDateString() }}
                        <span v-if="!item.available"> disabled </span>
                    </li>
                </ul>
            </div>

            <form class="center">
                <div class="inline-fields">

                    <FloatLabel variant="on">
                        <span> From </span>
                        <DatePicker v-model="formDateFrom" date-format="dd MM">
                        </DatePicker>
                    </FloatLabel>

                    <FloatLabel variant="on">
                        <span> to </span>
                        <DatePicker v-model="formDateTo" date-format="dd MM">
                        </DatePicker>
                    </FloatLabel>

                    <div class="flex items-center gap-2">
                        <label>reservations are allowed: </label>
                        <Checkbox v-model="formAvailable" binary />
                    </div>

                    <Button v-on:click="onAddAvailItem"><i class="pi pi-plus"></i></Button>
                </div>
            </form>

        </div>
    </div>
</template>

<style lang="css" scoped>
.preview-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 10px;
}

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

.center {
    margin: auto;
    width: 60%;
    margin-top: 1em;
}

.form-div {
    margin-top: 1em;
}

.form-div * {
    margin-top: 0.25em;
}

.form-div .btn {
    display: block;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1em;
    width: 32%;
}

.inline-fields {
    display: flex;
    gap: 0em;
}

.inline-fields>* {
    flex: 1;
}
</style>