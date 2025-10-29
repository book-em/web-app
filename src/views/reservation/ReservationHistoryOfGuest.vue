<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { AxiosError, AxiosResponse } from 'axios';

import { useAuthStore } from '../../stores/auth-store';
import { ReservationAPI, type ReservationDTO } from '../../api/reservation.api';
import { RoomAPI, type RoomDTO } from '../../api/room.api';
import { RatingAPI, type CreateRatingDTO, type RatingTargetType } from '../../api/rating.api';

import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';

import { useToast } from 'primevue/usetoast';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToast();

const loading = ref(false);
const error = ref('');

const reservations = ref<ReservationDTO[]>([]);

const rateDialogVisible = ref(false);
const rateTargetType = ref<RatingTargetType>('room'); // 'room' | 'host'
const rateTargetId = ref<number | null>(null);
const rateSubmitting = ref(false);
const rateForm = ref<CreateRatingDTO>({ score: 5, comment: '' } as CreateRatingDTO);

const deleting = ref<Record<string, boolean>>({});
const delKey = (type: RatingTargetType, targetId: number) => `${type}:${targetId}`;

const openRateDialog = async (type: RatingTargetType, reservation: ReservationDTO) => {
  rateTargetType.value = type;
  rateForm.value = { score: 5, comment: '' } as CreateRatingDTO;

  if (type === 'room') {
    rateTargetId.value = reservation.roomId;
    rateDialogVisible.value = true;
    return;
  }

  const hostIdFromReservation = (reservation as any).hostId as number | undefined;
  if (hostIdFromReservation) {
    rateTargetId.value = hostIdFromReservation;
    rateDialogVisible.value = true;
    return;
  }

  try {
    loading.value = true;
    const r: AxiosResponse<RoomDTO> = await RoomAPI.findById(reservation.roomId);
    rateTargetId.value = r.data.hostID;
    rateDialogVisible.value = true;
  } catch {
    error.value = 'Failed to resolve host for this reservation.';
  } finally {
    loading.value = false;
  }
};

const submitRating = async () => {
  if (!rateTargetId.value) return;

  const s = Number(rateForm.value.score);
  if (Number.isNaN(s) || s < 1 || s > 5) {
    toast.add({ severity: 'warn', summary: 'Invalid score', detail: 'Score must be 1–5', life: 2500 });
    return;
  }

  rateSubmitting.value = true;
  error.value = '';

  try {
    await RatingAPI.createOrUpdateRating(
      rateTargetId.value,
      rateTargetType.value,
      { score: s, comment: (rateForm.value.comment || '').trim() }
    );
    rateDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Thank you!', detail: 'Your rating was submitted.', life: 2500 });
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to submit rating.';
  } finally {
    rateSubmitting.value = false;
  }
};

const resolveTargetId = async (type: RatingTargetType, reservation: ReservationDTO): Promise<number | null> => {
  if (type === 'room') return reservation.roomId;

  const hostIdFromReservation = (reservation as any).hostId as number | undefined;
  if (hostIdFromReservation) return hostIdFromReservation;

  try {
    const r: AxiosResponse<RoomDTO> = await RoomAPI.findById(reservation.roomId);
    return r.data.hostID;
  } catch {
    return null;
  }
};

const deleteRatingFor = async (type: RatingTargetType, reservation: ReservationDTO) => {
  const targetId = await resolveTargetId(type, reservation);
  if (!targetId) {
    toast.add({ severity: 'error', summary: 'Delete failed', detail: 'Could not resolve target.', life: 2500 });
    return;
  }

  if (!confirm(`Delete your ${type === 'room' ? 'room' : 'host'} rating?`)) return;

  const key = delKey(type, targetId);
  deleting.value[key] = true;

  try {
    await RatingAPI.deleteRating(targetId, type);
    toast.add({
      severity: 'success',
      summary: 'Rating deleted',
      detail: `${type === 'room' ? 'Room' : 'Host'} rating removed.`,
      life: 2500
    });
  } catch (e: any) {
    const status = e?.response?.status;
    const msg: string = e?.response?.data?.error || e?.message || '';
    const looksLikeNoRating =
      status === 404 ||
      /not\s*found/i.test(msg) ||
      /no\s*rating/i.test(msg) ||
      /doesn'?t?\s*exist/i.test(msg);

    if (looksLikeNoRating) {
      toast.add({
        severity: 'info',
        summary: 'No rating to delete',
        detail: "You don't have a rating for this yet.",
        life: 2500
      });
    } else {
      toast.add({ severity: 'error', summary: 'Delete failed', detail: msg || 'Failed to delete rating.', life: 3000 });
    }
  } finally {
    delete deleting.value[key];
  }
};

