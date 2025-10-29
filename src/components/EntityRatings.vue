<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { RatingAPI, type RatingsWithAverageDTO } from '../api/rating.api';

type RatingTarget = 'host' | 'room';

interface Props {
  targetType: RatingTarget;  
  targetId: number;            
  title?: string;              
  primaryName?: string;        
  secondaryName?: string;       
}
const props = defineProps<Props>();

const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<RatingsWithAverageDTO | null>(null);

const displayTitle = computed(() => props.title ?? (props.targetType === 'host' ? 'Host Rating' : 'Room Rating'));
const displayName  = computed(() => [props.primaryName?.trim(), props.secondaryName?.trim()].filter(Boolean).join(' '));

const starify = (score: number) => {
  const s = Math.max(0, Math.min(5, Math.round(score)));
  return `<span class="filled">${'★'.repeat(s)}</span><span class="empty">${'☆'.repeat(5 - s)}</span>`;
};

onMounted(async () => {
  if (!props.targetId) return;
  loading.value = true;
  error.value = null;
  try {
    const res = await RatingAPI.getRatingsWithAvg(props.targetId, props.targetType);
    data.value = res.data;
  } catch (e: any) {
    error.value = e?.response?.data?.error || 'Failed to load ratings';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="ratings-panel">
    <div class="header">
      <div class="title">
        <i class="pi pi-star"></i>
        <h3>{{ displayTitle }}</h3>
      </div>
      <div v-if="displayName" class="name">{{ displayName }}</div>
    </div>

    <div v-if="loading" class="loading">
      <ProgressBar mode="indeterminate" style="height: 4px" />
    </div>

    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else>
      <div class="summary" v-if="data">
        <div class="avg">
          <span class="avg-number">{{ data.average?.toFixed(2) ?? '—' }}</span>
          <span class="avg-stars" v-html="starify(data.average ?? 0)"></span>
        </div>
        <div class="count">{{ data.ratings.length }} review(s)</div>
      </div>

      <div class="ratings" v-if="data && data.ratings.length">
        <div v-for="(r, idx) in data.ratings" :key="idx" class="rating-item">
          <div class="rating-head">
            <span class="user">{{ r.username }}</span>
            <span class="stars" v-html="starify(r.score)"></span>
            <span class="date">{{ new Date(r.time).toLocaleDateString() }}</span>
          </div>
          <div class="comment" v-if="r.comment">{{ r.comment }}</div>
        </div>
      </div>

      <div v-else class="empty">No ratings yet.</div>
    </div>
  </div>
</template>

<style scoped>
.ratings-panel {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--surface-card);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,.05);
}
.header {
  display: flex; justify-content: space-between; align-items: baseline; margin-bottom: .5rem;
}
.title { display: flex; align-items: center; gap: .5rem; }
.title .pi { color: var(--primary-color); }
.name { font-weight: 600; opacity: .9; }

.summary { display: flex; align-items: center; gap: 1rem; margin: .5rem 0 1rem; }
.avg { display: flex; align-items: center; gap: .5rem; }
.avg-number { font-size: 1.25rem; font-weight: 700; }

.avg-stars, .stars { letter-spacing: .1rem; font-size: 1.1rem; line-height: 1; }
:deep(.filled) { color: #FFD700; } /* yellow/gold */
:deep(.empty)  { color: #d0d0d0; } /* light gray */

.ratings { display: grid; gap: .75rem; }
.rating-item {
  padding: .75rem;
  border: 1px solid color-mix(in srgb, var(--surface-border) 60%, transparent);
  border-radius: 8px;
}
.rating-head {
  display: grid; grid-template-columns: 1fr auto auto; gap: .5rem; align-items: center; margin-bottom: .35rem;
}
.user { font-weight: 600; }
.date { opacity: .6; font-size: .9rem; }
.comment { opacity: .95; }
.empty, .error { opacity: .8; }
.loading { margin: .5rem 0; }
</style>
