import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const USER_KEY = 'OA_USER_KEY'
const TOKEN_KEY = 'OA_TOKEN_KEY'

export const useAuthStore = defineStore('auth', () => {
  let _user = ref({})
  let _token = ref('')
  let user_str, token_str

  // 登录成功,设置 user & token 到内存和浏览器中
  const setUserToken = (user, token) => {
    _user.value = user
    _token.value = token

    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, token)
  }

  // 退出登录, 清除内存和浏览器里的 user & token
  const clearUserToken = () => {
    _user.value = {}
    _token.value = ''
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  let user = computed(() => {
    if (Object.keys(_user.value).length == 0) {
      user_str = localStorage.getItem(USER_KEY)
      if (user_str) {
        _user.value = JSON.parse(user_str)
      }
    }
    return _user.value
  })

  let token = computed(() => {
    if (!_token.value) {
      token_str = localStorage.getItem(TOKEN_KEY)
      if (token_str) {
        _token.value = token_str
      }
    }
    return _token.value
  })

  let is_logined = computed(() => {
    if (Object.keys(user.value).length > 0 && token.value) {
      return true
    } else {
      return false
    }
  })

  // 必须返回才能由外部访问
  return { setUserToken, clearUserToken, user, token, is_logined }
})
