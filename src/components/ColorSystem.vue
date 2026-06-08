<script setup lang="ts">
import type { ColorSwatch } from '../types'

defineProps<{
  title: string
  categoryName: string
  colors: ColorSwatch[]
  colorClass: string
}>()
</script>

<template>
  <section class="doc-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-subtitle">{{ categoryName }} 色板，共 {{ colors.length }} 个色阶</div>
    </div>
    
    <div class="palette-grid">
      <div
        v-for="color in colors"
        :key="color.name"
        class="color-card"
      >
        <div
          class="color-swatch"
          :class="colorClass"
          :style="{ backgroundColor: color.value }"
        >
          <span class="color-name">{{ categoryName }}-{{ color.name }}</span>
        </div>
        <div class="color-info">
          <div class="color-hex">{{ color.value.toUpperCase() }}</div>
          <div class="color-label">{{ categoryName }}-{{ color.name }}</div>
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

.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.color-card {
  border-radius: 10px;
  overflow: hidden;
  background: white;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.color-swatch {
  height: 100px;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  position: relative;
}

.color-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.color-swatch.light .color-name {
  color: rgba(0, 0, 0, 0.7);
  text-shadow: none;
}

.color-info {
  padding: 12px;
}

.color-hex {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.color-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}
</style>
