# 创建项目

> 我的全栈项目后端都叫 `xxx_back`, 前端都叫 `xxx_face`, 这个项目名称为 `myoa_face`

### npm创建

- 命令 `npm create vue@latest` (版本3.14.1)
  - 把router和Pinia选上
- 创建成功后还需要:
  - `npm install`, 根据依赖安装node包
  - `npm run format`, 格式化代码
- 启动项目: `npm run dev`

### github托管

- 略

# 整理Vue

1. App.vue仅 template 保留路由出口, 干掉 script 和 style 里的所有内容
2. 为了方便给 script 指定name, 安装插件 `npm install vite-plugin-vue-setup-extend --save-dev` 并配置 `~/vite.config.js`

```js
// ...
import VueSetupExtend from 'vite-plugin-vue-setup-extend' //导包
export default defineConfig({
  plugins: [
    // ...,
    VueSetupExtend(), //加载插件
  ],
  // ...
})
```

3. 干掉main.js里导入的的main.css, `import './assets/main.css'`, 顺便把这个main.css也一并删除
4. 新建`~/src/views/login/Login.vue` 以及 `~/src/views/frame/Frame.vue`, 对应登录页面和网页视觉框架
5. 配置路由

```js
import { createRouter, createWebHashHistory } from 'vue-router' // 用hash路由,带#,防止与后台冲突

// 视图
import Login from '@/views/login/LoginView.vue'
import Frame from '@/views/main/FrameView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // 路由
    {
      path: '/',
      name: 'frame',
      component: Frame,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

export default router
```

> 报了一个错, 又是说Vue的组件必须是多个单词组成的, 所以没办法本来叫`Login.vue`的只能叫`LoginView.vue`了

# 登录

### 页面架构

- `App.vue` 先干掉浏览器自带样式

```html
<style>
  * {
    margin: 0;
    padding: 0;
  }
</style>
```

- 登录页面(template & style), "面向AI编程", 找AI写, 略

### 实现前后交互获取token

- 使用axios发送ajax请求,需要安装axios: `npm install axios --save-dev`
- 完善登录逻辑`~/src/views/login/LoginView.vue`

```vue
<script setup name="login">
import { reactive } from 'vue'
import axios from 'axios'

let form = reactive({
  email: '',
  password: '',
})

const onsubmit = () => {
  // 配置正则表达式
  let pwdRgx = /^[0-9a-zA-Z_-]{6,24}/
  let emailRgx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9])+/
  // 执行验证
  if (!emailRgx.test(form.email)) {
    alert('邮箱不正确!')
    return
  }
  if (!pwdRgx.test(form.password)) {
    alert('密码不正确!')
    return
  }

  // 通过 axios 进行 ajax 请求
  axios
    .post('http://localhost:8000/auth/login', {
      email: form.email,
      password: form.password,
    })
    // 正确,HTTP状态码一般是2开头的
    .then((result) => {
      let data = result.data
      let token = data.token
      let user = data.user
      console.log(token)
      console.log(user)
    })
    // 失败,HTTP状态码非200
    .catch((error) => {
      console.log(error)
      alert(error.response.data.detail)
    })
}
</script>
```

> axios.post("路由", {参数}).then(成功后执行的匿名函数).catch(失败后执行的匿名函数)

### Pinia:token写入浏览器localstorage

- 新建 `~/src/stores/auth/js`

```js
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
```

- 在`LoginView.vue`中完成逻辑:

```js
// ...
import { useCounterStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

// 实例化对象
const authStore = useCounterStore()
const router = useRouter()

// axios.then() 中继续...

// 获取数据
let data = result.data
let user = data.user
let token = data.token

// 写入数据到内存和浏览器存储
authStore.setUserToken(user, token)

// 路由跳转
router.push({ name: 'frame' })

// ...
```

### 优化Ajax请求

