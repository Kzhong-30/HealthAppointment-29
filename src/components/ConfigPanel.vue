<script setup lang="ts">import { computed } from 'vue';
import type { ColorSwatch, ShadowLevel } from '../types';
const props = defineProps<{
 config: any;
}>();
const emit = defineEmits<{
 (e: 'update:config', value: any): void;
 (e: 'reset'): void;
}>();
const localConfig = computed({
 get: () => props.config,
 set: (val) => emit('update:config', val)
});
function updateBasic(field: 'name' | 'version', value: string) {
 emit('update:config', { ...props.config, [field]: value });
}
function updateColorCategory(category: 'primary' | 'secondary' | 'neutral', index: number, value: string) {
 const newColors = { ...props.config.colors };
 newColors[category] = [...newColors[category]];
 newColors[category][index] = { ...newColors[category][index], value };
 emit('update:config', { ...props.config, colors: newColors });
}
function addColor(category: 'primary' | 'secondary' | 'neutral') {
 const newColors = { ...props.config.colors };
 const existing = newColors[category];
 const newName = existing.length > 0
 ? String((parseInt(existing[existing.length - 1].name) || 0) + 100)
 : '50';
 existing.push({ name: newName, value: '#cccccc' });
 newColors[category] = [...existing];
 emit('update:config', { ...props.config, colors: newColors });
}
function removeColor(category: 'primary' | 'secondary' | 'neutral', index: number) {
 const newColors = { ...props.config.colors };
 newColors[category] = newColors[category].filter((_: ColorSwatch, i: number) => i !== index);
 emit('update:config', { ...props.config, colors: newColors });
}
function updateFontFamily(value: string) {
 emit('update:config', {
 ...props.config,
 typography: { ...props.config.typography, fontFamily: value }
 });
}
function updateFontSize(index: number, field: 'name' | 'value', value: string) {
 const newTypo = { ...props.config.typography };
 newTypo.fontSizes = [...newTypo.fontSizes];
 newTypo.fontSizes[index] = { ...newTypo.fontSizes[index], [field]: value };
 emit('update:config', { ...props.config, typography: newTypo });
}
function updateLineHeight(index: number, field: 'name' | 'value', value: string | number) {
 const newTypo = { ...props.config.typography };
 newTypo.lineHeights = [...newTypo.lineHeights];
 const val = field === 'value' ? parseFloat(value as string) : value;
 newTypo.lineHeights[index] = { ...newTypo.lineHeights[index], [field]: val };
 emit('update:config', { ...props.config, typography: newTypo });
}
function updateSpacing(key: string, value: string) {
 const newSpacing = { ...props.config.spacing, [key]: value };
 emit('update:config', { ...props.config, spacing: newSpacing });
}
function addSpacing() {
 const newSpacing = { ...props.config.spacing };
 const newKey = String(Object.keys(newSpacing).length + 1);
 newSpacing[newKey] = '0px';
 emit('update:config', { ...props.config, spacing: newSpacing });
}
function removeSpacing(key: string) {
 const newSpacing = { ...props.config.spacing };
 delete newSpacing[key];
 emit('update:config', { ...props.config, spacing: newSpacing });
}
function updateBorderRadius(key: string, value: string) {
 const newRadius = { ...props.config.borderRadius, [key]: value };
 emit('update:config', { ...props.config, borderRadius: newRadius });
}
function updateShadow(index: number, field: 'name' | 'value', value: string) {
 const newShadows = { levels: [...props.config.shadows.levels] };
 newShadows.levels[index] = { ...newShadows.levels[index], [field]: value };
 emit('update:config', { ...props.config, shadows: newShadows });
}
function addShadow() {
 const newShadows = { levels: [...props.config.shadows.levels] };
 newShadows.levels.push({ name: 'new-level', value: '0 0 0 rgba(0,0,0,0)' });
 emit('update:config', { ...props.config, shadows: newShadows });
}
function removeShadow(index: number) {
 const newShadows = {
 levels: props.config.shadows.levels.filter((_: ShadowLevel, i: number) => i !== index)
 };
 emit('update:config', { ...props.config, shadows: newShadows });
}
</script>

