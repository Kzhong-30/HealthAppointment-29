<script setup lang="ts">
import type { Collaborator } from '../types'

defineProps<{
  me: Collaborator | null
  others: readonly Collaborator[]
  totalCount: number
  isEnabled: boolean
  isConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<template>
  <div class="collab-bar">
    <button
      class="collab-toggle"
      :class="{ active: isEnabled, connected: isConnected && isEnabled }"
      @click="emit('toggle')"
      :title="
        isEnabled
          ? isConnected
            ? '已连接到协作房间'
            : '正在连接协作房间…'
          : '开启跨设备实时协作'
      "
    >
      <span class="status-dot"></span>
      <span class="toggle-icon">
        {{ isEnabled ? (isConnected ? '🟢' : '🟡') : '⚪' }}
      </span>
      <span class="toggle-text">
        {{ isEnabled ? (isConnected ? '协作已连接' : '连接中…') : '开启协作' }}
      </span>
    </button>

    <div v-if="me || others.length > 0" class="avatars-stack">
      <template v-if="me">
        <div
          class="avatar me-avatar"
          :style="{ backgroundColor: me.color }"
          :title="me.name + ' (你)'"
        >
          {{ me.name.charAt(0).toUpperCase() }}
          <span class="me-badge">你</span>
        </div>
      </template>
      <template v-for="collab in others" :key="collab.id">
        <div
          class="avatar other-avatar"
          :style="{ backgroundColor: collab.color }"
          :title="collab.name"
        >
          {{ collab.name.charAt(0).toUpperCase() }}
        </div>
      </template>
      <span v-if="totalCount > 0" class="collab-count">
        {{ totalCount }} 人在线
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
  position: relative;
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
  cursor: pointer;
}

.collab-toggle:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.collab-toggle.active {
  border-color: #22c55e;
  background: #f0fdf4;
  color: #15803d;
}

.collab-toggle.connected::before {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 3px #f0fdf4;
}

.status-dot {
  display: none;
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
  position: relative;
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

.me-avatar {
  border: 2px solid #3b82f6;
  box-shadow: 0 0 0 2px #dbeafe;
  z-index: 5;
}

.me-badge {
  position: absolute;
  bottom: -4px;
  right: -6px;
  font-size: 0.6rem;
  line-height: 1;
  padding: 2px 5px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.other-avatar {
  opacity: 0.92;
}

.collab-count {
  margin-left: 12px;
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}
</style>