- 上面的axios请求中, 是采用的`axios.post('请求地址', {传入参数}).then(返回200状态码时执行的函数).catch(返回非200状态码执行的函数)`, 其存在2个问题
  1. url写死了
  2. 不是异步请求的, 代码也不够优雅
- 处理则需要进行封装

  1. 新建`~/.env.development`配置文件, 注意:名称不可变, 这个文件专用为vite识别的环境变量

  ```conf
  VITE_BASE_URL = 'http://localhost:8000/'
  ```

  > 注意,是直接在项目根路径下,而非`~/src/`下

  > 在我们执行`npm run dev`时, 就会生成这样一个全局可读的,开发环境用的常量

  > 常量命名要求必须为`VITE_XXX`

  > 如果我们需要在生产环境中(`npm run build`)使用这样的常量,就需要新建`~/.env.production`

  2. 新建`~/src/api/http.js` 用于封装各种请求

  ```js
  import axios from 'axios' // 导入axios

  class Http {
    // 构造函数,在实例化时立刻执行
    constructor() {
      // 构造函数只干了一件事,就是调用axios.create()方法创建了一个axios请求的实例
      this.instance = axios.create({
        baseURL: import.meta.env.VITE_BASE_URL, // 配置请求域名:读取开发环变量, 即后台的域名
        timeout: 10000, // 配置超时请求,单位毫秒
      })
    }

    // Http类里有一个函数,叫做post
    post = (path, data) => {
      // post直接返回了一个 Promise 异步任务
      return new Promise(async (resolve, reject) => {
        // 任务执行以下事情:
        try {
          // 尝试调用 post 方法请求服务端
          let resulut = await this.instance.post(path, data)
          // 如果请求成功,则将服务器端返回的 token+user 组成的json返回出去
          resolve(resulut.data)
        } catch (error) {
          // 而如果失败,则捕获服务器端返回的信息, 同样返回给调用者
          reject(error.response.data.detail)
        }
      })
    }
  }

  // 为了外部调用方便, 直接暴露出取一个 Http类的实例
  export default new Http()
  ```

  > 这是一个重难点, 涉及到 `aysnc`, `await` 这样的异步请求,仔细阅读注释

  > `this.instance.post(path, data)`调用时, path前面已经通过`BASE_URL`拼好了域名

  3. 新建`~/src/api/authHttp.js` 对认证相关请求进行再次封装

  ```js
  import http from './http' // 引入http,此时的http因为上面返回的是实例,所以可以直接使用

  // 定义login方法, 方法接收2个参数: 邮箱,密码
  const login = (email, password) => {
    // 配置路由
    const path = 'auth/login'

    // 返回值为直接调用http.post()的结果
    return http.post(path, { email, password })
  }

  // 记得暴露函数以供外部调用
  export default { login }
  ```

  4. 重写`~/src/views/LoginView.vue`

  ```vue
  <script setup name="login">
  import { reactive } from 'vue'
  import { useCounterStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import authHttp from '@/api/authHttp'
  // 首先不用导入 axios 了,直接导入 authHttp, authHttp里面导入了http, http导入了axios

  const authStore = useCounterStore()
  const router = useRouter()

  let form = reactive({
    email: '',
    password: '',
  })

  const onsubmit = async () => {
    // 配置正则表达式
    let pwdRgx = /^[0-9a-zA-Z_-]{6,24}/
    let emailRgx = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9])+/
    // 执行验证
    if (!emailRgx.test(form.email)) {
      alert('邮箱不正确!')
      return
    }
    if (!pwdRgx.test(form.password)) {
      alert('密码不正确!')
      return
    }

    // 异步请求访问服务器
    try {
      // 直接调用authHttp.login()
      let data = await authHttp.login(form.email, form.password)
      // 写入数据到内存和浏览器存储
      authStore.setUserToken(data.user, data.token)
      // 路由跳转
      router.push({ name: 'frame' })
    } catch (detail) {
      // 如果发生任何错误,捕获并弹出
      alert(detail)
    }
  }
  </script>
  ```

  > 为什么一定要`try{异步调用}catch{捕获错误}`? 因为如果不进行异常捕获,Promise.reject会直接报错

  > 关于 js 的 Promise 类,可以参考<a href="https://github.com/HarryLeoAI/notes/blob/master/ES6.md#es6-%E7%9A%84%E8%BF%9B%E9%98%B6">以前的笔记</a>

  ### 总结

  - 到这一步,我实现了
    1. ai帮我写好的登录页面
    2. 登录页面输入信息,点击登录后, 通过axios向服务器发送请求
    3. 服务器的接口收到请求后,验证用户名和密码,如果正确返回一个user+token组成的json,如果错误返回detail(参数验证失败)和400状态码
  - 第2步的封装作为一个难点:
    1. 我新建了`~/src/api/http.js` 用于封装所有由axios发起的ajax请求
    2. 在`http.js`中,我新建了Http类,通过构造函数`constructor()`,给`this.instance`存进去了一个`axios.create()`创造出来的axios请求实例,这么做的原因是为了更方便配置请求的域名和请求超时时间
    3. 在`http.js`的Http类里,我还定义了一个名叫`post()`的方法,它里面采用`Promise`实现向服务器发起异步请求,成功则获取响应的json数据,失败则返回400状态码+错误信息.
    4. 为了进一步封装, 我还新建了 `authHttp.js` ,它导入http并定义了`login(email, password)`方法, 在这一层封装里,我来实现登录时,最终准确请求地址的配置`path`,以及传入参数`{email, password}`作为`data`
    5. 但以上两层都是为了代码的复用和美观,实际调用还是在`~/src/views/LoginView.vue`中, 这时候代码就相当简洁了

