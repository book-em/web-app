<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth-store';
import { useRoute, useRouter } from 'vue-router';
import { type CreateRoomAvailabilityItemDTO, type CreateRoomAvailabilityListDTO, RoomAPI, type RoomAvailabilityItemDTO, type RoomAvailabilityListDTO, type RoomDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import HeatmapCalendar from '../../components/HeatmapCalendar.vue';
import { on } from '@primeuix/themes/aura/floatlabel';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const room = ref<RoomDTO | null>(null);
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const roomAvailabilityBeforeEdit = ref<RoomAvailabilityListDTO | null>(null);
const isEditingRoomAvailability = ref(false);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formAvailable = ref(true);

onMounted(() => loadRoom());

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

const onAddAvailItem = () => {
    const roomId: number = parseInt(route.params.id as string);

    if (roomAvailability.value === null) {
        roomAvailability.value = {
            id: 0,
            effectiveFrom: new Date().toISOString(),
            items: [],
            roomId
        }
    }

    let itemsList: RoomAvailabilityItemDTO[] = [...roomAvailability.value.items];
    itemsList.push({
        id: 0,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        available: formAvailable.value,
    });

    roomAvailability.value.items = itemsList;
}

const removeAvailItem = (id: number) => {
    roomAvailability.value.items.splice(id, 1);
};

const startEditingRoomAvailability = () => {
    roomAvailabilityBeforeEdit.value = JSON.parse(JSON.stringify(roomAvailability.value)) as RoomAvailabilityListDTO;
    isEditingRoomAvailability.value = true;
}

const submitEditingRoomAvailability = () => {
    const createRoomAvailability: CreateRoomAvailabilityListDTO = {
        roomId: roomAvailability.value.roomId,
        items: roomAvailability.value.items
    };

    RoomAPI.updateAvailability(createRoomAvailability).then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
        roomAvailability.value = res.data;
        isEditingRoomAvailability.value = false;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const cancelEditingRoomAvailability = () => {
    roomAvailability.value = JSON.parse(JSON.stringify(roomAvailabilityBeforeEdit.value)) as RoomAvailabilityListDTO;
    isEditingRoomAvailability.value = false;
}

const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
};

const galleryResponsiveOptions = ref([
    {
        breakpoint: '1300px',
        numVisible: 4
    },
    {
        breakpoint: '575px',
        numVisible: 1
    }
]);

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

        <!-- Photographs -->

        <Galleria :value="room.photos" :responsiveOptions="galleryResponsiveOptions" :numVisible="5"
            containerStyle="max-width: 80%; margin: auto;" class="preview-item">
            <template #item="slotProps">
                <Image :src="`http://localhost:8505/img/${slotProps.item}`" preview
                    style="width: 500px; height: 500px; object-fit: cover; object-position: center;" />
            </template>

            <template #thumbnail="slotProps">
                <img :src="`http://localhost:8505/img/${slotProps.item}`" preview
                    style="width: 100px; height: 100px; object-fit: cover; object-position: center;" />
            </template>
        </Galleria>

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
                                    <Tag :value="slotProps.data.available ? 'Yes' : 'No'"
                                        :severity="slotProps.data.available ? 'success' : 'danger'" icon="pi pi-check"
                                        v-if="slotProps.data.available" />
                                    <Tag value="No" severity="danger" icon="pi pi-ban" v-else />
                                </template>
                            </Column>

                            <Column header="Actions">
                                <template #body="slotProps">
                                    <Button icon="pi pi-trash" label="Remove" class="p-button-danger p-button-sm"
                                        @click="removeAvailItem(slotProps.index)"
                                        :disabled="!isEditingRoomAvailability" />
                                </template>
                            </Column>
                        </DataTable>

                        <!-- Heatmap calendar -->

                        <HeatmapCalendar :availabilityItems="roomAvailability.items" :year="new Date().getFullYear()" />

                    </div>

                    <Divider />

                    <div class="mt-small">
                        <!-- Edit mode -->

                        <div v-if="!isEditingRoomAvailability">
                            <!-- When not editing -->
                            <Button icon="pi pi-pencil" label="Edit" class="p-button-info"
                                @click="startEditingRoomAvailability" />
                        </div>
                        <div v-else>
                            <!-- When editing -->

                            <h3>Add new availability rule</h3>

                            <form @submit.prevent="onAddAvailItem" class="flex flex-wrap gap-4 items-end">
                                <FloatLabel class="mt-small">
                                    <label for="fromDate">From</label>
                                    <DatePicker id="fromDate" v-model="formDateFrom" date-format="dd MM" showIcon
                                        class="w-full" />
                                </FloatLabel>

                                <FloatLabel class="mt-small">
                                    <label for="toDate">To</label>
                                    <DatePicker id="toDate" v-model="formDateTo" date-format="dd MM" showIcon
                                        class="w-full" />
                                </FloatLabel>

                                <div class="flex items-center gap-2 mt-small">
                                    <label for="available" class="mr-small">Reservations allowed during these
                                        days:</label>
                                    <Checkbox id="available" v-model="formAvailable" binary />
                                </div>

                                <Button type="submit" icon="pi pi-plus" label="Add rule" class="mt-small" />
                            </form>

                            <Divider />

                            <div class="mt-big">
                                <Button icon="pi pi-undo" label="Cancel editing" class="p-button-danger mr-small"
                                    @click="cancelEditingRoomAvailability" />
                                <Button icon="pi pi-send" label="Submit changes" class="p-button-success mr-small"
                                    @click="submitEditingRoomAvailability" />
                            </div>

                        </div>
                    </div>
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