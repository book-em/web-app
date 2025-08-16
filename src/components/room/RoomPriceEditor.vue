<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
    type CreateRoomPriceItemDTO,
    type CreateRoomPriceListDTO,
    type RoomPriceListDTO,
    RoomAPI,
} from "../../api/room.api";
import type { AxiosError, AxiosResponse } from "axios";
import HeatmapCalendar from "../HeatmapCalendar.vue";

const props = defineProps<{ roomId: number }>();

const roomPriceList = ref<RoomPriceListDTO | null>(null);
const roomPriceListBeforeEdit = ref<RoomPriceListDTO | null>(null);
const isEditingRoomPriceList = ref(false);

const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formPrice = ref<number>(100);
const formPerGuest = ref(false);
const formBasePrice = ref<number>(100);

const errorPriceNew = ref("");
const errorPrice = ref("");
const loading = ref(false);

onMounted(() => {
    loadRoomPriceList();
    formDateTo.value.setDate(formDateFrom.value.getDate() + 7);
});
watch(() => props.roomId, () => loadRoomPriceList());

const loadRoomPriceList = () => {
    loading.value = true;
    RoomAPI.findCurrentPriceListOfRoom(props.roomId)
        .then((res: AxiosResponse<RoomPriceListDTO>) => {
            roomPriceList.value = res.data;
            formBasePrice.value = res.data.basePrice;
            formPerGuest.value = res.data.perGuest;
        })
        .catch((err: AxiosError) => {
            console.error(err);
        }).finally(() => {
            loading.value = false;
        });
};

const ensurePriceListExists = () => {
    if (roomPriceList.value === null) {
        roomPriceList.value = {
            id: 0,
            effectiveFrom: new Date().toISOString(),
            basePrice: formBasePrice.value,
            perGuest: formPerGuest.value,
            items: [],
            roomId: props.roomId,
        };
    }
};

const onBasePriceChange = (newValue: number) => {
    ensurePriceListExists();
    roomPriceList.value.basePrice = newValue;
}

const onGuestModeChange = () => {
    ensurePriceListExists();

    roomPriceList.value.perGuest = formPerGuest.value;
}

const onAddPriceItem = () => {
    ensurePriceListExists();
    errorPriceNew.value = "";

    const from = formDateFrom.value;
    const to = formDateTo.value;

    const normalizeDate = (date: Date): Date =>
        new Date(2000, date.getMonth(), date.getDate());

    const rangesIntersectIgnoringYear = (
        from: Date,
        to: Date,
        from2: Date,
        to2: Date
    ): boolean => {
        const start1 = normalizeDate(from);
        const end1 = normalizeDate(to);
        const start2 = normalizeDate(from2);
        const end2 = normalizeDate(to2);

        return start1 <= end2 && start2 <= end1;
    };

    for (const element of roomPriceList.value.items) {
        const from2 = new Date(element.dateFrom);
        const to2 = new Date(element.dateTo);
        if (rangesIntersectIgnoringYear(from, to, from2, to2)) {
            errorPriceNew.value = `Conflicting date with (${from2.toDateString()} - ${to2.toDateString()})`;
            return;
        }
    }

    roomPriceList.value.items.push({
        id: 0,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        price: formPrice.value,
    });
};

const removePriceItem = (index: number) => {
    roomPriceList.value.items.splice(index, 1);
};

const startEditingRoomPriceList = () => {
    ensurePriceListExists();
    roomPriceListBeforeEdit.value = JSON.parse(JSON.stringify(roomPriceList.value));
    isEditingRoomPriceList.value = true;
};

const cancelEditingRoomPriceList = () => {
    roomPriceList.value = JSON.parse(JSON.stringify(roomPriceListBeforeEdit.value));
    isEditingRoomPriceList.value = false;
};

