import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'
import router from './router'
import { createPinia } from 'pinia'
import ToastService from 'primevue/toastservice'
import './style.css'

import { useAuthStore } from './stores/auth'  // Giữ import

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(router)
app.use(ToastService)

// 🔥 CHUYỂN VIỆC GỌI restoreSession RA KHỎI ĐÂY
// Không gọi authStore.restoreSession() ở đây nữa

app.mount('#app')

// 🔥 GỌI restoreSession SAU KHI app đã mount (an toàn nhất)
const authStore = useAuthStore();
authStore.restoreSession();  // Gọi sau mount