<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
    type CreateRoomAvailabilityItemDTO,
    type CreateRoomAvailabilityListDTO,
    RoomAPI,
    type RoomAvailabilityListDTO,
} from "../../api/room.api";
import type { AxiosError, AxiosResponse } from "axios";
import HeatmapCalendar from "../HeatmapCalendar.vue";

const props = defineProps<{ roomId: number }>();
const roomAvailability = ref<RoomAvailabilityListDTO | null>(null);
const roomAvailabilityBeforeEdit = ref<RoomAvailabilityListDTO | null>(null);
const isEditingRoomAvailability = ref(false);
const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formAvailable = ref(true);
const errorAvailabilityNew = ref("");
const errorAvailability = ref("");
const loading = ref(false);

onMounted(
    () => {
        loadRoomAvailability();
        formDateTo.value.setDate(formDateFrom.value.getDate() + 7);
    }
);

watch(
    () => props.roomId,
    () => loadRoomAvailability(),
);

const loadRoomAvailability = () => {
    loading.value = true;

    RoomAPI.findCurrentAvailabilityListOfRoom(props.roomId)
        .then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
            roomAvailability.value = res.data;
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
        roomAvailability.value = {
            id: 0,
            effectiveFrom: new Date().toISOString(),
            items: [],
            roomId: props.roomId,
        };
    }
}

const resetDateHours = () => {
    formDateFrom.value.setHours(0, 0, 0, 0);
    formDateTo.value.setHours(0, 0, 0, 0);
}

const onAddAvailItem = () => {
    ensureAvailabilityExists();
    errorAvailabilityNew.value = "";
    const from = formDateFrom.value;
    const to = formDateTo.value;
    const datesEqualWithoutYear = (d1: Date, d2: Date): boolean =>
        d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    for (const element of roomAvailability.value.items) {
        const from2 = new Date(element.dateFrom);
        const to2 = new Date(element.dateTo);
        if (datesEqualWithoutYear(from, from2) && datesEqualWithoutYear(to, to2)) {
            errorAvailabilityNew.value = "A rule with this date range already exists";
            return;
        }
    }
    resetDateHours();
    roomAvailability.value.items.push({
        id: 0,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        available: formAvailable.value,
    });
};

const removeAvailItem = (index: number) => {
    roomAvailability.value.items.splice(index, 1);
};

const startEditingRoomAvailability = () => {
    roomAvailabilityBeforeEdit.value = JSON.parse(
        JSON.stringify(roomAvailability.value),
    );
    isEditingRoomAvailability.value = true;
};

const cancelEditingRoomAvailability = () => {
    roomAvailability.value = JSON.parse(
        JSON.stringify(roomAvailabilityBeforeEdit.value),
    );
    isEditingRoomAvailability.value = false;
};

const submitEditingRoomAvailability = () => {
    const items: CreateRoomAvailabilityItemDTO[] =
        roomAvailability.value.items.map((item) => ({
            existingId: item.id,
            dateFrom: item.dateFrom,
            dateTo: item.dateTo,
            available: item.available,
        }));
    const dto: CreateRoomAvailabilityListDTO = { roomId: props.roomId, items };

    errorAvailability.value = "";
    loading.value = true;

    RoomAPI.updateAvailability(dto)
        .then((res: AxiosResponse<RoomAvailabilityListDTO>) => {
            roomAvailability.value = res.data;
            isEditingRoomAvailability.value = false;
        })
        .catch((err: AxiosError) => {
            errorAvailability.value = err.message.toString();
            console.error(err);
        }).finally(() => {
            loading.value = false;
        });
};

const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "long" });
};

const onFromDateChanged = () => {
    const dateFrom = new Date(formDateFrom.value);
    const dateTo = new Date(formDateTo.value);
    if (dateFrom >= dateTo) {
        let dateToNew = dateTo;
        dateToNew.setDate(dateFrom.getDate() + 1);
        dateToNew.setHours(0, 0, 0, 0);
        formDateTo.value = dateToNew;
    }
}

