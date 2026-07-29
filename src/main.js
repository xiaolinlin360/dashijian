import './assets/main.scss'
import 'element-plus/dist/index.css'
import pinia from './stores'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