const loadPastReservations = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res: AxiosResponse<ReservationDTO[]> = await ReservationAPI.getPastReservationsByGuest();
    reservations.value = res.data;
  } catch (e: any) {
    error.value = e?.message || 'Failed to load past reservations.';
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  auth.checkLocalStorage();
  await loadPastReservations();
});

const enforceBounds = () => {
  if (rateForm.value.score < 1) rateForm.value.score = 1;
  if (rateForm.value.score > 5) rateForm.value.score = 5;
};
</script>

<template>
  <div>
    <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px" />

    <h3>Reservation History</h3>

    <Message v-if="error" severity="error" size="small" variant="simple" class="mb-2">
      {{ error }}
    </Message>

    <div v-if="!loading && reservations.length === 0">
      You have no past reservations.
    </div>

    <DataTable
      v-else
      :value="reservations"
      tableStyle="width: 100%; margin: auto"
      dataKey="id"
    >
      <Column field="roomId" header="Room">
        <template #body="{ data }">
          <RouterLink :to="`/room/${data.roomId}`">#{{ data.roomId }}</RouterLink>
        </template>
      </Column>

      <Column field="dateFrom" style="width: 18rem">
        <template #header>Start day <i class="pi pi-forward" /></template>
        <template #body="{ data }">
          {{ new Date(data.dateFrom).toDateString() }}
        </template>
      </Column>

      <Column field="dateTo" style="width: 18rem">
        <template #header><i class="pi pi-backward" /> End day</template>
        <template #body="{ data }">
          {{ new Date(data.dateTo).toDateString() }}
        </template>
      </Column>

      <Column field="guestCount">
        <template #header><i class="pi pi-users" /> Guests</template>
      </Column>

      <Column field="cost">
        <template #header><i class="pi pi-money-bill" /> Cost</template>
        <template #body="{ data }">${{ data.cost }}</template>
      </Column>

      <Column header="Rate">
        <template #body="{ data }">
          <div class="row-actions">
            <Button
              size="small"
              icon="pi pi-star"
              label="Rate Room"
              @click="openRateDialog('room', data)"
            />
            <Button
              size="small"
              icon="pi pi-user"
              label="Rate Host"
              severity="secondary"
              @click="openRateDialog('host', data)"
            />
          </div>
        </template>
      </Column>

      <Column header="Delete Rating">
        <template #body="{ data }">
          <div class="row-actions">
            <Button
              size="small"
              icon="pi pi-trash"
              label="Room Rating"
              severity="danger"
              :loading="deleting[`room:${data.roomId}`] === true"
              @click="deleteRatingFor('room', data)"
            />
            <Button
              size="small"
              icon="pi pi-trash"
              label="Host Rating"
              severity="danger"
              outlined
              :loading="deleting[`host:${data.roomId}`] === true"
              @click="deleteRatingFor('host', data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Rating dialog -->
    <Dialog
      v-model:visible="rateDialogVisible"
      modal
      :closable="!rateSubmitting"
      header="Leave a rating"
      style="width: fit-content"
    >
      <div class="dialog-body">
        <div class="row">
          <label class="lbl">Type</label>
          <div class="val">
            {{ rateTargetType === 'room' ? 'Room' : 'Host' }}
          </div>
        </div>
        <div class="row">
          <label class="lbl">Score (1–5)</label>
          <div class="val">
            <InputNumber
              v-model="rateForm.score"
              :min="1"
              :max="5"
              showButtons
              :useGrouping="false"
              :step="1"
              @blur="enforceBounds"
            />
          </div>
        </div>
        <div class="row">
          <label class="lbl">Comment</label>
          <div class="val">
            <Textarea
              v-model="rateForm.comment"
              :autoResize="true"
              rows="3"
              placeholder="Optional"
              style="width: 100%;"
            />
          </div>
        </div>

        <Message v-if="error" severity="error" size="small" variant="simple" class="mt-2">
          {{ error }}
        </Message>
      </div>

      <template #footer>
        <Button label="Cancel" text :disabled="rateSubmitting" @click="rateDialogVisible = false" />
        <Button
          label="Submit"
          icon="pi pi-check"
          :loading="rateSubmitting"
          @click="submitRating"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.row-actions {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
}

.dialog-body {
  display: grid;
  gap: .75rem;
}
.row {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: .75rem;
  align-items: center;
}
.lbl { font-weight: 600; }
.val { display: flex; align-items: center; }
</style>
