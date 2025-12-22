<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <!-- <div class="text-center mb-8">
        <img
          :src="logoUrl"
          alt="ChatApp Logo"
          class="mx-auto h-20 w-auto rounded-full shadow-xl border-4 border-white"
        />
        <h1 class="mt-4 text-3xl font-bold text-gray-900">ChatApp</h1>
        <p class="text-gray-600 mt-1">Kết nối mọi lúc, mọi nơi</p>
      </div> -->

      <!-- Card -->
      <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="px-8 py-10">
          <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">
            Chào mừng trở lại!
          </h2>
          <p class="text-center text-gray-600 mb-8">
            Đăng nhập để tiếp tục trò chuyện
          </p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Wrapper chung cho input -->
            <div class="space-y-6">
              <!-- Tên đăng nhập -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <div class="relative">
                  <i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"></i>
                  <InputText
                    v-model="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    :class="{ 'p-invalid': !username && submitted }"
                    autofocus
                    autocomplete="username"
                  />
                </div>
                <small v-if="!username && submitted" class="text-red-500 text-sm mt-1 block">
                  Vui lòng nhập tên đăng nhập
                </small>
              </div>

              <!-- Mật khẩu -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div class="relative">
                  <i class="pi pi-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"></i>
                  <Password
                    v-model="password"
                    placeholder="Nhập mật khẩu"
                    :toggleMask="true"
                    :feedback="false"
                    class="w-full"
                    inputClass="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                    :class="{ 'p-invalid': !password && submitted }"
                    autocomplete="current-password"
                  />
                </div>
                <small v-if="!password && submitted" class="text-red-500 text-sm mt-1 block">
                  Vui lòng nhập mật khẩu
                </small>
              </div>
            </div>

            <!-- Remember me & Forgot -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Checkbox v-model="rememberMe" inputId="rememberme" binary class="mr-2" />
                <label for="rememberme" class="text-sm text-gray-700 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <router-link
                to="/auth/forgot-password"
                class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Quên mật khẩu?
              </router-link>
            </div>

            <!-- Nút -->
            <Button
              type="submit"
              label="Đăng nhập"
              class="w-full py-3 text-lg font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              :loading="isLoading"
              :disabled="isLoading"
            />
          </form>
        </div>

        <div class="bg-gray-50 px-8 py-6 text-center">
          <p class="text-gray-600 text-sm">
            Chưa có tài khoản?
            <router-link to="/auth/register" class="text-indigo-600 hover:text-indigo-800 font-medium">
              Đăng ký ngay
            </router-link>
          </p>
        </div>
      </div>
    </div>

    <AppConfig simple />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const submitted = ref(false)

const logoUrl = computed(() => {
  return new URL('../assets/img/logo.png', import.meta.url).href
})

onMounted(() => {
  authStore.restoreSession()
  if (authStore.isLoggedIn) {
    toast.add({ severity: 'info', summary: 'Đã đăng nhập', detail: 'Chào mừng quay lại!', life: 2000 })
    router.replace('/')
  }
})

const handleLogin = async () => {
  submitted.value = true
  if (!username.value.trim() || !password.value) {
    toast.add({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập đầy đủ thông tin', life: 3000 })
    return
  }

  isLoading.value = true
  const result = await authStore.login({ username: username.value, password: password.value })
  isLoading.value = false

  if (result.success) {
    toast.add({ severity: 'success', summary: 'Đăng nhập thành công', detail: `Xin chào ${authStore.username}!`, life: 2000 })
    router.push('/')
  } else {
    toast.add({ severity: 'error', summary: 'Đăng nhập thất bại', detail: result.message || 'Sai tài khoản hoặc mật khẩu', life: 3000 })
  }
}
</script>

<style scoped>
/* Buộc cả hai input có chiều rộng và padding giống hệt */
:deep(.p-inputtext),
:deep(.p-password .p-inputtext) {
  width: 100% !important;
  height: 48px !important; /* Chiều cao cố định */
  padding-left: 2.5rem !important;
  padding-right: 1rem !important;
  border-radius: 0.5rem;
}

/* Đặc biệt cho Password: padding bên phải đủ chỗ cho nút mắt */
:deep(.p-password .p-inputtext) {
  padding-right: 3rem !important;
}

/* Icon */
.relative {
  position: relative;
}

.pi-user, .pi-lock {
  font-size: 1.25rem;
}
</style>