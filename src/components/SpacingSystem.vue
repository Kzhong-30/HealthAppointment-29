<script setup lang="ts">
import type { SpacingSystem, BorderRadiusSystem } from '../types'

defineProps<{
  spacing: SpacingSystem
  borderRadius: BorderRadiusSystem
}>()
</script>

<template>
  <section class="doc-section">
    <div class="section-header">
      <h2 class="section-title">间距系统 Spacing</h2>
      <div class="section-subtitle">基于 4px 基准的间距系统</div>
    </div>

    <div class="spacing-showcase">
      <div
        v-for="(value, key) in spacing"
        :key="'sp-'+key"
        class="spacing-item"
      >
        <div class="spacing-label">
          <span class="token-name">{{ key }}</span>
          <span class="token-value">{{ value }}</span>
        </div>
        <div class="spacing-visual">
          <div class="spacing-guide">
            <span class="guide-label start">0</span>
            <span class="guide-label end">{{ value }}</span>
            <div class="spacing-bar" :style="{ width: value, maxWidth: '100%' }">
              <span class="bar-value">⟷</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section-header" style="margin-top: 48px;">
      <h2 class="section-title">圆角 Border Radius</h2>
      <div class="section-subtitle">用于按钮、卡片、输入框等组件的圆角系统</div>
    </div>

    <div class="radius-showcase">
      <div
        v-for="(value, key) in borderRadius"
        :key="'br-'+key"
        class="radius-item"
      >
        <div
          class="radius-box"
          :style="{ borderRadius: value }"
        ></div>
        <div class="radius-info">
          <div class="radius-name">{{ key }}</div>
          <div class="radius-value">{{ value }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.doc-section {
  margin-bottom: 48px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 0.9rem;
  color: #6b7280;
}

.spacing-showcase {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spacing-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.spacing-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.token-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
}

.token-value {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
}

.spacing-visual {
  position: relative;
  padding: 24px 12px;
  background: white;
  border-radius: 6px;
  border: 1px dashed #d1d5db;
}

.spacing-guide {
  position: relative;
  width: 100%;
}

.guide-label {
  position: absolute;
  top: -18px;
  font-size: 0.7rem;
  color: #9ca3af;
  font-family: 'Monaco', 'Menlo', monospace;
}

.guide-label.start {
  left: 0;
}

.guide-label.end {
  right: 0;
}

.spacing-bar {
  position: relative;
  height: 32px;
  background: linear-gradient(90deg, #93c5fd, #3b82f6);
  border-radius: 4px;
  min-width: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.radius-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
}

.radius-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.radius-box {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  transition: transform 0.2s;
}

.radius-item:hover .radius-box {
  transform: scale(1.05);
}

.radius-info {
  text-align: center;
}

.radius-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111827;
}

.radius-value {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>
