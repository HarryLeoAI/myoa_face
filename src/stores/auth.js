import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const USER_KEY = 'OA_USER_KEY'
const TOKEN_KEY = 'OA_TOKEN_KEY'

export const useCounterStore = defineStore('auth', () => {
  let _user = ref({})
  let _token = ref('')

  // 保存 user 和 token
  const setUserToken = (user, token) => {
    _user.value = user
    _token.value = token
    // 存储在浏览器的 localStorage中
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, token)
  }

  // 计算属性
  let user = computed(() => {
    // 如果_user为空
    if (!_user.value) {
      _user.value = localStorage.getItem(USER_KEY)
    }
    return _user.value
  })

  let token = computed(() => {
    if (!_token.value) {
      _token.value = localStorage.getItem(TOKEN_KEY)
    }
    return _token.value
  })

  // 必须返回才能由外部访问
  return { setUserToken, user, token }
})
