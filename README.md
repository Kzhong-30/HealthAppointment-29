# 📚 Design System Docs Generator

一个基于 **Vue 3 + TypeScript + Vite** 的设计系统规范文档生成工具。配置核心设计令牌后自动生成完整的规范文档页面，支持多种导出格式，以及真正跨设备的多人实时协作。

---

## ✨ 核心特性

- 🎨 **可视化配置面板**：主色调 / 辅助色 / 中性色、字体家族、字号阶梯、行高、间距系统、圆角、阴影层级
- 📖 **规范文档自动生成**：色彩系统（色值 + 色板）、字体排版（标题/正文层级）、间距系统、圆角预览、阴影效果
- 📤 **一键导出**：
  - 📄 **PDF 文档** — 完整 A4 规格设计规范文档
  - 🎨 **CSS 变量文件** — `:root { --color-primary-500: ... }`
  - ⚡ **Tailwind 配置扩展** — `tailwind.config.extended.js`
  - 🎯 **Figma Tokens JSON** — Token Studio 兼容格式
- 👥 **多人实时协作**：基于 **Yjs CRDT**，支持两种协作模式，真正跨设备 / 跨浏览器同步
- 💾 **本地持久化**：所有配置自动保存至 `localStorage`，刷新不丢失
- 🔒 **完全类型安全**：零 `any`，严格的 TypeScript 类型定义

---

## 🚀 快速开始

### 环境要求

| 工具 | 最低版本 |
| --- | --- |
| Node.js | **≥ 18.0.0** |
| npm | **≥ 9.0.0** |

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 3. 生产构建
npm run build

# 4. 预览生产构建
npm run preview

# 5. 仅运行 TypeScript 类型检查
npm run typecheck
```

启动后浏览器访问 `http://localhost:5173` 即可使用。

---

## 👥 多人协作

本工具采用 **Yjs CRDT** 实现真正跨设备多人实时协作，提供两种网络模式：

| 模式 | 协议 | 适用场景 | 数据路径 | 标签 |
| --- | --- | --- | --- | --- |
| **WebRTC P2P** | 点对点 | 同一局域网 / 同一 Wi-Fi / 非严格 NAT | 浏览器↔浏览器（直连） | `P2P`（紫色标签） |
| **WebSocket 中转** | 客户端-服务器 | 严格 NAT / 企业内网 / 跨办公区 | 浏览器→服务器→浏览器（中转） | `WS`（青色标签） |

### 使用步骤（快速上手，默认 WebRTC + 公共信令）

1. 团队中任意一人点击顶栏的 **「开启协作」** 按钮
2. 其他成员使用**相同的 URL** 在各自设备上打开页面，同样点击 **「开启协作」**
3. 连接成功后，按钮会显示 **「协作已连接」**，右上角会出现协作者头像（我有蓝框 + 「你」徽标）
4. 此后任何成员对设计参数的修改都会**毫秒级同步**到所有人的界面

### 模式一：WebRTC P2P（推荐同网络）

**启动方式（默认即使用公共 signaling，无需任何额外服务）：**

```bash
npm run dev                # 公共 yjs.dev 信令，同 Wi-Fi 下稳定直连

# 或：使用本地自建 signaling server（推荐企业内部分发）
# 终端 1：启动本地 signaling（端口 4444）
npm run signaling
# 终端 2：使用本地 signaling 启动前端
npm run dev:webrtc
```

**技术细节：**
- 使用公共 signaling server（`wss://signaling.yjs.dev`）做 WebRTC 握手，数据直接 P2P 直连，**不经过任何中间服务器**
- 自建 signaling 时运行 `scripts/signaling-server.js`（约 30 行 Node.js，仅做房间内 WebSocket 消息转发，零持久化）
- 基于 CRDT 算法保证最终一致性，网络波动时离线编辑会在恢复后自动合并
- 协作者超时时间 3 分钟，心跳 30 秒

> 💡 **WebRTC NAT 提示**：如果成员处于不同运营商网络或企业严格 NAT，点对点连接可能失败。此时建议切换到 WebSocket 中转模式。

