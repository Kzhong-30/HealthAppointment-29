<script setup lang="ts">
import type { Collaborator } from '../types'

defineProps<{
  collaborators: Collaborator[]
  currentUserId: string
  isEnabled: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="collab-bar">
    <button
      class="collab-toggle"
      :class="{ active: isEnabled }"
      @click="emit('toggle')"
    >
      <span class="toggle-icon">{{ isEnabled ? '🟢' : '⚪' }}</span>
      <span class="toggle-text">{{ isEnabled ? '协作已开启' : '开启协作' }}</span>
    </button>

    <div v-if="collaborators.length > 0" class="avatars-stack">
      <div
        v-for="collab in collaborators.slice().reverse()"
        :key="collab.id"
        class="avatar"
        :style="{ backgroundColor: collab.color }"
        :title="collab.name + (collab.id === currentUserId ? ' (你)' : '')"
      >
        {{ collab.name.charAt(0).toUpperCase() }}
      </div>
      <span v-if="collaborators.length > 1" class="collab-count">
        {{ collaborators.length }} 人在线
      </span>
    </div>
  </div>
</template>

<style scoped>
.collab-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collab-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
}

.collab-toggle:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.collab-toggle.active {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}

.toggle-icon {
  font-size: 1rem;
}

.toggle-text {
  color: inherit;
}

.avatars-stack {
  display: flex;
  align-items: center;
  gap: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  margin-left: -8px;
  transition: transform 0.2s;
}

.avatar:first-child {
  margin-left: 0;
}

.avatar:hover {
  transform: scale(1.1);
  z-index: 10;
}

.collab-count {
  margin-left: 12px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}
</style>
