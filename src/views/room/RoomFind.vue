<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RoomAPI, type PaginatedResultInfoDTO, type QueryRoomsDTO, type RoomResultDTO, type RoomsResultDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import type { PageState } from 'primevue';
import { label } from '@primeuix/themes/aura/metergroup';

const rooms = ref<RoomResultDTO[]>([]);
const info = ref<PaginatedResultInfoDTO | null>(null);
const paginatorPageSize = ref<number>(2);
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

        <form @submit.prevent="findAvailableRooms" class="left-panel">
            <FloatLabel>
                <label for="fromDate">From</label>
                <DatePicker id="fromDate" v-model="formDateFrom"
                    v-on:value-change="onFromDateChanged" date-format="dd MM" showIcon :style="{ width: '100%' }"/>
            </FloatLabel>

            <FloatLabel>
                <label for="toDate">To</label>
                <DatePicker id="toDate" v-model="formDateTo" :min-date="new Date(formDateFrom)"
                    date-format="dd MM" showIcon :style="{ width: '100%' }"/>
            </FloatLabel>

            <FloatLabel>
                <label>Guests</label>
                <InputNumber :min="1" v-model.trim="formGuests" fluid placeholder="Add number of guests..."/>
            </FloatLabel>
            
            <FloatLabel>
                <label>Address</label>
                <InputText type="text" v-model.trim="formAddress" :maxlength="50" fluid  placeholder="Add address..."/>
            </FloatLabel>

            <Button type="submit" icon="pi pi-search" label="Search"/>
        </form>

        <div class="right-panel">
            <div>
                <div v-if="rooms && rooms.length > 0">
                    <div v-for="room in rooms" :key="room.id" class="cards">
                        <Card style="width: 15rem; overflow: hidden">
                            <template #header>
                                <Galleria :value="room.photos" :numVisible="5" :circular="true" :showItemNavigators="true" :showThumbnails="false">
                                    <template #item="photo">
                                        <img :src="`http://localhost:8505/img/${photo.item}`" :alt="photo.item" style="width: 100%; height: 10rem; object-fit: cover; display: block;" />
                                    </template>
                                </Galleria>
                            </template>
                            <template #title>{{ room.name }}</template>
                            <template #subtitle>{{ room.address }}</template>
                            <template #content>
                                <p class="m-0">
                                    {{ room.description }}
                                </p>
                            </template>
                            <template #footer>
                                €{{ room.totalPrice }} for {{  }} nights, price by guest {{ room.perGuest }}, Day €{{ room.unitPrice }}, 
                                <div class="flex gap-4 mt-1" >
                                </div>
                            </template>
                        </Card>
                    </div>
                </div>
                <div v-else>
                    No rooms found.
                </div>
            </div>

            <Paginator :rows="2" :totalRecords="info ? info.totalHits : 0" :rowsPerPageOptions="[2, 48]" @page="onPageNumberChange" @update:rows="onPageSizeChange">
            </Paginator>
        </div>
    </div>  
</template>

<style lang="css" scoped>

.cards {
    display: flex;
    flex-direction: row;
    gap: 2rem;
    width: 100%;
}

.find-layout {
    margin: 4rem;
    display: flex;
    gap: 3rem;
}

.left-panel {
    flex: 1;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.right-panel {
    flex: 4;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-width: 600px;
}


</style>