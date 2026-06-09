import type { App, InjectionKey } from 'vue'
import {
  ref,
  reactive,
  watch,
  provide,
  inject,
  readonly as readonlyWrapper,
  onUnmounted
} from 'vue'
import * as Y from 'yjs'
import type { YEvent } from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider } from 'y-websocket'
import type {
  DesignSystemConfig,
  ColorSystem,
  ColorSwatch,
  TypographySystem,
  SpacingSystem,
  BorderRadiusSystem,
  ShadowSystem,
  Collaborator
} from '../types'
import { defaultConfig, collaboratorColors, collaboratorNames } from '../utils/defaults'

type CollabMode = 'webrtc' | 'websocket'

const STORAGE_KEY = 'design-system-config'
const USER_ID_KEY = 'design-system-user-id'
const ROOM_NAME = 'design-system-collab-room-v1'
const PUBLIC_SIGNALING = [
  'wss://signaling.yjs.dev',
  'wss://y-webrtc-signaling-eu.herokuapp.com'
]

type CollabEnvKey = 'VITE_COLLAB_MODE' | 'VITE_WEBSOCKET_URL' | 'VITE_SIGNALING_URLS'

interface CollabEnvResult {
  VITE_COLLAB_MODE: unknown
  VITE_WEBSOCKET_URL: unknown
  VITE_SIGNALING_URLS: unknown
}

function readEnvValue<K extends CollabEnvKey>(
  key: K,
  env: ImportMetaEnv
): CollabEnvResult[K] | undefined {
  const record: Record<string, unknown> = env
  const value = record[key]
  if (value === undefined || value === null) return undefined
  return value
}

function readEnvString<K extends CollabEnvKey>(key: K, env: ImportMetaEnv): string | undefined {
  const raw = readEnvValue(key, env)
  return typeof raw === 'string' ? raw : undefined
}

const rawMode = readEnvValue('VITE_COLLAB_MODE', import.meta.env)
const COLLAB_MODE: CollabMode = rawMode === 'websocket' ? 'websocket' : 'webrtc'

const rawWs = readEnvString('VITE_WEBSOCKET_URL', import.meta.env)
const WEBSOCKET_URL: string = rawWs && rawWs.length > 0 ? rawWs : 'ws://localhost:1234'

const rawSig = readEnvString('VITE_SIGNALING_URLS', import.meta.env)
const SIGNALING_URLS: string[] =
  rawSig && rawSig.length > 0
    ? rawSig
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : PUBLIC_SIGNALING

const HEARTBEAT_INTERVAL_MS = 30000
const PRESENCE_TIMEOUT_MS = 180000
const STORAGE_DEBOUNCE_MS = 300

type StoreApi = ReturnType<typeof createStore>

const INJECT_KEY: InjectionKey<StoreApi> = Symbol(
  'design-system-store'
) as InjectionKey<StoreApi>

type UnifiedStatusHandler = (p: { connected: boolean }) => void
type UnifiedSyncedHandler = () => void

type WebrtcStatusPayload = { connected: boolean }
type WebsocketStatusPayload = { status: 'connected' | 'connecting' | 'disconnected' }

interface ProviderCommon {
  destroy(): void
}

interface ProviderLike {
  on?: unknown
  off?: unknown
  destroy?: unknown
  wsconnected?: unknown
}

type WrappedHandler = (...args: unknown[]) => void

interface WrappedHandlers {
  status: WrappedHandler | null
  synced: WrappedHandler | null
}

const attachedHandlers = new WeakMap<object, Map<object, WrappedHandlers>>()

function isWebsocketProvider(
  p: WebrtcProvider | WebsocketProvider | null
): p is WebsocketProvider {
  if (p === null) return false
  return typeof (p as ProviderLike).wsconnected !== 'undefined'
}

function hasCommonOps<T extends ProviderLike>(
  obj: T | null
): obj is T & ProviderCommon {
  if (obj === null) return false
  return typeof obj.destroy === 'function'
}

function normalizeStatus(
  provider: WebrtcProvider | WebsocketProvider | null,
  payload: WebrtcStatusPayload | WebsocketStatusPayload
): { connected: boolean } {
  if (isWebsocketProvider(provider)) {
    const p = payload as WebsocketStatusPayload
    return { connected: p.status === 'connected' }
  }
  const p = payload as WebrtcStatusPayload
  return { connected: typeof p.connected === 'boolean' ? p.connected : false }
}

function ensureProviderMap(
  providerObj: WebrtcProvider | WebsocketProvider
): Map<object, WrappedHandlers> {
  let pmap = attachedHandlers.get(providerObj)
  if (!pmap) {
    pmap = new Map()
    attachedHandlers.set(providerObj, pmap)
  }
  return pmap
}

