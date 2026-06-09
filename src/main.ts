import { createApp } from 'vue'
import './styles/global.css'
import App from './App.vue'
import { bootstrapDesignStore } from './composables/useDesignConfig'

const app = createApp(App)
bootstrapDesignStore(app)
app.mount('#app')