# ElementPlus

> <a href="https://cn.element-plus.org/zh-CN/component/overview.html">Vue御用组件库</a>

### 安装

- 项目内执行命令: `npm install element-plus --save-dev`
  > --save-dev 意思是保存依赖, 但只保存在开发环境中

### 在项目中使用

- `main.js`

```js
// ...
// 导入这两个包
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
// ...
// 声明使用
app.use(ElementPlus)

// ...
```

### 改写提示信息

- `~/src/views/LoginView.vue`

```js
import { ElMessage } from 'element-plus' //导入提示信息包

// ...
// 前端验证
if (!emailRgx.test(form.email)) {
  ElMessage({
    message: '邮箱格式不正确!',
    type: 'warning',
  })
  return
}
if (!pwdRgx.test(form.password)) {
  ElMessage({
    message: '密码长度不正确!',
    type: 'warning',
  })
  return
}

// 后端验证
try {
  // ...
} catch (detail) {
  ElMessage.error(detail)
}
```

- 服务端的返回的detail的值也要重写, 略

# 实现布局

### 基础布局

- <a href="https://cn.element-plus.org/zh-CN/component/container.html">element-plus为我们提供的布局参考</a>

- 导入布局,配置样式,具体代码略.
  - 实现块级元素高度=当前页面高度:`height: 100vh`
  - 实现渐变色背景`background: linear-gradient(135deg, #a5acf1, #2b369c);`
  - `router-link` 渲染出来其实是一个行内元素,为了让它和块级元素一样,默认宽度为父元素的100%:`display: flex;`
  - 然后使用文字水平垂直居中`justify-content: center;`,`align-items: center;`

### Element-Plus的图标库

- 想要使用Elment-plus-icon: `npm install @element-plus/icons-vue --save-dev`
- 然后在main.js中

```js
// 导包
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 注册所有的icon
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

- 投入使用, <a href="https://cn.element-plus.org/zh-CN/component/icon.html">图标参考</a>

```html
<!-- el-icon 标签里面包需要图标的标签,建议直接从图标参考里面取 -->
<el-icon><home /></el-icon>
```

### 导航条

- 同样参考Element-plus为我们提供的<a href="https://cn.element-plus.org/zh-CN/component/menu.html">示例</a>
- 复制粘贴,修修改改,略