function callProviderOn(
  provider: WebrtcProvider | WebsocketProvider,
  name: string,
  fn: WrappedHandler
): void {
  const p = provider as ProviderLike
  if (typeof p.on === 'function') {
    ;(p.on as (n: string, f: WrappedHandler) => void)(name, fn)
  }
}

function callProviderOff(
  provider: WebrtcProvider | WebsocketProvider,
  name: string,
  fn: WrappedHandler
): void {
  const p = provider as ProviderLike
  if (typeof p.off === 'function') {
    ;(p.off as (n: string, f: WrappedHandler) => void)(name, fn)
  }
}

function attachProviderStatus(
  provider: WebrtcProvider | WebsocketProvider | null,
  handler: UnifiedStatusHandler
): void {
  if (!provider) return
  const pmap = ensureProviderMap(provider)
  const key: object = handler
  const existing = pmap.get(key)
  const wrappedStatus: WrappedHandler = (payload: unknown) => {
    const p = payload as WebrtcStatusPayload | WebsocketStatusPayload
    handler(normalizeStatus(provider, p))
  }
  pmap.set(key, {
    status: wrappedStatus,
    synced: existing?.synced ?? null
  })
  callProviderOn(provider, 'status', wrappedStatus)
}

function attachProviderSynced(
  provider: WebrtcProvider | WebsocketProvider | null,
  handler: UnifiedSyncedHandler
): void {
  if (!provider) return
  const pmap = ensureProviderMap(provider)
  const key: object = handler
  const existing = pmap.get(key)
  const wrappedSynced: WrappedHandler = () => {
    handler()
  }
  pmap.set(key, {
    status: existing?.status ?? null,
    synced: wrappedSynced
  })
  callProviderOn(provider, 'synced', wrappedSynced)
}

function detachProviderHandlers(
  provider: WebrtcProvider | WebsocketProvider | null,
  statusHandler: UnifiedStatusHandler,
  syncedHandler: UnifiedSyncedHandler
): void {
  if (!provider) return
  const pmap = attachedHandlers.get(provider)
  if (!pmap) return
  const statusEntry = pmap.get(statusHandler as object)
  if (statusEntry?.status) {
    callProviderOff(provider, 'status', statusEntry.status)
  }
  const syncedEntry = pmap.get(syncedHandler as object)
  if (syncedEntry?.synced) {
    callProviderOff(provider, 'synced', syncedEntry.synced)
  }
  pmap.delete(statusHandler as object)
  pmap.delete(syncedHandler as object)
}

function destroyProvider(provider: WebrtcProvider | WebsocketProvider | null): void {
  if (!hasCommonOps(provider)) return
  provider.destroy()
}

function generateUserId(): string {
  return 'user-' + Math.random().toString(36).slice(2, 10)
}

function getOrCreateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY)
  if (!id) {
    id = generateUserId()
    localStorage.setItem(USER_ID_KEY, id)
  }
  return id
}

function pickCollaboratorIdentity(
  usedColors: string[],
  usedNames: string[]
): { color: string; name: string } {
  const availableColors = collaboratorColors.filter((c) => !usedColors.includes(c))
  const availableNames = collaboratorNames.filter((n) => !usedNames.includes(n))
  return {
    color:
      availableColors[0] ??
      '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
    name: availableNames[0] ?? 'Guest-' + Math.floor(Math.random() * 1000)
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function loadConfigFromStorage(): DesignSystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return deepClone(defaultConfig)
    const parsed = JSON.parse(raw) as DesignSystemConfig
    return {
      name: parsed.name ?? defaultConfig.name,
      version: parsed.version ?? defaultConfig.version,
      colors: parsed.colors ?? deepClone(defaultConfig.colors),
      typography: parsed.typography ?? deepClone(defaultConfig.typography),
      spacing: parsed.spacing ?? deepClone(defaultConfig.spacing),
      borderRadius: parsed.borderRadius ?? deepClone(defaultConfig.borderRadius),
      shadows: parsed.shadows ?? deepClone(defaultConfig.shadows)
    }
  } catch {
    return deepClone(defaultConfig)
  }
}

type UpdateBasicField = 'name' | 'version'
type TypographyListField = 'fontSizes' | 'lineHeights'

