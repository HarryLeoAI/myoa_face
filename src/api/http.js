import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 10000,
    })

    this.instance.interceptors.request.use((config) => {
      const authStore = useAuthStore()
      const token = authStore.token
      if (token) {
        config.headers.Authorization = 'JWT' + ' ' + authStore.token
      }
      return config
    })
  }

  post = (path, data) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.post(path, data)
        resolve(result.data)
      } catch (error) {
        reject(error.response.data.detail)
      }
    })
  }

  get = (path, params) => {
    return this.instance.get(path, params)
  }

  put(path, data) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.instance.put(path, data)
        resolve(result.data)
      } catch (err) {
        reject(err.response.data.detail)
      }
    })
  }
}

export default new Http()
