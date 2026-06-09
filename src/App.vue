<script setup lang="ts">
import { computed, ref } from 'vue'
import { useScopedDesignConfig } from './composables/useDesignConfig'
import type { ExportFormat } from './types'
import ConfigPanel from './components/ConfigPanel.vue'
import ColorSystem from './components/ColorSystem.vue'
import TypographySystem from './components/TypographySystem.vue'
import SpacingSystem from './components/SpacingSystem.vue'
import ShadowSystem from './components/ShadowSystem.vue'
import CollaborationBar from './components/CollaborationBar.vue'
import {
  exportCSSVariables,
  exportTailwindConfig,
  exportFigmaTokens,
  exportPDF
} from './utils/export'

const store = useScopedDesignConfig()

const {
  config,
  me,
  otherCollaborators,
  collaborators,
  isCollaborationEnabled,
  isConnected,
  collabMode,
  resetConfig,
  initCollaboration
} = store

const isExporting = ref(false)
const activeSection = ref('all')
const showSidebar = ref(true)

const sections: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'colors', label: '色彩系统' },
  { id: 'typography', label: '字体排版' },
  { id: 'spacing', label: '间距系统' },
  { id: 'shadows', label: '阴影层级' }
]

function handleToggleCollaboration(): void {
  if (!isCollaborationEnabled.value) {
    initCollaboration()
  }
}

function handleExport(format: ExportFormat): void {
  isExporting.value = true
  try {
    switch (format) {
      case 'css':
        exportCSSVariables(config)
        break
      case 'tailwind':
        exportTailwindConfig(config)
        break
      case 'figma':
        exportFigmaTokens(config)
        break
      case 'pdf':
        void exportPDF('doc-content', `${config.name}-design-system.pdf`)
        break
    }
  } catch (err) {
    console.error('Export failed:', err)
  } finally {
    window.setTimeout(() => {
      isExporting.value = false
    }, 500)
  }
}