function createStore() {
  const initial = loadConfigFromStorage()
  const config = reactive<DesignSystemConfig>(initial)
  const collaborators = ref<Collaborator[]>([])
  const otherCollaborators = ref<Collaborator[]>([])
  const me = ref<Collaborator | null>(null)
  const isCollaborationEnabled = ref(false)
  const isConnected = ref(false)
  const collabMode = ref<CollabMode>(COLLAB_MODE)

  let ydoc: Y.Doc | null = null
  let provider: WebrtcProvider | WebsocketProvider | null = null
  let yConfig: Y.Map<unknown> | null = null
  let yPresenceMap: Y.Map<unknown> | null = null
  let isApplyingRemote = false
  let storageDebounceTimer: number | null = null
  let heartbeatTimer: number | null = null
  let presenceCleanupTimer: number | null = null
  let referenceCounter = 0
  const teardownFns: Array<() => void> = []

  function saveConfigToStorage(): void {
    if (storageDebounceTimer !== null) {
      window.clearTimeout(storageDebounceTimer)
    }
    storageDebounceTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      } catch (err) {
        console.error('[DesignSystem] save failed:', err)
      }
    }, STORAGE_DEBOUNCE_MS)
  }

  function pushToRemote(): void {
    if (!yConfig || isApplyingRemote) return
    yConfig.set('payload', JSON.stringify(config))
  }

  function updateMeTimestamp(): void {
    if (!me.value) return
    me.value.lastActive = Date.now()
    if (yPresenceMap && me.value) {
      yPresenceMap.set(me.value.id, JSON.stringify(me.value))
    }
  }

  function refreshOtherCollaborators(): void {
    const myId = me.value?.id
    otherCollaborators.value = myId
      ? collaborators.value.filter((c) => c.id !== myId)
      : collaborators.value.slice()
  }

  function initializeMe(): void {
    const myId = getOrCreateUserId()
    const existing = collaborators.value.find((c) => c.id === myId)
    if (existing) {
      me.value = existing
      existing.lastActive = Date.now()
    } else {
      const identity = pickCollaboratorIdentity(
        collaborators.value.map((c) => c.color),
        collaborators.value.map((c) => c.name)
      )
      const meData: Collaborator = {
        id: myId,
        name: identity.name,
        color: identity.color,
        lastActive: Date.now()
      }
      collaborators.value.push(meData)
      me.value = meData
    }
    refreshOtherCollaborators()
  }

  function applyRemote(raw: unknown): void {
    if (!raw) return
    try {
      const remote = JSON.parse(String(raw)) as Partial<DesignSystemConfig>
      isApplyingRemote = true
      if (typeof remote.name === 'string') config.name = remote.name
      if (typeof remote.version === 'string') config.version = remote.version
      if (remote.colors) {
        const cs = remote.colors as ColorSystem
        if (Array.isArray(cs.primary)) {
          config.colors.primary = cs.primary.map((s) => ({ name: s.name, value: s.value }))
        }
        if (Array.isArray(cs.secondary)) {
          config.colors.secondary = cs.secondary.map((s) => ({ name: s.name, value: s.value }))
        }
        if (Array.isArray(cs.neutral)) {
          config.colors.neutral = cs.neutral.map((s) => ({ name: s.name, value: s.value }))
        }
      }
      if (remote.typography) {
        const t = remote.typography as TypographySystem
        if (typeof t.fontFamily === 'string') config.typography.fontFamily = t.fontFamily
        if (Array.isArray(t.fontSizes)) {
          config.typography.fontSizes = t.fontSizes.map((f) => ({ name: f.name, value: f.value }))
        }
        if (Array.isArray(t.lineHeights)) {
          config.typography.lineHeights = t.lineHeights.map((l) => ({
            name: l.name,
            value: typeof l.value === 'number' ? l.value : Number(l.value)
          }))
        }
      }
      if (remote.spacing) {
        const sp = remote.spacing as SpacingSystem
        config.spacing = Object.keys(sp).reduce<SpacingSystem>((acc, k) => {
          if (typeof sp[k] === 'string') acc[k] = sp[k]
          return acc
        }, {})
      }
      if (remote.borderRadius) {
        const br = remote.borderRadius as BorderRadiusSystem
        config.borderRadius = Object.keys(br).reduce<BorderRadiusSystem>((acc, k) => {
          if (typeof br[k] === 'string') acc[k] = br[k]
          return acc
        }, {})
      }
      if (remote.shadows) {
        const sh = remote.shadows as ShadowSystem
        if (Array.isArray(sh.levels)) {
          config.shadows.levels = sh.levels.map((l) => ({ name: l.name, value: l.value }))
        }
      }
    } catch (err) {
      console.error('[DesignSystem] remote apply error:', err)
    } finally {
      window.setTimeout(() => {
        isApplyingRemote = false
      }, 0)
    }
  }

  function rebuildPresenceFromYjs(): void {
    if (!yPresenceMap) return
    const rawList: unknown[] = yPresenceMap.toJSON() as unknown[]
    const parsed: Collaborator[] = []
    for (const raw of Object.values(rawList)) {
      try {
        const c = JSON.parse(String(raw)) as Collaborator
        if (c && c.id && typeof c.id === 'string') {
          parsed.push(c)
        }
      } catch {
        // skip malformed entries
      }
    }
    collaborators.value = parsed
    if (me.value) {
      const currentMe = parsed.find((c) => c.id === me.value!.id)
      if (currentMe) me.value = currentMe
    }
    refreshOtherCollaborators()
  }

  function cleanupStalePresence(): void {
    const now = Date.now()
    const myId = me.value?.id
    const before = collaborators.value.length
    collaborators.value = collaborators.value.filter((c) => {
      if (c.id === myId) return true
      return now - c.lastActive < PRESENCE_TIMEOUT_MS
    })
    if (collaborators.value.length !== before) {
      refreshOtherCollaborators()
    }
  }

  function initCollaboration(): void {
    if (isCollaborationEnabled.value) return
    try {
      ydoc = new Y.Doc()
      yConfig = ydoc.getMap('config')
      yPresenceMap = ydoc.getMap('presence')

      collabMode.value = COLLAB_MODE
      if (COLLAB_MODE === 'websocket') {
        provider = new WebsocketProvider(WEBSOCKET_URL, ROOM_NAME, ydoc, { connect: true })
      } else {
        provider = new WebrtcProvider(ROOM_NAME, ydoc, { signaling: SIGNALING_URLS })
      }

      if (!me.value) initializeMe()
      updateMeTimestamp()

      const firstRemote = yConfig.get('payload')
      if (firstRemote) {
        applyRemote(firstRemote)
      } else {
        pushToRemote()
      }
      if (yPresenceMap && me.value) {
        yPresenceMap.set(me.value.id, JSON.stringify(me.value))
      }

      const onRemoteConfig = (events: YEvent<Y.AbstractType<unknown>>[]): void => {
        for (const ev of events) {
          const target = ev.target as Y.Map<unknown>
          if (target === yConfig && ev.changes.keys.has('payload')) {
            const payload = target.get('payload')
            applyRemote(payload)
          }
          if (target === yPresenceMap) {
            rebuildPresenceFromYjs()
          }
        }
      }
      yConfig.observeDeep(onRemoteConfig)
      yPresenceMap.observeDeep(onRemoteConfig)

      const onProviderStatus: UnifiedStatusHandler = ({ connected }): void => {
        isConnected.value = connected
      }
      attachProviderStatus(provider, onProviderStatus)

      const onProviderSynced: UnifiedSyncedHandler = (): void => {
        const latest = yConfig?.get('payload')
        if (latest) applyRemote(latest)
        else pushToRemote()
      }
      attachProviderSynced(provider, onProviderSynced)

      heartbeatTimer = window.setInterval(() => {
        updateMeTimestamp()
      }, HEARTBEAT_INTERVAL_MS)

      presenceCleanupTimer = window.setInterval(() => {
        cleanupStalePresence()
      }, HEARTBEAT_INTERVAL_MS * 2)

      isCollaborationEnabled.value = true

      teardownFns.push(() => {
        if (heartbeatTimer !== null) {
          window.clearInterval(heartbeatTimer)
          heartbeatTimer = null
        }
        if (presenceCleanupTimer !== null) {
          window.clearInterval(presenceCleanupTimer)
          presenceCleanupTimer = null
        }
        if (provider) {
          detachProviderHandlers(provider, onProviderStatus, onProviderSynced)
          if (yPresenceMap && me.value) {
            yPresenceMap.delete(me.value.id)
          }
          destroyProvider(provider)
          provider = null
        }
        if (ydoc) {
          ydoc.destroy()
          ydoc = null
        }
        yConfig = null
        yPresenceMap = null
        isCollaborationEnabled.value = false
        isConnected.value = false
      })
    } catch (err) {
      console.error('[DesignSystem] collaboration init failed:', err)
      isCollaborationEnabled.value = false
    }
  }

  function replaceConfig(next: DesignSystemConfig): void {
    Object.assign(config, deepClone(next))
  }

  function resetConfig(): void {
    const restored = deepClone(defaultConfig)
    replaceConfig(restored)
  }

  function updateBasic(field: UpdateBasicField, value: string): void {
    config[field] = value
  }

  function updateColorCategory(
    category: 'primary' | 'secondary' | 'neutral',
    index: number,
    value: string
  ): void {
    const target = config.colors[category]
    if (!target[index]) return
    target[index].value = value
  }

  function addColorSwatch(category: 'primary' | 'secondary' | 'neutral'): void {
    const target = config.colors[category]
    const last = target[target.length - 1]
    const nextName = last
      ? String((Number.parseInt(last.name, 10) || 0) + 100)
      : '50'
    const next: ColorSwatch = { name: nextName, value: '#cccccc' }
    target.push(next)
  }

  function removeColorSwatch(
    category: 'primary' | 'secondary' | 'neutral',
    index: number
  ): void {
    const target = config.colors[category]
    if (index < 0 || index >= target.length) return
    target.splice(index, 1)
  }

  function updateFontFamily(value: string): void {
    config.typography.fontFamily = value
  }

  function updateFontSize(
    index: number,
    field: 'name' | 'value',
    value: string
  ): void {
    const target = config.typography.fontSizes[index]
    if (!target) return
    target[field] = value
  }

  function updateLineHeight(
    index: number,
    field: 'name' | 'value',
    value: string | number
  ): void {
    const target = config.typography.lineHeights[index]
    if (!target) return
    if (field === 'value') {
      target.value = Number(value) || target.value
    } else {
      target.name = String(value)
    }
  }

  function updateSpacing(key: string, value: string): void {
    config.spacing[key] = value
  }

  function addSpacing(): void {
    const existingKeys = Object.keys(config.spacing)
      .map((k) => Number.parseInt(k, 10))
      .filter((n) => Number.isFinite(n))
    const max = existingKeys.length ? Math.max(...existingKeys) : 0
    config.spacing[String(max + 1)] = '0px'
  }

  function removeSpacing(key: string): void {
    delete config.spacing[key]
  }

  function updateBorderRadius(key: string, value: string): void {
    config.borderRadius[key] = value
  }

  function updateShadow(
    index: number,
    field: 'name' | 'value',
    value: string
  ): void {
    const target = config.shadows.levels[index]
    if (!target) return
    target[field] = value
  }

  function addShadow(): void {
    config.shadows.levels.push({
      name: 'new-level',
      value: '0 0 0 rgba(0,0,0,0)'
    })
  }

  function removeShadow(index: number): void {
    if (index < 0 || index >= config.shadows.levels.length) return
    config.shadows.levels.splice(index, 1)
  }

  const stopWatching = watch(
    () => deepClone(config),
    () => {
      saveConfigToStorage()
      pushToRemote()
    },
    { deep: true }
  )
  teardownFns.push(() => {
    stopWatching()
    if (storageDebounceTimer !== null) {
      window.clearTimeout(storageDebounceTimer)
      storageDebounceTimer = null
    }
  })

  initializeMe()

  function dispose(): void {
    referenceCounter -= 1
    if (referenceCounter <= 0) {
      referenceCounter = 0
      let fn: (() => void) | undefined
      while ((fn = teardownFns.pop())) {
        try {
          fn()
        } catch (err) {
          console.error('[DesignSystem] teardown failed:', err)
        }
      }
    }
  }

  referenceCounter += 1

  return {
    config,
    collaborators: readonlyWrapper(collaborators),
    otherCollaborators: readonlyWrapper(otherCollaborators),
    me,
    isCollaborationEnabled,
    isConnected,
    collabMode,
    initCollaboration,
    resetConfig,
    replaceConfig,
    updateBasic,
    updateColorCategory,
    addColorSwatch,
    removeColorSwatch,
    updateFontFamily,
    updateFontSize,
    updateLineHeight,
    updateSpacing,
    addSpacing,
    removeSpacing,
    updateBorderRadius,
    updateShadow,
    addShadow,
    removeShadow,
    dispose
  }
}

let singletonStore: StoreApi | null = null

export function getOrCreateSingletonStore(): StoreApi {
  if (!singletonStore) {
    singletonStore = createStore()
  }
  return singletonStore
}

export function bootstrapDesignStore(app: App<Element>): void {
  const store = getOrCreateSingletonStore()
  app.provide(INJECT_KEY, store)
}

export function provideDesignStore(): void {
  provide(INJECT_KEY, getOrCreateSingletonStore())
}

export function useDesignConfig(): StoreApi {
  const store = inject<StoreApi>(INJECT_KEY)
  if (!store) {
    if (!singletonStore) {
      singletonStore = createStore()
    }
    return singletonStore
  }
  return store
}

export function useScopedDesignConfig(): StoreApi {
  const store = useDesignConfig()
  onUnmounted(() => {
    store.dispose()
  })
  return store
}

export type DesignStoreApi = StoreApi

export const TypographyListFields: TypographyListField[] = ['fontSizes', 'lineHeights']
