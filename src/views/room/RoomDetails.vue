<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { type CreateRoomAvailabilityItemDTO, type CreateRoomAvailabilityListDTO, RoomAPI, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import HeatmapCalendar from '../../components/HeatmapCalendar.vue';

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
        console.log(res.data);
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

const removeAvailItem = (id: number) => {

};

const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
};

</script>

<template>

    <div v-if="room != null">
        <!-- Details -->

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

        <!-- Availability -->

        <div class="p-4">
            <Card>
                <template #title>
                    <h2 class="text-xl font-semibold">Room Availability</h2>
                </template>

                <template #content>
                    <div v-if="roomAvailability == null" class="text-gray-500">
                        <i class="pi pi-info-circle mr-2"></i> No availability data found.
                    </div>

                    <div v-else>
                        <!-- List -->

                        <DataTable :value="roomAvailability.items" responsiveLayout="scroll" class="mb-4">
                            <Column header="From" field="dateFrom">
                                <template #body="slotProps">
                                    {{ formatDate(slotProps.data.dateFrom) }}
                                </template>
                            </Column>

                            <Column header="To" field="dateTo">
                                <template #body="slotProps">
                                    {{ formatDate(slotProps.data.dateTo) }}
                                </template>
                            </Column>

                            <Column header="Can Book?">
                                <template #body="slotProps">
                                    <span v-if="slotProps.data.available" class="text-green-600">
                                        <i class="pi pi-check mr-1"></i> Yes

                                    </span>
                                    <span v-else class="text-red-500 font-medium">
                                        <i class="pi pi-ban mr-1"></i> No
                                    </span>
                                </template>
                            </Column>

                            <Column header="Actions">
                                <template #body="slotProps">
                                    <Button icon="pi pi-trash" label="Remove" class="p-button-danger p-button-sm"
                                        @click="removeAvailItem(slotProps.index)" />
                                </template>
                            </Column>
                        </DataTable>

                        <!-- Heatmap calendar -->

                        <HeatmapCalendar :availabilityItems="roomAvailability.items" :year="2025" />

                    </div>

                    <Divider />

                    <form @submit.prevent="onAddAvailItem" class="flex flex-wrap gap-4 items-end">
                        <FloatLabel>
                            <label for="fromDate">From</label>
                            <DatePicker id="fromDate" v-model="formDateFrom" date-format="dd MM" showIcon
                                class="w-full" />
                        </FloatLabel>

                        <FloatLabel>
                            <label for="toDate">To</label>
                            <DatePicker id="toDate" v-model="formDateTo" date-format="dd MM" showIcon class="w-full" />
                        </FloatLabel>

                        <div class="flex items-center gap-2">
                            <label for="available">Reservations allowed:</label>
                            <Checkbox id="available" v-model="formAvailable" binary />
                        </div>

                        <Button type="submit" icon="pi pi-plus" label="Add" />
                    </form>
                </template>
            </Card>
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