const submitEditingRoomPriceList = () => {
    const items: CreateRoomPriceItemDTO[] = roomPriceList.value.items.map((item) => ({
        existingId: item.id,
        dateFrom: item.dateFrom,
        dateTo: item.dateTo,
        price: item.price,
    }));

    const dto: CreateRoomPriceListDTO = {
        roomId: props.roomId,
        items,
        basePrice: formBasePrice.value,
        perGuest: formPerGuest.value,
    };

    errorPrice.value = "";
    loading.value = true;

    RoomAPI.updatePriceList(dto)
        .then((res: AxiosResponse<RoomPriceListDTO>) => {
            roomPriceList.value = res.data;
            isEditingRoomPriceList.value = false;
        })
        .catch((err: AxiosError) => {
            errorPrice.value = err.message.toString();
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
        formDateTo.value = dateToNew;
    }
}


</script>

<template>
    <div v-if="loading">
        <ProgressBar mode="indeterminate" style="height: 6px"></ProgressBar>
    </div>
    <div class="p-4" v-if="roomPriceList != null">
        <Card>
            <template #content>
                <div>
                    <div class="availability-layout">
                        <!-- LEFT SIDE: List -->
                        <div class="left-panel">
                            <div>
                                <h3>Base price: ${{ roomPriceList.basePrice }} {{ (roomPriceList.perGuest ? "per guest "
                                    : "") + "per night" }}</h3>

                                <DataTable v-if="roomPriceList.items.length > 0" :value="roomPriceList?.items ?? []"
                                    responsiveLayout="scroll" class="mb-4">
                                    <h4>Overrides, discounts and special prices:</h4>
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

                                    <Column header="Price">
                                        <template #body="slotProps">
                                            <Tag :value="`$${slotProps.data.price}`" severity="info" />
                                        </template>
                                    </Column>

                                    <Column header="Actions">
                                        <template #body="slotProps">
                                            <Button icon="pi pi-trash" label="Remove"
                                                class="p-button-danger p-button-sm"
                                                @click="removePriceItem(slotProps.index)"
                                                :disabled="!isEditingRoomPriceList" />
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </div>

                        <!-- RIGHT SIDE: Form -->
                        <div class="right-panel mt-small">
                            <div v-if="!isEditingRoomPriceList">
                                <Button icon="pi pi-pencil" label="Edit" class="p-button-info"
                                    @click="startEditingRoomPriceList" />
                            </div>

                            <div v-else>
                                <div>
                                    <Message v-show="errorPrice.length > 0" severity="error" size="small"
                                        variant="simple">
                                        {{ errorPrice }}
                                    </Message>

                                    <Button icon="pi pi-undo" label="Cancel editing" class="p-button-danger mr-small"
                                        @click="cancelEditingRoomPriceList" />
                                    <Button :disabled="errorPrice.length > 0" icon="pi pi-send" label="Submit changes"
                                        class="p-button-success mr-small" @click="submitEditingRoomPriceList" />
                                </div>

                                <Divider />

                                <h3>Pricing Settings</h3>

                                <div class="flex flex-col ">
                                    <FloatLabel>
                                        <InputNumber id="basePrice" v-model="formBasePrice" mode="currency"
                                            currency="USD" locale="en-US" @update:model-value="onBasePriceChange"
                                            class="w-full" :min="1" :max="1000000" fluid />
                                        <label for="basePrice">Base price</label>
                                    </FloatLabel>

                                    <div class="flex items-center gap-2 mt-small">
                                        <label for="perGuest" class="mr-small">All prices are per guest (instead of flat
                                            rate):</label>
                                        <Checkbox @value-change="onGuestModeChange" id="perGuest" v-model="formPerGuest"
                                            binary />
                                    </div>
                                </div>

                                <Divider />

                                <h3>Add new price rule</h3>
                                <div class="small">
                                    You can override the base price with price rules
                                </div>

                                <form @submit.prevent="onAddPriceItem">
                                    <FloatLabel class="mt-small">
                                        <DatePicker id="fromDate" v-model="formDateFrom"
                                            v-on:value-change="onFromDateChanged" date-format="dd MM" showIcon
                                            class="w-full" />
                                        <label for="fromDate">From</label>
                                    </FloatLabel>

                                    <FloatLabel class="mt-small">
                                        <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)"
                                            date-format="dd MM" showIcon class="w-full" />
                                        <label for="toDate">To</label>
                                    </FloatLabel>

                                    <FloatLabel class="mt-small">
                                        <InputNumber id="price" v-model="formPrice" mode="currency" currency="USD"
                                            locale="en-US" class="w-full" />
                                        <label for="price">Price</label>
                                    </FloatLabel>

                                    <Message v-show="errorPriceNew.length > 0" severity="error" size="small"
                                        variant="simple">
                                        {{ errorPriceNew }}
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
    <div v-else>
        <i class="pi pi-info-circle mr-2"></i> You haven't defined any prices for this room.
        <Button @click="startEditingRoomPriceList" icon="pi pi-plus" label="Define a price" class="mt-small" />

    </div>
</template>

<style scoped>
.mt-small {
    margin-top: 2em;
}

.mt-big {
    margin-top: 5em;
}

.mr-small {
    margin-right: 1em;
}

.mb-4 {
    margin-bottom: 1em;
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
    min-width: 250px;
}

.flex {
    display: flex;
}

.flex-col {
    flex-direction: column;
}

.gap-4 {
    gap: 1em;
}

.items-center {
    align-items: center;
}

.w-full {
    width: 100%;
}

.small {
    font-size: small;
}
</style>