### 模式二：WebSocket 中转（推荐严格 NAT / 企业内网）

**启动方式（需一台内网可达的机器跑 y-websocket 服务）：**

```bash
# 终端 1：启动 WebSocket 服务器（端口 1234，全量同步 CRDT 数据）
npm run websocket-server

# 终端 2：使用 WebSocket 模式启动前端
npm run dev:ws
```

**部署到企业内网：**
- 将 `y-websocket` 服务部署到任意内网 Node 服务器，端口 1234
- 前端打包时传入环境变量：
  ```bash
  VITE_COLLAB_MODE=websocket \
  VITE_WEBSOCKET_URL=ws://your-internal-host:1234 \
  npm run build
  ```
- 所有成员访问部署好的前端站点，彼此通过内网 WebSocket 实时同步

### 两种模式的切换方式

- **开发期**：通过 `npm run dev` / `dev:ws` / `dev:webrtc` 三个脚本区分
- **生产期**：通过构建时注入 `VITE_COLLAB_MODE` 和对应的服务器 URL 环境变量
- **UI 反馈**：协作按钮旁会显示 `P2P` 或 `WS` 小标签，悬停可查看当前模式说明

---

## 🧩 目录结构

```
src/
├── types/index.ts                 # 所有 TypeScript 类型定义
├── utils/
│   ├── defaults.ts                # 设计系统默认配置（预设色板、字号等）
│   └── export.ts                  # 导出实现：PDF / CSS / Tailwind / Figma
├── composables/useDesignConfig.ts # 全局状态 store（provide/inject + 单例）
├── components/
│   ├── ConfigPanel.vue            # ⚙️ 左侧配置面板（defineModel + v-model）
│   ├── ColorSystem.vue            # 🎨 色彩系统展示
│   ├── TypographySystem.vue       # 🔤 字体排版展示
│   ├── SpacingSystem.vue          # 📐 间距 / 圆角展示
│   ├── ShadowSystem.vue           # 🌑 阴影层级展示
│   └── CollaborationBar.vue       # 👥 顶栏协作状态（区分我 / 其他人）
├── styles/global.css              # 全局样式
├── App.vue                        # 应用主入口
└── main.ts                        # Vue 挂载入口
```

---

## 🛠 技术栈

| 模块 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | **Vue 3.4 + `<script setup>`** | Composition API，响应式 reactive/ref |
| 语言 | **TypeScript 5.4** | 零 `any`，完全类型安全 |
| 构建 | **Vite 5** | HMR 秒级热更新 |
| 协作 | **Yjs 13 + y-webrtc 10** | CRDT + P2P WebRTC，真正跨设备同步 |
| 导出 | **jsPDF 2 + html2canvas 1** | DOM → Canvas → PDF 多页分页 |
| 存储 | `localStorage` + 300ms debounce | 防止高频写入 |

---

## 📝 开发说明

### 状态管理

- 采用 **`provideDesignStore()` + `useScopedDesignConfig()`** 模式，单例 + 引用计数
- 状态仅在应用首次启动时从 `localStorage` 读取一次，避免多组件挂载时互相覆盖
- 所有写入操作走 `updateXxx` 细粒度方法，内部通过 `watch(deep: true)` 统一触发保存和协作同步
- 热更新或组件卸载时，定时器 / Yjs 资源 / watcher 会被完整清理，无内存泄漏

### v-model 约定

- `App.vue` → `ConfigPanel.vue` 使用 `v-model:config`
- `ConfigPanel.vue` 内部通过 `defineModel<DesignSystemConfig>('config', { required: true })` 接收
- 实际更新统一调用 `store.updateXxx()` 细粒度方法，性能优于整对象 emit

### 协作头像语义

- **「我」**：头像有蓝色边框 + 蓝色「你」徽标，始终在最左侧、`z-index` 最高
- **「其他人」**：普通头像，略微半透明，按照加入顺序排布
- 计数显示「N 人在线」，包含我本人

---

## ⚖️ License

MIT
