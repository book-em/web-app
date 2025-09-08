<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RoomAPI, type PaginatedResultInfoDTO, type QueryRoomsDTO, type RoomResultDTO, type RoomsResultDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import type { PageState } from 'primevue';

const rooms = ref<RoomResultDTO[]>([]);
const info = ref<PaginatedResultInfoDTO | null>(null);
const paginatorPageSize = ref<number>(1);
const paginatorPageNumber = ref<number>(1);
const formDateFrom = ref<Date>(new Date());
const formDateTo = ref<Date>(new Date());
const formAddress = ref<string>('');
const formGuests = ref<number>(1);

const findAvailableRooms = () => {
    const queryDTO = {
        address: formAddress.value,
        guestsNumber: formGuests.value,
        dateFrom: formDateFrom.value.toISOString(),
        dateTo: formDateTo.value.toISOString(),
        pageNumber: paginatorPageNumber.value,
        pageSize: paginatorPageSize.value,
    };

    RoomAPI.findAvailableRooms(queryDTO).then((res: AxiosResponse<RoomsResultDTO>) => {
        rooms.value = res.data.hits;
        info.value = res.data.info;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const onPageSizeChange = (newValue: number) => {
    paginatorPageSize.value = newValue;
    findAvailableRooms()
}

const onPageNumberChange = (event: PageState) => {
    paginatorPageNumber.value = event.page + 1;
    findAvailableRooms()
}

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

onMounted(() => findAvailableRooms());

</script>

<template>
    <div class="find-layout">
        
        <div class="left-panel">
            <form @submit.prevent="findAvailableRooms" class="flex flex-col gap-4">
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
                    <InputNumber :min="1" v-model.trim="formGuests" fluid placeholder="Add number of guests..."/>
                </div>

                <div class="flex items-center gap-2 mt-small">
                    <InputText type="text" v-model.trim="formAddress" :maxlength="50" fluid  placeholder="Add address..."/>
                </div>

                <Button type="submit" icon="pi pi-search" label="Search" class="mt-small" />
            </form>
        </div>

        <div class="right-panel mt-small">
            <div class="container">
                <div class="list">
                    <div v-if="rooms && rooms.length > 0">
                        <div v-for="room in rooms" :key="room.id" class="room-item">
                            <div class="flex-items">
                                <RouterLink :to="`/room/${room.id}`">{{ room.name }}</RouterLink>
                            </div>

                            <div class="flex-items">
                                <div class="preview-grid">
                                    <div v-for="img in room.photos.slice(0, 4)" class="preview-item">
                                        <Image :src="`http://localhost:8505/img/${img}`"></Image>
                                    </div>
                                </div>
                            </div>                        
                        </div>
                    </div>
                    <div v-else>
                        No rooms found.
                    </div>
                </div>
            </div>

            <Paginator :rows="1" :totalRecords="info ? info.totalHits : 0" :rowsPerPageOptions="[1, 2, 48]" @page="onPageNumberChange" @update:rows="onPageSizeChange"/>
        </div>
    </div>  
</template>

<style lang="css" scoped>

.find-layout {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
}

.mt-small {
    margin-top: 2em;
}

.left-panel {
    flex: 1;
    min-width: 50px;
}

.right-panel {
    flex: 2;
    min-width: 100px;
}
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

.container {
    margin: 2em;
}

.list {
    margin-top: 1em;
}

.flex-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: normal;
    align-items: normal;
    align-content: normal;

    background-color: var(--p-color-text);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
    margin-top: 1em;
}

.flex-items:nth-child(1) {
    display: block;
    flex-grow: 0;
    flex-shrink: 2;
    flex-basis: auto;
    align-self: auto;
    order: 0;
    margin: 20px;
    min-width: 20%;
}

.flex-items:nth-child(2) {
    display: block;
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    align-self: auto;
    order: 0;
    margin: 20px;

}

</style>