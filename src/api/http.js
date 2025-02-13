import axios from 'axios'

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 10000,
    })
  }

  post = (path, data) => {
    // return this.instance.post(path, data)
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // await 网络请求发送出去后,线程会挂起,直到收到服务器响应后再回到当前代码进行执行
      // 如果在某个函数中使用了await, 那么该函数必须定义为 async (异步函数)
      // axios 底层也是 Promise 对象,如果响应状态码不是200, 则会调用 reject
      // 而调用reject, 则会使外层函数抛出异常
      try {
        let resulut = await this.instance.post(path, data)
        // 直接返回token+user组成的json
        resolve(resulut.data)
      } catch (error) {
        // 捕获异常
        reject(error.response.data.detail)
      }
    })
  }

  get = (path, params) => {
    return this.instance.get(path, params)
  }
}

export default new Http()
