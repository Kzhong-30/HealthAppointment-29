<script setup lang="ts">
import type { ShadowLevel } from '../types'

defineProps<{
  levels: ShadowLevel[]
}>()
</script>

<template>
  <section class="doc-section">
    <div class="section-header">
      <h2 class="section-title">阴影层级 Elevation</h2>
      <div class="section-subtitle">从扁平到深度的视觉层次系统</div>
    </div>

    <div class="shadow-grid">
      <div
        v-for="shadow in levels"
        :key="shadow.name"
        class="shadow-card"
      >
        <div
          class="shadow-box"
          :style="{ boxShadow: shadow.value }"
        >
          <div class="shadow-preview-label">{{ shadow.name }}</div>
        </div>
        <div class="shadow-info">
          <div class="shadow-name">{{ shadow.name }}</div>
          <code class="shadow-value">{{ shadow.value }}</code>
        </div>
      </div>
    </div>

    <div class="practical-demo" style="margin-top: 48px;">
      <h3 class="demo-title">实际应用示例 Practical Examples</h3>
      <div class="demo-grid">
        <div class="demo-item" v-for="(shadow, idx) in levels.slice(0, 4)" :key="'demo-'+idx">
          <div class="demo-card" :style="{ boxShadow: shadow.value }">
            <div class="demo-card-header"></div>
            <div class="demo-card-body">
              <div class="demo-line short"></div>
              <div class="demo-line long"></div>
              <div class="demo-line medium"></div>
            </div>
          </div>
          <div class="demo-label">{{ shadow.name }}</div>
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

.shadow-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 32px;
  padding: 24px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
}

.shadow-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.shadow-box {
  width: 100%;
  height: 140px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
}

.shadow-card:hover .shadow-box {
  transform: translateY(-4px);
}

.shadow-preview-label {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.shadow-info {
  width: 100%;
  padding: 0 8px;
}

.shadow-name {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 4px;
}

.shadow-value {
  display: block;
  font-size: 0.7rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f3f4f6;
  padding: 8px 10px;
  border-radius: 6px;
  word-break: break-all;
  line-height: 1.5;
}

.practical-demo {
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.demo-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 24px 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.demo-card {
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}

.demo-item:hover .demo-card {
  transform: translateY(-2px);
}

.demo-card-header {
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.demo-card-body {
  padding: 16px;
}

.demo-line {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
}

.demo-line.short {
  width: 40%;
}

.demo-line.long {
  width: 100%;
}

.demo-line.medium {
  width: 70%;
  margin-bottom: 0;
}

.demo-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
}
</style>