</script>

<template>
    <div v-if="loading">
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>
    <div class="p-4" v-if="roomAvailability != null">
        <Card>
            <template #content>
                <div>

                    <div class="availability-layout">
                        <!-- LEFT SIDE: List -->
                        <div class="left-panel">
                            <div>
                                <HeatmapCalendar :availabilityItems="roomAvailability.items"
                                    :year="new Date().getFullYear()" />
                            </div>

                            <div v-if="roomAvailability.items.length > 0">
                                <DataTable :value="roomAvailability.items" responsiveLayout="scroll" class="mb-4">
                                    <Column header="From" field="dateFrom"> <template #body="slotProps"> {{
                                        formatDate(slotProps.data.dateFrom) }} </template>
                                    </Column>
                                    <Column header="To" field="dateTo"> <template #body="slotProps"> {{
                                        formatDate(slotProps.data.dateTo) }} </template>
                                    </Column>
                                    <Column header="Can Book?"> <template #body="slotProps">
                                            <Tag :value="slotProps.data.available ? 'Yes' : 'No'"
                                                :severity="slotProps.data.available ? 'success' : 'danger'"
                                                icon="pi pi-check" v-if="slotProps.data.available" />
                                            <Tag value="No" severity="danger" icon="pi pi-ban" v-else />
                                        </template>
                                    </Column>
                                    <Column header="Actions">
                                        <template #body="slotProps"> <Button icon="pi pi-trash" label="Remove"
                                                class="p-button-danger p-button-sm"
                                                @click="removeAvailItem(slotProps.index)"
                                                :disabled="!isEditingRoomAvailability" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                            <div v-else>
                                <i class="pi pi-info-circle mr-2"></i> No room availability rooms have been defined.
                            </div>

                        </div>
                        <!-- RIGHT SIDE: Form -->
                        <div class="right-panel mt-small">
                            <div v-if="!isEditingRoomAvailability">
                                <Button icon="pi pi-pencil" label="Edit" class="p-button-info"
                                    @click="startEditingRoomAvailability" />
                            </div>

                            <div v-else>
                                <div>
                                    <Message v-show="errorAvailability.length > 0" severity="error" size="small"
                                        variant="simple">
                                        {{ errorAvailability }}
                                    </Message>

                                    <Button icon="pi pi-undo" label="Cancel editing" class="p-button-danger mr-small"
                                        @click="cancelEditingRoomAvailability" />
                                    <Button :disabled="errorAvailability.length > 0" icon="pi pi-send"
                                        label="Submit changes" class="p-button-success mr-small"
                                        @click="submitEditingRoomAvailability" />
                                </div>

                                <Divider />

                                <h3>Add new availability rule</h3>

                                <form @submit.prevent="onAddAvailItem" class="flex flex-col gap-4">
                                    <FloatLabel class="mt-small">
                                        <label for="fromDate">From</label>
                                        <DatePicker id="fromDate" v-model="formDateFrom"
                                            v-on:value-change="onFromDateChanged" date-format="dd MM" showIcon
                                            class="w-full" />
                                    </FloatLabel>

                                    <FloatLabel class="mt-small">
                                        <label for="toDate">To</label>
                                        <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)"
                                            date-format="dd MM" showIcon class="w-full" />
                                    </FloatLabel>

                                    <div class="flex items-center gap-2 mt-small">
                                        <label for="available" class="mr-small">Reservations allowed during these
                                            days:</label>
                                        <Checkbox id="available" v-model="formAvailable" binary />
                                    </div>

                                    <Message v-show="errorAvailabilityNew.length > 0" severity="error" size="small"
                                        variant="simple">
                                        {{ errorAvailabilityNew }}
                                    </Message>

                                    <Button type="submit" icon="pi pi-plus" label="Add rule" class="mt-small" />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>
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

.availability-layout {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
}

.left-panel {
    flex: 2;
    min-width: 400px;
}

.right-panel {
    flex: 1;
    min-width: 200px;
}
</style>