const totalOnlineCount = computed(() => collaborators.value.length)

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<template>
  <div class="app-layout">
    <aside v-if="showSidebar" class="sidebar">
      <ConfigPanel v-model:config="config" @reset="resetConfig" />
    </aside>

    <main class="main-content">
      <header class="app-header">
        <div class="header-left">
          <button class="sidebar-toggle" @click="showSidebar = !showSidebar">
            {{ showSidebar ? '◀' : '▶' }}
          </button>
          <div>
            <h1 class="app-title">📚 {{ config.name }}</h1>
            <div class="app-meta">
              <span>v{{ config.version }}</span>
              <span class="dot">·</span>
              <span>{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <div class="header-right">
          <CollaborationBar
            :me="me"
            :others="otherCollaborators"
            :total-count="totalOnlineCount"
            :is-enabled="isCollaborationEnabled"
            :is-connected="isConnected"
            :collab-mode="collabMode"
            @toggle="handleToggleCollaboration"
          />

          <div class="export-group">
            <button
              class="export-btn primary"
              :disabled="isExporting"
              @click="handleExport('pdf')"
            >
              📄 导出 PDF
            </button>
            <div class="export-dropdown">
              <button class="export-btn" :disabled="isExporting">
                更多导出 ▼
              </button>
              <div class="dropdown-menu">
                <button @click="handleExport('css')">
                  <span class="export-icon">🎨</span>
                  <span>CSS 变量文件</span>
                </button>
                <button @click="handleExport('tailwind')">
                  <span class="export-icon">⚡</span>
                  <span>Tailwind 配置</span>
                </button>
                <button @click="handleExport('figma')">
                  <span class="export-icon">🎯</span>
                  <span>Figma Tokens JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav class="section-nav">
        <button
          v-for="section in sections"
          :key="section.id"
          class="nav-btn"
          :class="{ active: activeSection === section.id }"
          @click="activeSection = section.id"
        >
          {{ section.label }}
        </button>
      </nav>

      <div class="doc-container">
        <div id="doc-content" class="doc-content">
          <header class="doc-header" v-if="activeSection === 'all'">
            <div class="doc-header-inner">
              <h1 class="doc-title">{{ config.name }}</h1>
              <p class="doc-subtitle">Design System Specification</p>
              <div class="doc-version">Version {{ config.version }} · {{ formattedDate }}</div>
              <div class="doc-divider"></div>
              <p class="doc-description">
                本规范文档定义了设计系统的核心基础元素，包括色彩系统、字体排版、
                间距规则、圆角和阴影层级。所有组件和页面的设计都应遵循本规范。
              </p>
            </div>
          </header>

          <ColorSystem
            v-if="activeSection === 'all' || activeSection === 'colors'"
            title="主色调 Primary Colors"
            category-name="primary"
            :colors="config.colors.primary"
            color-class="primary"
          />

          <ColorSystem
            v-if="activeSection === 'all' || activeSection === 'colors'"
            title="辅助色 Secondary Colors"
            category-name="secondary"
            :colors="config.colors.secondary"
            color-class="secondary"
          />

          <ColorSystem
            v-if="activeSection === 'all' || activeSection === 'colors'"
            title="中性色 Neutral Colors"
            category-name="neutral"
            :colors="config.colors.neutral"
            color-class="neutral"
          />

          <TypographySystem
            v-if="activeSection === 'all' || activeSection === 'typography'"
            :font-family="config.typography.fontFamily"
            :font-sizes="config.typography.fontSizes"
            :line-heights="config.typography.lineHeights"
          />

          <SpacingSystem
            v-if="activeSection === 'all' || activeSection === 'spacing'"
            :spacing="config.spacing"
            :border-radius="config.borderRadius"
          />

          <ShadowSystem
            v-if="activeSection === 'all' || activeSection === 'shadows'"
            :levels="config.shadows.levels"
          />

          <footer class="doc-footer" v-if="activeSection === 'all'">
            <div class="footer-divider"></div>
            <p>© {{ new Date().getFullYear() }} {{ config.name }}. Generated by Design System Docs Generator.</p>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 380px;
  min-width: 380px;
  height: 100%;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f8fafc;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.sidebar-toggle {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  cursor: pointer;
}

.sidebar-toggle:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.app-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 2px;
}

.dot {
  color: #cbd5e1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.export-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.export-btn {
  padding: 9px 18px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #334155;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  cursor: pointer;
}

.export-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-color: transparent;
}

.export-btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.export-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all 0.2s;
  min-width: 200px;
  z-index: 100;
}

.export-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 6px;
  text-align: left;
  font-size: 0.85rem;
  color: #334155;
  transition: background 0.15s;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #f1f5f9;
}

.export-icon {
  font-size: 1rem;
}

.section-nav {
  display: flex;
  gap: 4px;
  padding: 12px 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.nav-btn {
  padding: 8px 18px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;
  cursor: pointer;
}

.nav-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.nav-btn.active {
  background: #eff6ff;
  color: #2563eb;
}

.doc-container {
  flex: 1;
  overflow-y: auto;
  padding: 40px 24px;
  display: flex;
  justify-content: center;
}

.doc-content {
  width: 100%;
  max-width: 960px;
  background: white;
  border-radius: 16px;
  padding: 56px 64px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.04);
}

.doc-header {
  margin-bottom: 48px;
  text-align: center;
}

.doc-header-inner {
  max-width: 600px;
  margin: 0 auto;
}

.doc-title {
  font-size: 2.75rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.doc-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 12px 0;
}

.doc-version {
  display: inline-block;
  padding: 4px 14px;
  background: #f1f5f9;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #475569;
  font-weight: 500;
}

.doc-divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  margin: 24px auto;
}

.doc-description {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #64748b;
  margin: 0;
}

.doc-footer {
  margin-top: 64px;
  text-align: center;
}

.footer-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 24px;
}

.doc-footer p {
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>
