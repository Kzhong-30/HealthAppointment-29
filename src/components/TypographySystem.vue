<script setup lang="ts">
import type { FontSize, LineHeight } from '../types'

const props = defineProps<{
  fontFamily: string
  fontSizes: FontSize[]
  lineHeights: LineHeight[]
}>()

const headingConfig = [
  { level: 'H1', fs: '6xl', lh: 'tight', weight: 700, sample: '一级标题 Heading 1' },
  { level: 'H2', fs: '5xl', lh: 'tight', weight: 700, sample: '二级标题 Heading 2' },
  { level: 'H3', fs: '4xl', lh: 'tight', weight: 600, sample: '三级标题 Heading 3' },
  { level: 'H4', fs: '3xl', lh: 'normal', weight: 600, sample: '四级标题 Heading 4' },
  { level: 'H5', fs: '2xl', lh: 'normal', weight: 600, sample: '五级标题 Heading 5' },
  { level: 'H6', fs: 'xl', lh: 'normal', weight: 600, sample: '六级标题 Heading 6' }
]

const bodyConfig = [
  { name: 'Large Body', fs: 'lg', lh: 'relaxed', sample: '这是大字号正文内容。The quick brown fox jumps over the lazy dog.' },
  { name: 'Body', fs: 'base', lh: 'normal', sample: '这是标准正文内容。The quick brown fox jumps over the lazy dog.' },
  { name: 'Small Body', fs: 'sm', lh: 'normal', sample: '这是小字号正文内容。The quick brown fox jumps over the lazy dog.' },
  { name: 'Caption', fs: 'xs', lh: 'tight', sample: '这是说明文字内容。The quick brown fox jumps over the lazy dog.' }
]

function getFontSize(name: string): string {
  return props.fontSizes.find(f => f.name === name)?.value || '16px'
}

function getLineHeight(name: string): number {
  return props.lineHeights.find(l => l.name === name)?.value || 1.5
}
</script>

<template>
  <section class="doc-section">
    <div class="section-header">
      <h2 class="section-title">字体排版 Typography</h2>
      <div class="section-subtitle">
        字体家族: <code class="font-family-code">{{ fontFamily }}</code>
      </div>
    </div>

    <div class="sub-section">
      <h3 class="sub-title">标题层级 Headings</h3>
      <div class="typography-list">
        <div v-for="heading in headingConfig" :key="heading.level" class="typography-item">
          <div class="type-meta">
            <span class="type-label">{{ heading.level }}</span>
            <span class="type-spec">{{ heading.fs }} / {{ heading.lh }} / {{ heading.weight }}</span>
          </div>
          <div
            class="type-sample heading"
            :style="{
              fontFamily: fontFamily,
              fontSize: getFontSize(heading.fs),
              lineHeight: getLineHeight(heading.lh),
              fontWeight: heading.weight
            }"
          >
            {{ heading.sample }}
          </div>
        </div>
      </div>
    </div>

    <div class="sub-section">
      <h3 class="sub-title">正文层级 Body Text</h3>
      <div class="typography-list">
        <div v-for="body in bodyConfig" :key="body.name" class="typography-item">
          <div class="type-meta">
            <span class="type-label">{{ body.name }}</span>
            <span class="type-spec">{{ body.fs }} / {{ body.lh }}</span>
          </div>
          <div
            class="type-sample body"
            :style="{
              fontFamily: fontFamily,
              fontSize: getFontSize(body.fs),
              lineHeight: getLineHeight(body.lh)
            }"
          >
            {{ body.sample }}
          </div>
        </div>
      </div>
    </div>

    <div class="sub-section">
      <h3 class="sub-title">字号阶梯 Font Size Scale</h3>
      <div class="size-scale-grid">
        <div v-for="fs in fontSizes" :key="fs.name" class="size-scale-item">
          <div
            class="size-sample"
            :style="{ fontSize: fs.value, fontFamily: fontFamily }"
          >
            Aa
          </div>
          <div class="size-info">
            <div class="size-name">{{ fs.name }}</div>
            <div class="size-value">{{ fs.value }}</div>
          </div>
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

.font-family-code {
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Menlo', monospace;
}

.sub-section {
  margin-bottom: 36px;
}

.sub-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.typography-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.typography-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.type-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-label {
  display: inline-block;
  padding: 4px 10px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 90px;
  text-align: center;
}

.type-spec {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
}

.type-sample {
  color: #111827;
  word-break: break-word;
}

.type-sample.heading {
  color: #0f172a;
}

.size-scale-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.size-scale-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: #fafafa;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.size-scale-item:hover {
  transform: scale(1.02);
}

.size-sample {
  font-weight: 700;
  color: #111827;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-info {
  text-align: center;
  margin-top: 8px;
}

.size-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #111827;
}

.size-value {
  font-size: 0.8rem;
  color: #6b7280;
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>
