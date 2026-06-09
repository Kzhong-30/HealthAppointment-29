<script setup lang="ts">
import type { DesignSystemConfig, ColorSwatch, ShadowLevel, FontSize, LineHeight } from '../types'
import { useDesignConfig } from '../composables/useDesignConfig'

const model = defineModel<DesignSystemConfig>('config', { required: true })
const emitReset = defineEmits<{
  (e: 'reset'): void
}>()

const store = useDesignConfig()

type BasicField = 'name' | 'version'
type ColorCategory = 'primary' | 'secondary' | 'neutral'
type FontSizeField = 'name' | 'value'
type LineHeightField = 'name' | 'value'
type ShadowField = 'name' | 'value'

function onBasicInput(field: BasicField, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateBasic(field, el.value)
}

function onColorValueInput(category: ColorCategory, index: number, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateColorCategory(category, index, el.value)
}

function onAddColor(category: ColorCategory): void {
  store.addColorSwatch(category)
}

function onRemoveColor(category: ColorCategory, index: number): void {
  store.removeColorSwatch(category, index)
}

function onFontFamilyInput(ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateFontFamily(el.value)
}

function onFontSizeInput(index: number, field: FontSizeField, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateFontSize(index, field, el.value)
}

function onLineHeightInput(index: number, field: LineHeightField, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateLineHeight(index, field, el.value)
}

function onSpacingInput(key: string, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateSpacing(key, el.value)
}

function onAddSpacing(): void {
  store.addSpacing()
}

function onRemoveSpacing(key: string): void {
  store.removeSpacing(key)
}

function onBorderRadiusInput(key: string, ev: Event): void {
  const el = ev.target as HTMLInputElement
  store.updateBorderRadius(key, el.value)
}

function onShadowInput(index: number, field: ShadowField, ev: Event): void {
  const target = ev.target as HTMLTextAreaElement | HTMLInputElement
  store.updateShadow(index, field, target.value)
}

function onAddShadow(): void {
  store.addShadow()
}

function onRemoveShadow(index: number): void {
  store.removeShadow(index)
}

function onResetClick(): void {
  emitReset('reset')
}

const primarySwatches = model.value.colors.primary as ColorSwatch[]
const secondarySwatches = model.value.colors.secondary as ColorSwatch[]
const neutralSwatches = model.value.colors.neutral as ColorSwatch[]
const fontSizes = model.value.typography.fontSizes as FontSize[]
const lineHeights = model.value.typography.lineHeights as LineHeight[]
const shadowLevels = model.value.shadows.levels as ShadowLevel[]
</script>

