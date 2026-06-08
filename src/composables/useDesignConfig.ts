import { ref, watch, onMounted } from 'vue'
import type { DesignSystemConfig, Collaborator } from '../types'
import { defaultConfig, collaboratorColors, collaboratorNames } from '../utils/defaults'

const STORAGE_KEY = 'design-system-config'
const COLLABORATOR_KEY = 'design-system-collaborators'
const USER_ID_KEY = 'design-system-user-id'

const config = ref<DesignSystemConfig>({ ...defaultConfig })
const collaborators = ref<Collaborator[]>([])
const userId = ref<string>('')
const isCollaborationEnabled = ref(false)

let broadcastChannel: BroadcastChannel | null = null

function generateUserId(): string {
  return 'user-' + Math.random().toString(36).substring(2, 10)
}

function getCurrentUser(): Collaborator {
  const savedId = localStorage.getItem(USER_ID_KEY)
  if (savedId) userId.value = savedId
  else {
    userId.value = generateUserId()
    localStorage.setItem(USER_ID_KEY, userId.value)
  }

  const existingMe = collaborators.value.find(c => c.id === userId.value)
  if (existingMe) return existingMe

  const usedColors = collaborators.value.map(c => c.color)
  const availableColors = collaboratorColors.filter(c => !usedColors.includes(c))
  const usedNames = collaborators.value.map(c => c.name)
  const availableNames = collaboratorNames.filter(n => !usedNames.includes(n))

  const me: Collaborator = {
    id: userId.value,
    name: availableNames[0] || 'User',
    color: availableColors[0] || '#' + Math.floor(Math.random() * 16777215).toString(16),
    lastActive: Date.now()
  }
  return me
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      config.value = JSON.parse(saved)
    }

    const savedCollabs = localStorage.getItem(COLLABORATOR_KEY)
    if (savedCollabs) {
      collaborators.value = JSON.parse(savedCollabs)
    }

    const me = getCurrentUser()
    if (!collaborators.value.find(c => c.id === me.id)) {
      collaborators.value.push(me)
    }
    saveCollaborators()
  } catch (e) {
    console.error('Failed to load from storage:', e)
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
}

function saveCollaborators() {
  localStorage.setItem(COLLABORATOR_KEY, JSON.stringify(collaborators.value))
}

function resetConfig() {
  config.value = JSON.parse(JSON.stringify(defaultConfig))
  saveToStorage()
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'config', data: config.value, userId: userId.value })
  }
}

function updateConfig(newConfig: Partial<DesignSystemConfig>) {
  config.value = { ...config.value, ...newConfig }
}

function initCollaboration() {
  if (isCollaborationEnabled.value) return

  try {
    broadcastChannel = new BroadcastChannel('design-system-collab')

    broadcastChannel.onmessage = (event) => {
      const { type, data, userId: senderId } = event.data

      if (senderId === userId.value) return

      if (type === 'config') {
        config.value = data
        saveToStorage()
      } else if (type === 'presence') {
        const existing = collaborators.value.find(c => c.id === data.id)
        if (existing) {
          existing.lastActive = Date.now()
        } else {
          collaborators.value.push(data)
        }
        saveCollaborators()
      } else if (type === 'leave') {
        collaborators.value = collaborators.value.filter(c => c.id !== data.id)
        saveCollaborators()
      }
    }

    isCollaborationEnabled.value = true

    const me = getCurrentUser()
    broadcastChannel.postMessage({ type: 'presence', data: me, userId: userId.value })

    setInterval(() => {
      if (broadcastChannel && userId.value) {
        const me = collaborators.value.find(c => c.id === userId.value)
        if (me) {
          me.lastActive = Date.now()
          broadcastChannel.postMessage({ type: 'presence', data: me, userId: userId.value })
        }
      }
    }, 10000)

    setInterval(() => {
      const now = Date.now()
      const beforeCount = collaborators.value.length
      collaborators.value = collaborators.value.filter(
        c => c.id === userId.value || now - c.lastActive < 60000
      )
      if (collaborators.value.length !== beforeCount) {
        saveCollaborators()
      }
    }, 15000)

    window.addEventListener('beforeunload', () => {
      if (broadcastChannel && userId.value) {
        const me = collaborators.value.find(c => c.id === userId.value)
        if (me) {
          broadcastChannel.postMessage({ type: 'leave', data: me, userId: userId.value })
        }
      }
    })
  } catch (e) {
    console.error('Failed to initialize collaboration:', e)
  }
}

export function useDesignConfig() {
  onMounted(() => {
    loadFromStorage()
  })

  watch(
    config,
    () => {
      saveToStorage()
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'config', data: config.value, userId: userId.value })
      }
    },
    { deep: true }
  )

  return {
    config,
    collaborators,
    userId,
    isCollaborationEnabled,
    resetConfig,
    updateConfig,
    initCollaboration,
    saveToStorage
  }
}
