import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import './style.css'

import 'primevue/resources/themes/lara-light-green/theme.css'

const app = createApp(App)

app.use(router)

app.use(PrimeVue)
app.use(ToastService)

app.mount('#app')