<template>
  <div class="config-panel">
    <div class="panel-header">
      <h2>⚙️ 配置面板</h2>
      <button class="btn-reset" @click="onResetClick">重置默认</button>
    </div>

    <section class="section">
      <h3>基本信息</h3>
      <div class="form-row">
        <label>系统名称</label>
        <input type="text" :value="model.name" @input="onBasicInput('name', $event)" />
      </div>
      <div class="form-row">
        <label>版本号</label>
        <input type="text" :value="model.version" @input="onBasicInput('version', $event)" />
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>🎨 主色调 Primary</h3>
        <button class="btn-add" @click="onAddColor('primary')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div
          v-for="(color, idx) in primarySwatches"
          :key="'p-' + idx"
          class="color-item"
        >
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input
              type="color"
              :value="color.value"
              @input="onColorValueInput('primary', idx, $event)"
            />
            <input
              type="text"
              :value="color.value"
              class="hex-input"
              @input="onColorValueInput('primary', idx, $event)"
            />
          </div>
          <button class="btn-remove" @click="onRemoveColor('primary', idx)" title="删除">×</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>💜 辅助色 Secondary</h3>
        <button class="btn-add" @click="onAddColor('secondary')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div
          v-for="(color, idx) in secondarySwatches"
          :key="'s-' + idx"
          class="color-item"
        >
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input
              type="color"
              :value="color.value"
              @input="onColorValueInput('secondary', idx, $event)"
            />
            <input
              type="text"
              :value="color.value"
              class="hex-input"
              @input="onColorValueInput('secondary', idx, $event)"
            />
          </div>
          <button
            class="btn-remove"
            @click="onRemoveColor('secondary', idx)"
            title="删除"
          >×</button>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>⬛ 中性色 Neutral</h3>
        <button class="btn-add" @click="onAddColor('neutral')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div
          v-for="(color, idx) in neutralSwatches"
          :key="'n-' + idx"
          class="color-item"
        >
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input
              type="color"
              :value="color.value"
              @input="onColorValueInput('neutral', idx, $event)"
            />
            <input
              type="text"
              :value="color.value"
              class="hex-input"
              @input="onColorValueInput('neutral', idx, $event)"
            />
          </div>
          <button class="btn-remove" @click="onRemoveColor('neutral', idx)" title="删除">×</button>
        </div>
      </div>
    </section>

    <section class="section">
      <h3>🔤 字体排版</h3>
      <div class="form-row">
        <label>字体家族</label>
        <input
          type="text"
          :value="model.typography.fontFamily"
          @input="onFontFamilyInput($event)"
        />
      </div>
      <h4 class="sub-title">字号阶梯</h4>
      <div class="list-editor">
        <div v-for="(fs, idx) in fontSizes" :key="'fs-' + idx" class="list-row">
          <input
            type="text"
            :value="fs.name"
            placeholder="名称"
            @input="onFontSizeInput(Number(idx), 'name', $event)"
          />
          <input
            type="text"
            :value="fs.value"
            placeholder="值 (如 16px)"
            @input="onFontSizeInput(Number(idx), 'value', $event)"
          />
        </div>
      </div>
      <h4 class="sub-title">行高</h4>
      <div class="list-editor">
        <div v-for="(lh, idx) in lineHeights" :key="'lh-' + idx" class="list-row">
          <input
            type="text"
            :value="lh.name"
            placeholder="名称"
            @input="onLineHeightInput(Number(idx), 'name', $event)"
          />
          <input
            type="number"
            step="0.1"
            :value="lh.value"
            placeholder="行高值"
            @input="onLineHeightInput(Number(idx), 'value', $event)"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>📐 间距系统</h3>
        <button class="btn-add" @click="onAddSpacing">+ 添加</button>
      </div>
      <div class="list-editor">
        <div v-for="(value, key) in model.spacing" :key="'sp-' + String(key)" class="list-row">
          <input type="text" :value="key" readonly class="name-input" />
          <input
            type="text"
            :value="value"
            placeholder="值 (如 16px)"
            @input="onSpacingInput(String(key), $event)"
          />
          <button class="btn-remove" @click="onRemoveSpacing(String(key))">×</button>
        </div>
      </div>
    </section>

    <section class="section">
      <h3>⭕ 圆角 Border Radius</h3>
      <div class="list-editor">
        <div v-for="(value, key) in model.borderRadius" :key="'br-' + String(key)" class="list-row">
          <input type="text" :value="key" readonly class="name-input" />
          <input
            type="text"
            :value="value"
            placeholder="值 (如 4px)"
            @input="onBorderRadiusInput(String(key), $event)"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h3>🌑 阴影层级</h3>
        <button class="btn-add" @click="onAddShadow">+ 添加</button>
      </div>
      <div class="shadow-editor">
        <div v-for="(shadow, idx) in shadowLevels" :key="'sh-' + idx" class="shadow-row">
          <input
            type="text"
            :value="shadow.name"
            placeholder="名称"
            class="name-input-wide"
            @input="onShadowInput(Number(idx), 'name', $event)"
          />
          <textarea
            :value="shadow.value"
            rows="2"
            placeholder="CSS box-shadow 值"
            @input="onShadowInput(Number(idx), 'value', $event)"
          ></textarea>
          <button class="btn-remove" @click="onRemoveShadow(Number(idx))">×</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.config-panel {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.btn-reset {
  padding: 6px 14px;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #ef4444;
  color: white;
}

.section {
  margin-bottom: 28px;
  padding: 16px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.section h3 {
  margin: 0 0 14px 0;
  font-size: 1rem;
  color: #334155;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
}

.sub-title {
  margin: 16px 0 10px 0;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
}

.btn-add {
  padding: 4px 12px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background 0.2s;
}

.btn-add:hover {
  background: #2563eb;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: #dc2626;
  color: white;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-row label {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 500;
}

.form-row input,
.list-row input,
.list-row textarea,
.shadow-row input,
.shadow-row textarea {
  padding: 7px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-row input:focus,
.list-row input:focus,
.list-row textarea:focus,
.shadow-row input:focus,
.shadow-row textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.color-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}

.color-preview {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.color-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.color-inputs input[type='color'] {
  width: 32px;
  height: 32px;
  padding: 2px;
  cursor: pointer;
}

.name-input {
  width: 50px;
  background: #e2e8f0;
  text-align: center;
  font-size: 0.8rem !important;
  font-weight: 600;
}

.name-input-wide {
  width: 90px !important;
  background: #e2e8f0;
  text-align: center;
  font-size: 0.8rem !important;
  font-weight: 600;
}

.hex-input {
  flex: 1;
  min-width: 0;
  font-family: 'Monaco', 'Menlo', monospace !important;
  font-size: 0.8rem !important;
}

.list-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-row input:not(.name-input) {
  flex: 1;
}

.shadow-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shadow-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.shadow-row textarea {
  flex: 1;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', monospace !important;
  font-size: 0.75rem !important;
}
</style>
