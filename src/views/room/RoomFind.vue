<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RoomAPI, type PaginatedResultInfoDTO, type QueryRoomsDTO, type RoomResultDTO, type RoomsResultDTO } from '../../api/room.api';
import type { AxiosError, AxiosResponse } from 'axios';
import type { PageState } from 'primevue';

const rooms = ref<RoomResultDTO[]>([]);
const info = ref<PaginatedResultInfoDTO | null>(null);
const pageSize = ref<number>(6);
const pageNumber = ref<number>(1);

const query = ref({
    address: '',
    guests: 1,
    dateFrom: new Date(),
    dateTo: new Date(),
    pageNumber: 1,
    pageSize: 6,
});

const queryDTO = ref<QueryRoomsDTO>({
    address: query.value.address,
    guestsNumber: query.value.guests,
    dateFrom: query.value.dateFrom.toISOString(),
    dateTo: query.value.dateTo.toISOString(),
    pageNumber: query.value.pageNumber,
    pageSize: query.value.pageSize,
});

const findAvailableRooms = () => {
    RoomAPI.findAvailableRooms(queryDTO.value).then((res: AxiosResponse<RoomsResultDTO>) => {
        rooms.value = res.data.hits;
        info.value = res.data.info;
    }).catch((err: AxiosError) => {
        console.error(err);
    });
}

const onPageSizeChange = (newValue: number) => {
    pageSize.value = newValue;
    queryDTO.value.pageSize = newValue;
    findAvailableRooms()
}

const onPageNumberChange = (event: PageState) => {
    pageNumber.value = event.page + 1;
    queryDTO.value.pageNumber = pageNumber.value;
    findAvailableRooms()
}

onMounted(() => findAvailableRooms());

</script>

<template>
    <div class="card">
        <Paginator :rows="1" :totalRecords="info ? info.totalHits : 0" :rowsPerPageOptions="[1, 2, 48]" @page="onPageNumberChange" @update:rows="onPageSizeChange">
            <template #start="slotProps">
                <p>Rows per page {{ pageSize }}</p>
                <p>Page number {{ pageNumber }}</p>
                <p>Total rooms {{ info ? info.totalHits : 0 }}</p>
                Page: {{ slotProps.state.page }}
                First: {{ slotProps.state.first }}
                Rows: {{ slotProps.state.rows }}
            </template>
            <template #end>
                <Button type="button" icon="pi pi-search"/>
            </template>
        </Paginator>
        
        <div class="container">
            <div class="list">
                <div v-if="rooms.length > 0">
                    <div v-for="room in rooms" :key="room.id" class="room-item">
                        <RouterLink :to="`/room/${room.id}`">{{ room.name }}</RouterLink>
                    </div>
                </div>
                <div v-else>
                    No rooms found.
                </div>
            </div>
        </div>
    </div>  
</template>