<template>
  <div class="config-panel">
    <div class="panel-header">
      <h2>⚙️ 配置面板</h2>
      <button class="btn-reset" @click="emit('reset')">重置默认</button>
    </div>

    <div class="section">
      <h3>基本信息</h3>
      <div class="form-row">
        <label>系统名称</label>
        <input type="text" :value="localConfig.name" @input="updateBasic('name', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="form-row">
        <label>版本号</label>
        <input type="text" :value="localConfig.version" @input="updateBasic('version', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>🎨 主色调 Primary</h3>
        <button class="btn-add" @click="addColor('primary')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div v-for="(color, idx) in localConfig.colors.primary" :key="'p-'+idx" class="color-item">
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input type="color" :value="color.value" @input="updateColorCategory('primary', idx, ($event.target as HTMLInputElement).value)" />
            <input type="text" :value="color.value" class="hex-input" @input="updateColorCategory('primary', idx, ($event.target as HTMLInputElement).value)" />
          </div>
          <button class="btn-remove" @click="removeColor('primary', idx)" title="删除">×</button>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>💜 辅助色 Secondary</h3>
        <button class="btn-add" @click="addColor('secondary')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div v-for="(color, idx) in localConfig.colors.secondary" :key="'s-'+idx" class="color-item">
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input type="color" :value="color.value" @input="updateColorCategory('secondary', idx, ($event.target as HTMLInputElement).value)" />
            <input type="text" :value="color.value" class="hex-input" @input="updateColorCategory('secondary', idx, ($event.target as HTMLInputElement).value)" />
          </div>
          <button class="btn-remove" @click="removeColor('secondary', idx)" title="删除">×</button>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>⬛ 中性色 Neutral</h3>
        <button class="btn-add" @click="addColor('neutral')">+ 添加</button>
      </div>
      <div class="color-grid">
        <div v-for="(color, idx) in localConfig.colors.neutral" :key="'n-'+idx" class="color-item">
          <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
          <div class="color-inputs">
            <input type="text" :value="color.name" readonly class="name-input" />
            <input type="color" :value="color.value" @input="updateColorCategory('neutral', idx, ($event.target as HTMLInputElement).value)" />
            <input type="text" :value="color.value" class="hex-input" @input="updateColorCategory('neutral', idx, ($event.target as HTMLInputElement).value)" />
          </div>
          <button class="btn-remove" @click="removeColor('neutral', idx)" title="删除">×</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>🔤 字体排版</h3>
      <div class="form-row">
        <label>字体家族</label>
        <input type="text" :value="localConfig.typography.fontFamily" @input="updateFontFamily(($event.target as HTMLInputElement).value)" />
      </div>
      <h4 class="sub-title">字号阶梯</h4>
      <div class="list-editor">
        <div v-for="(fs, idx) in localConfig.typography.fontSizes" :key="'fs-'+idx" class="list-row">
          <input type="text" :value="fs.name" placeholder="名称" @input="updateFontSize(idx, 'name', ($event.target as HTMLInputElement).value)" />
          <input type="text" :value="fs.value" placeholder="值 (如 16px)" @input="updateFontSize(idx, 'value', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
      <h4 class="sub-title">行高</h4>
      <div class="list-editor">
        <div v-for="(lh, idx) in localConfig.typography.lineHeights" :key="'lh-'+idx" class="list-row">
          <input type="text" :value="lh.name" placeholder="名称" @input="updateLineHeight(idx, 'name', ($event.target as HTMLInputElement).value)" />
          <input type="number" step="0.1" :value="lh.value" placeholder="行高值" @input="updateLineHeight(idx, 'value', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>📐 间距系统</h3>
        <button class="btn-add" @click="addSpacing">+ 添加</button>
      </div>
      <div class="list-editor">
        <div v-for="(value, key) in localConfig.spacing" :key="'sp-'+String(key)" class="list-row">
          <input type="text" :value="key" readonly class="name-input" />
          <input type="text" :value="value" placeholder="值 (如 16px)" @input="updateSpacing(String(key), ($event.target as HTMLInputElement).value)" />
          <button class="btn-remove" @click="removeSpacing(String(key))">×</button>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>⭕ 圆角 Border Radius</h3>
      <div class="list-editor">
        <div v-for="(value, key) in localConfig.borderRadius" :key="'br-'+String(key)" class="list-row">
          <input type="text" :value="key" readonly class="name-input" />
          <input type="text" :value="value" placeholder="值 (如 4px)" @input="updateBorderRadius(String(key), ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h3>🌑 阴影层级</h3>
        <button class="btn-add" @click="addShadow">+ 添加</button>
      </div>
      <div class="shadow-editor">
        <div v-for="(shadow, idx) in localConfig.shadows.levels" :key="'sh-'+idx" class="shadow-row">
          <input type="text" :value="shadow.name" placeholder="名称" class="name-input-wide" @input="updateShadow(idx, 'name', ($event.target as HTMLInputElement).value)" />
          <textarea :value="shadow.value" rows="2" placeholder="CSS box-shadow 值" @input="updateShadow(idx, 'value', ($event.target as HTMLTextAreaElement).value)"></textarea>
          <button class="btn-remove" @click="removeShadow(idx)">×</button>
        </div>
      </div>
    </div>
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

.color-inputs input[type="color"] {
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
