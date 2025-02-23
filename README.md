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

### 在项目中投入使用

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

### 导航条伸缩

> 要实现:header部分有一个按钮,点击后按钮自己改变图标(展开或者折叠), 侧边栏同步伸缩.

- 具体代码如下

```vue
<script setup name="frame">
import { ref, computed } from 'vue'
// ...
let isCollapse = ref(false) // 是否伸缩:默认不伸缩
let asideWidth = computed(() => {
  // aside宽度:计算属性
  if (isCollapse.value) {
    // 如果伸缩
    return '64px' // aside为64px
  } else {
    // 如果不伸缩
    return '250px' // aside宽度为250px
  }
})

// 点击事件
const toggleAside = () => {
  isCollapse.value = !isCollapse.value
}
</script>
<template>
  <!-- 侧边栏绑定计算属性 -->
  <el-aside class="aside" :width="asideWidth">
    <!-- 具体内容, 略 -->
  </el-aside>

  <!-- ... -->

  <!-- 顶部导航处增加按钮 -->
  <el-header class="header">
    <div class="left-header">
      <!-- 通过v-show来确定具体展示哪个按钮 -->
      <el-button :icon="Expand" v-show="isCollapse" @click="toggleAside"></el-button>
      <el-button :icon="Fold" v-show="!isCollapse" @click="toggleAside"></el-button>
    </div>

    <!-- 其余内容, 略 -->
  </el-header>
</template>
```

> 待处理问题: 侧边栏里的`<el-menu>`默认自带动画`:collapse-transition="true"`, 但因为侧边栏没有动画, 所以我点击伸缩后, 视觉上会出现bug, 侧边栏瞬间缩进去, 但其内部的菜单还在跑动画. 为了解决这个问题, 我采用了关闭动画`:collapse-transition="false"`这样一种不太好的方法. 最优的解决是:给外部的`aside`绑定同样的动画

> 我找到了更好的解决办法, 就是直接不需要`<el-aside>`来包裹我们的侧边栏.侧边的`<el-container>`里面直接包`<el-menu>`, 然后把侧边栏第一项,原本的首页设置为我们的`logo`

### header 布局

- 只有一个重要的知识点,就是用flex布局实现块级元素分列左右

  > 需要实现:header最左边是侧边栏伸缩, 最右边是登录信息展示

  1. 先把header设置为flex布局:`display:flex`
  2. 声明其内部元素左右分列`justify-content: space-between`,上下居中 `align-items: center`

  ```css
  justify-content: space-between;
  align-items: center;
  ```

# 继续完善认证功能

### 修复bug

> 在js中, 空对象`{}`也为真(true)!

- 所以`~/src/stores/auth.js`中:

```js
let _user = ref({})

// 计算属性
let user = computed(() => {
  // 如果_user为空
  if (!_user.value) {
    //这句话永远都进不来, 因为user即使是{里面什么都没有}, 也为真
    _user.value = localStorage.getItem(USER_KEY)
  }
  return _user.value
})
```

> 但空字符串`''`为假(false)!

> 同时 `null` 也是一个对象

- 修复bug后的代码:

```js
// 计算属性
  let user = computed(() => {
    // 如果没有键名数组,说明对象为空
    if (Object.keys(_user.value).length == 0) // Object.keys(obj): 以数组的形式返回obj对象里的keys, .length获取该数组的长度, 如果为0证明数组为空, 数组为空证明对象没有keys, 证明对象为空
      // 获取浏览器里的数据
      user_str = localStorage.getItem(USER_KEY)
      if (user_str) {
        // 赋值给_user.value
        _user.value = JSON.parse(user_str)
      }
    }
    return _user.value
  })

  let token = computed(() => {
    if (!_token.value) {
      // 为了防止将null对象赋值给token, 先尝试取出浏览器里存储的token
      token_str = localStorage.getItem(TOKEN_KEY)
      // 如果token有值, 再交给_token.value
      if (token_str) {
        _token.value = token_str
      }
    }
    // 如果没有值, 返回的也依旧是空字符串 '', 而非 null
    return _token.value
  })
```

### 限制访问

> 分析项目, 作为OA系统, 应要求只有登录页面无需登录认证, 其余所有页面都要求用户登录后才可以访问.

- 因此我们可以使用`全局导航守卫`进行访问限制

- 编辑`~/src/router/index.js`

```js
// 导包
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// ...

// 全局导航守卫
router.beforeEach((to) => {
  // 判断用户是否登录, 如果没有登录, 则强行跳转到登录页面
  const authStore = useAuthStore()
  if (!authStore.is_logined && to.name != 'login') {
    ElMessage.error('请先登录!')
    return { name: 'login' }
  }
})
```

- 完成`authStore.is_logined`属性, 在`~/src/stores/auth.js`中

```js
// 定义计算属性is_logined
let is_logined = computed(() => {
  // 如果对象键名组成的数组长度大于0, 且token有值, 即既有user, 也有token, 说明已经登录
  if (Object.keys(user.value).length > 0 && token.value) {
    // 登录返回真
    return true
  } else {
    // 否则返回假
    return false
  }
})
```

> 为什么要用`user.value`,而不是`_user.value`呢? 仔细观看代码, 发现浏览器每次跳转或刷新, `_user.value` 在最上面就定义为空了, 而真正保管localstroage里user和token的值的是`user`, `token`这俩不带下划线的计算属性中, 且它俩定义在`is_logined`上面,所以可以直接读取

- 注意, 此时只是前端部分通过`全局路由守卫`实现了访问的限制, 但后端并没有, 无论在哪里, 无论是否登录, 包括用postman, 仍可以继续往后端的接口发送请求, 所以我们还需要完善后端部分, 此处略.

### 退出登录

- `~/src/views/FrameView.vue`中,定义登出方法`logout`,再给`退出登录`按钮绑上该事件

```vue
<script setup name="frame">
//...

import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

//...

// 退出登录
const logout = () => {
  ElMessageBox.confirm('即将退出登录,是否确认?', '确认退出?', {
    confirmButtonText: '确认退出',
    cancelButtonText: '点错了,返回',
    type: 'warning',
  })
    // 如果点击"确认退出",
    .then(() => {
      authStore.clearUserToken() // 调用 clearUserToken() 清理浏览器存储的user和token
      router.push({ name: 'login' }) // 然后跳转到登录页面
    })
    // 如果点击"点错了,返回"
    .catch(() => {
      return false //那啥也不干
    })
}
</script>

<template>
  <!-- ... -->
  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
  <!-- ... -->
</template>
```

- 完善`~/stores/auth.js`

```js
//...

// 退出登录, 清除内存和浏览器里的 user & token
const clearUserToken = () => {
  _user.value = {}
  _token.value = ''
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

// 记得暴露以供外部使用
return { setUserToken, clearUserToken, user, token, is_logined }
```

> 能不能直接在`auth.js`里, `clearUserToken()` 方法中实现弹窗确认以及跳转的逻辑呢? 可以,但是我们就又要在auth.js里导入`useRouter`. 但`FrameView.vue` 文件作为整站框架页面, 势必有很多路由跳转需要实现, 所以我更愿意在`FrameView.vue`里面引入路由`import { useRouter } from 'vue-router'`, 而非专用于权限认证的`auth.js`中

### 修改密码

- 借用`Element-plus`feedback组件(反馈组件)中的`dialog`(对话框组件)实现(对话框弹出一个表单), 先把视图层搭建好`~/src/views/FrameView.vue`

```vue
<script setup name="frame">
// ...

// 密码修改
const formLabelWidth = '80px' // 表单lable宽度
let dialogFormVisible = ref(false) // 表单是否弹出,默认不弹出
let resetPasswordForm = ref() // 表单验证用

// 表单数据
const resetPasswordFormData = reactive({
  user: authStore.user,
  old_password: '',
  new_password: '',
  check_new_password: '',
})

// 单机修改密码按钮后, 弹出对话框
const toggleResetPasswordForm = () => {
  // 先把数据都清空
  resetPasswordFormData.old_password = ''
  resetPasswordFormData.new_password = ''
  resetPasswordFormData.check_new_password = ''
  // 然后表单可见
  dialogFormVisible.value = true
}

// 定义验证规则
let resetPasswordFormRules = reactive({
  // 字段:[{规则1:规制值1, 错误提示1_message:'', trigger:'blur' 意为当input失焦时进行提示}]
  old_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],

  new_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],

  check_new_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],
})

// 密码修改函数(表单提交按钮的点击事件)
const resetPassword = async () => {
  // 1, 验证密码, 通过form的ref对象.value.validate进行验证
  resetPasswordForm.value.validate(async (valid) => {
    // valid 为真则通过验证
    if (valid) {
      // 通过验证,开始调用authHttp.resetPassword()方法, 详见 authHttp.js
      try {
        await authHttp.resetPassword(
          resetPasswordFormData.new_password,
          resetPasswordFormData.old_password,
          resetPasswordFormData.check_new_password,
        )
        // 执行成功,提示信息,关闭表单对话框
        ElMessage.success('密码修改成功!')
        dialogFormVisible.value = false
      } catch (detail) {
        // 执行失败, 打印服务器返回的错误信息
        ElMessage.error(detail)
      }
    } else {
      // 否则则没有通过验证
      ElMessage.error('密码长度错误!')
      return false
    }
  })
}
</script>

<template>
  <!-- 修改密码表单 -->
  <!-- 这里绑定在 el-dialog 上面的v-model是整个对话框显示与否的属性 -->
  <el-dialog v-model="dialogFormVisible" title="修改密码" width="500">
    <!-- 这里:model就是表单里表单项的具体值了, :rules 则是表单验证规则 ref则是为了用于表单验证的属性 -->
    <el-form :model="resetPasswordFormData" :rules="resetPasswordFormRules" ref="resetPasswordForm">
      <!-- 要想正确展示提示信息, 必须给 el-form-item 写上 prop属性 -->
      <el-form-item label="旧密码" :label-width="formLabelWidth" prop="old_password">
        <el-input type="password" v-model="resetPasswordFormData.old_password" />
      </el-form-item>
      <el-form-item label="新的密码" :label-width="formLabelWidth" prop="new_password">
        <el-input type="password" v-model="resetPasswordFormData.new_password" />
      </el-form-item>
      <el-form-item label="再输一次" :label-width="formLabelWidth" prop="check_new_password">
        <el-input type="password" v-model="resetPasswordFormData.check_new_password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 返回 </el-button>
        <el-button type="primary" @click="resetPassword"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
```

- 然后完成`~/api/authHttp.js`中的`resetPassword()`方法

```js
const resetPassword = (new_password, old_password, check_new_password) => {
  const path = 'auth/resetpassword'
  return http.put(path, { new_password, old_password, check_new_password })
}

// 记得暴露以供外部调用
export default { login, resetPassword }
```

- **配置请求头**, 同时完成`~/api/http.js`中的`put()`方法

```js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 10000,
    })

    // 配置请求头axios.intercrptors.request.use() :在请求发送出去之前做一些事
    this.instance.interceptors.request.use((config) => {
      // 先把Pinia 里 authStore 这个全局变量存储的token提取出来(其实就是pinia帮我们取localstorage里的token)
      const authStore = useAuthStore()
      const token = authStore.token
      // 然后判断token有没有, 有就交给他
      if (token) {
        config.headers.Authorization = 'JWT' + ' ' + authStore.token
      }
      return config
    })
  }

  // put和post方法一模一样, 只是为了规范(增加:post, 修改:put)而使用put方法封装axios.put()
  // put('url', data对象)
}
```

- 这里我产生了一个疑问, `axios.create()` 里面可以直接配置`headers` 属性, 所以我一开始这么写了

```js
class Http {
  constructor() {
    const authStore = useAuthStore() // 先读取存储的user+token数据
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      timeout: 10000,
      headers: {
        Authorization: 'JWT' + ' ' + authStore.token, // 一开始我在这里给请求头添加 jwt token
      },
    })
  }

  // ...
}
```

- 但是会报错说:""getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?", 意为 `app.use(pinia)` 之前我们就在尝试使用 pinia 存储的数据了. 说白了, 就是无解, 必须使用`axios.interceptors.request.use` 请求拦截器.

> 这个拦截器就像我们在django里配置的中间件一样, django是在请求达到视图前进行登录认证, 这个拦截器实在请求发送出去之前做一些处理.我在里面处理的事情就是配置了请求头

- 最后, 为了代码统一, 在后端把`ResetPasswordView`改一改,原本写的通过`post`改密码,现在改`put`请求了

# 完成考勤功能

> 后端接口已实现

### 前端布局

1. 两个新的视图: `SubAbsent`, `MyAbsent` => 下属的考勤, 自己的考勤, 以`~/src/views/absent/MyAbsent.vue`为例

```vue
<script setup>
// 导入组件OAPageHeader
import OAPageHeader from '@/components/OAPageHeader.vue'
</script>

<template>
  <!-- 使用 el-space 实现内部块级元素自动产生相同间距 -->
  <!-- style="width" => 宽度为当前父元素的100%,  -->
  <!-- direction="vertical" => 设置的是垂直间距 -->
  <!-- fill="true" => 内部子元素的宽度占满父元素 -->
  <!-- :size="15" => 间距大小 -->
  <el-space style="width: 100%" direction="vertical" fill="true" :size="15">
    <!-- 导入其他组件时,给props传递参数, 其余代码详见组件部分 -->
    <OAPageHeader content="个人考勤"></OAPageHeader>
    <el-card style="text-align: right">
      <el-button type="primary">
        <el-icon><Plus /></el-icon>
        <span>发起考勤</span>
      </el-button>
    </el-card>
  </el-space>
</template>

<style scoped></style>
```

2. 组件化提高代码的复用性(props实现组件间参数传递), 新建`~/src/components/OAPageHeader.vue`, 这个组件在所有页面都充当头部

```vue
<script setup name="OAPageHeader">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

// 传递参数显示不同的内容, 就需要使用到 defineProps({'key': '默认值', ...})
// 在其他视图渲染该组件时, 为了展现不同的内容, 只需要给指定的key传递想要的值即可
let props = defineProps({
  content: '',
})

// 实现路由跳转功能
const router = useRouter()
const goBack = () => {
  // router.go(-1) 返回上一个路由
  router.go(-1)
}
</script>

<template>
  <el-page-header @back="goBack" title="返回">
    <template #content>
      <span class="text-large font-600 mr-3"> {{ props.content }} </span>
    </template>
  </el-page-header>
</template>

<style scoped></style>
```

3. 配置路由, `~/src/router/index.js`

```js
// ...

// 导入路由
import MyAbsent from '@/views/absent/MyAbsent.vue'
import SubAbent from '@/views/absent/SubAbent.vue'

// ...
routes: [
  {
    path: '/',
    name: 'frame',
    component: FrameView,
    // 子路由: 这些视图都在FrameView即页面框架内的主体部分被渲染
    children: [
      {
        path: 'absent/my',
        name: 'myabsent',
        component: MyAbsent,
      },
      {
        path: 'absent/sub',
        name: 'subabsent',
        component: SubAbent,
      },
    ],
  },
  // ...
]
```

4. 在框架视图`~/src/views/main/FrameView.vue`中,侧边栏绑定路由链接,在主体部分声明路由出口

```html
<!-- 首先要给 el-menu 声明,告诉它:你是一个导航菜单 :router="true" -->>
<!-- 然后给其内部的item声明路由要去的地址(相当于超链接) -->
<el-menu ...其他属性 :router="true">
  <el-sub-menu index="1">
    <template #title>
      <el-icon><Checked /></el-icon>
      <span>考勤管理</span>
    </template>
    <!-- :route="{ name:'指定的路由名称' }" -->
    <el-menu-item index="1-1" :route="{ name: 'myabsent' }">
      <el-icon><Avatar /></el-icon>
      <span>个人考勤</span>
    </el-menu-item>
    <el-menu-item index="1-2" :route="{ name: 'subabsent' }">
      <el-icon><Finished /></el-icon>
      <span>下属考勤</span>
    </el-menu-item>
  </el-sub-menu>
</el-menu>
<!-- ... -->
<!-- 最后在主体部分声明路由出口,即告诉vue,我点哪个路由,你就找到哪个视图的内容渲染在这里 -->
<el-main class="main">
  <router-view></router-view>
</el-main>
```

5. 完善和美化一下`FrameView`, 略

# 新建考勤

> 开发日志已经太长了, 接下来我决定不再在文档内展示源代码, 而是提供思路或者尽量简单的参考代码

### 视图\_setup

1. 采用对话框实现表单,在修改密码部分已经实现过:
   - `<el-dialog v-model="展示与否" title="对话框标题" width="给对话框指定宽度">`
   - 里面包`<el-form :model="表单数据" :rules="表单验证规则" ref="用于表单验证的变量">`
   - 其余的知识点在 4 5 6
2. 利用生命周期函数获取请假类型和审批人
   - 导入`onMounted` 并使用, 在组件挂载成功后, 自动请求后台接口, 获得数据.
   - `~/src/api/absentHttp.js` 封装了 `http.js`, 后者具有极强的参考意义
   - 在后去审批者部分, 我用了`Object.assign(obj1, obj2)`函数, 该函数将枚举obj2的keys给obj1, obj1有的字段将被赋值为obj2的对应字段.
3. 表单验证规则配置为一个`reactive`变量.
   - 规则是`字段名作为reactive对象的属性名: 值为一个数组`
   - 该数组又包多个对象作为规则:`{规则, 提示信息message, 提示信息显示条件trigger}`

### 视图\_template

4. 遍历请假类型数组, 展示为option

   - 通过`<el-option>`展示数据,它需要指定以下属性
   - 先要告诉它遍历哪个数组:`v-for="absent_type in absent_types"`
   - `:label="absent_type.name"` 选项展示在外面的名字
   - `:value="absent_type.id"` 实际提交出去的值
   - `:key="absent_type.id"` 使用v-for就建议指定`:key`, 这是Vue底层追踪该元素的标记,有了这个属性 Vue 会极大提高渲染效率

5. 日期选择器 Element-plus.DatePicker

   - 为了显示中文, 需要汉化, 参考 `main.js` 中使用ElementPlus时, 指定`locale: zhCn`
   - 通过`<el-date-picker>`展示日期选择器, 该标签可以指定以下属性
   - `type="daterange"` 将会出现两个时间选择的input
   - 如果类型是`daterange`,那么`v-model="createAbsentdFormData.date_range"`绑定的这个属性将是一个带有两个时间的数组
   - `range-separator="到"` 两个时间中间哪个字是
   - `start-placeholder="起始日期"`, `end-placeholder="结束日期"` 两个input的占位文字
   - `format="YYYY-MM-DD"` 显示格式
   - `value-format="YYYY-MM-DD"` 提交表单后,表单内的数据格式

   > 有一个小问题忘了说:`</el-form-item>`里面需要直接包`<el-date-picker>`, 而不能在两者之间套一个`div`,(form-item包div包date-picker) 否则会导致表单验证提示显示不正常, 即使选择了时间, 还是显示没有选择时间的错误提示信息.

6. 审批人:只读,禁止修改,值进行条件判断
   - 这个input标签只展示,只读且不可用,内部展示的值通过条件判断后进行渲染
   - 需要指定以下属性达成上面的要求:
   - `:value="responder.realname ? responder.department.name + '-' + responder.realname : '无'"` 值 = 如果responder有realname ? 那么展示审批人的姓名和部分 : 没有则展示'无'
   - `disabled` 禁用
   - `readonly="true"` 只读

> 在测试过程中,我发现`LoginView`里邮箱的正则表达式有问题,谷歌邮箱就可以用`.`组成邮箱域名,所以修改正则表达式为`let emailRgx = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9])+/`

### 提交表单

- `POST`请求url:`/absent/`, 实现新增考勤数据, 封装在`absentHttp.js`中,函数接收一个参数,就是清理好的数据,函数内配置请求地址,再给`http.post()`传入地址和数据`(path, data)`,对path进行post请求
- 表单数据验证就是用`ref`定义的数据,调用`.value.validate()`方法,该方法接收一个匿名回调函数,匿名回调函数接收两个参数`(valid, fields)`
  - 第一个布尔值, 真为数据校验通过
  - 第二个是错误提示信息对象,可以这样遍历出错误信息
  ```js
  for (let key in fields) {
    ElMessage.error(fields[key][0]['message'])
  }
  ```

### 数据展示

- 生命周期函数`onMounted`页面挂载时`GET`请求`/absents/`,即`AbsentViewSet.list`接口
- 用`absents`接收,在模板遍历

  - 用`<el-table :data="absents">` 进行遍历
  - 大多数数据通过指定prop属性即可获取(data.prop)`<el-table-column prop="title" label="标题" />`
  - 审批人永远不变, 且不同通过`absents`即上面的data获取,可以直接展示`responder`
  - 考勤发起时间格式化:新建`~/src/util/timeFormatter.js`并导入在`MyAbsent.vue`中,然后通过模板匿名插槽进行实现

  ```html
  <el-table-column label="申请时间">
    <template #default="scope">
      <span> {{ timeFormatter.stringFromDateTime(scope.row.create_time) }} </span>
    </template>
  </el-table-column>
  ```

  > 通过`scope.row.propKeyName`即可获取当前行的指定属性值

  - 状态同理,插槽内还可以进行判断,确认渲染的元素

  ```html
  <el-table-column label="状态">
    <template #default="scope">
      <el-tag type="info" v-if="scope.row.status == 1">审核中</el-tag>
      <el-tag type="success" v-if="scope.row.status == 2">已同意</el-tag>
      <el-tag type="error" v-if="scope.row.status == 3">已拒绝</el-tag>
    </template>
  </el-table-column>
  ```

### 数据分页

> 前面后端的代码没有分页, `AbentViewst.list` 直接返回所有数据, 现在修改了.

- 修改后,传回来的数据变了, 带有`count`总页数和`results`全部结果,逻辑变成
- `onMounted`首次挂载获取第1页数据
- 监听`page`属性,每次`page`变化都请求一次服务器获取新数据并渲染
- 所以把从服务器获取数据抽离出来,封装成一个单独的函数,分别在`onMounted`和`watch`中调用
- 模板部分使用`<el-pagination>`渲染分页器, 属性如下
  - `:total="pagination.total"` 总页数(从服务器返回回来的数据`.count`中获取)
  - `:page-size="5"` 一页多少条数据, 务必和后端配置保持一致
  - `v-model:current-page="pagination.page"` 一定要告诉Vue当前的页数

### 下属考勤页面

- 获取下属考勤数据`getSubAbsents()`写在`~/src/api/absentHttp.js`中, 也就是path改变了
- 视图`~/src/views/SubAbsent.vue`和`MyAbsnet`大差不差.
- 模板上,通过`<el-table>`指定总宽度,再分别给`<el-table-column>`指定宽度, 同时给首位列指定`fiexd`, `fixed="right"`属性, 实现表格总宽度锁定, 首位列不动.
  > 修修补补页面, 使其更加美观
- 模板上,通过`<el-tooltip>`来实现带提示信息的按钮

```html
<!-- content="提示内容" plecement="提示信息出现位置" effect="样式要么light, 要么dark" -->
<el-tooltip content="同意" placement="top" effect="light">
  <el-button type="success">
    <el-icon><Check /></el-icon>
  </el-button>
</el-tooltip>
```

### 封装重复代码

- 抽取重复代码封装为组件 `~/src/components/`
  - 主体`OAMain.vue`
  - 分页`OAPagination.vue`
  - 表单对话框`OADialog.vue`
- 以`OADialog`为典型案例: 其需要变化的只有:1标题, 2表单, 3提交事件

```vue
<script setup>
import { defineProps, defineModel, defineEmits } from 'vue'

// 定义v-model: 是否展示对话框, 由外面决定所以要用 v-model进行绑定
let dialogVisible = defineModel({ required: true })

// 定义props: 由外面传入参数
let props = defineProps({
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '500',
  },
})

// 定义事件
const emits = defineEmits(['cancel', 'submit'])

// 定义内部函数
const onCancel = () => {
  // 当调用内部的 onCancel() 函数时候, 先将对话框隐藏
  dialogVisible.value = false
  // 再执行外部通过 @cancel="指定函数" 指定的函数
  emits('cancel')
}

const onSubmit = () => {
  // @submit="调用父组件指定的函数"
  emits('submit')
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="props.title" :width="props.width">
    <!-- 声明匿名默认插槽,待外部填充 -->
    <slot></slot>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel"> 返回 </el-button>
        <el-button type="primary" @click="onSubmit"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
```

- 在父组件调用该组件:
  1. `<script>`中引用: `import OADialog from '@/components/OADialog.vue'`
  2. `<template>`中填充内容,并且传参: `<OADialog v-model="dialogFormVisible" title="发起考勤" @submit="createAbsent">`

### 考勤处理

1. 搞个对话框包表单
2. 点击"同意" / "拒绝" 打开表单,同时做以下事情:
   - 将当前循环到的数据的id传进来
   - 根据"同意"/"拒绝"赋予不同的status值(1审核2同意3拒绝)
   - 根据"同意"/"拒绝"展示不同的标题以及不同的label上的字
3. 提交按钮绑定函数, 访问`absentHttp.requestHandleAbsent(id, data)`方法
   - 以`PUT`请求DRF视图集API时候, URL里必须要有id:`.../absent/id/`
   - 所以该方法内要拼接path : `` const path = `absent/${id}/` ``
   - 请求成功,刷新页面
   ```js
   setTimeout(() => {
     window.location.reload()
   }, 1000)
   ```

> 两个坑, 1是以`reactive()`定义的数据, 在`<script>`标签里访问,也不用`.value`, 所以作为参数传递时:
> `await absentHttp.requestHandleAbsent(absentId, handleAbsentFormData)` 即可

> 2是, django 框架不作任何配置, 所有的url都必须以`/`结尾, 所以 `absent/${id}/` 最后也要有个'撇'

### 考勤列表状态筛选

1. 后端根据路由地址里的参数params中的`who`进行首次筛选后,对结果直接进行二次筛选,同样根据路由地址里的`status`
2. 整合并完善前端函数, 将`getMyAbsents`和`getSubAbsents`两个函数合并为一个函数

```js
const requestAbsents = (who = 'my', page = 1, status = false) => {
  let path = ''
  if (status) {
    path = `absent/?who=${who}&page=${page}&status=${status}`
  } else {
    path = `absent/?who=${who}&page=${page}`
  }
  return http.get(path)
}
```

> 通过配置参数默认值, 实现 `status` 非必传参数的功能

3. 前端增加按钮, 略

> 踩到一个坑, 想设置`<el-card>`中的元素两端对齐, 直接写style没用, 索性给里面再写个div, div包两个子div, 给父div设置样式`display: flex; justify-content: space-between;`

4. 又一个坑, 不能直接在`<el-tag>`上面加判断, Vue会给出警告(虽然不影响正常运行),为此只有外面套一个`<span>`对其进行`v-show`判断

5. 还有一个坑, 查询所有状态下的考勤, 列表返回2页数据, 换到第二页, 再点击筛选器, 哦豁! 页码不可用, 所以每次换页的时候, `page=1` 从第1页开始

# 通知

### 搭架子配路由

1. 新建`~/src/views/inform/`以及内部的三个视图`CreateInform.vue`, `InformList.vue`, `InformDetail.vue`
2. 配路由 `~/src/router/index.js`在`frame`主路由里面配子路由
3. `~/src/views/main/FrameView.vue`的模板部分绑定链接

### 创建页面

> 在执行`npm run dev` 时, 出现了一个提示:说`defineModel, defineEmits`不再需要被导入了

> 前面的页面还有bug, 就是label-width写错了, 现在直接改成`:label-width="80"`

1. 一个表单
2. 在表单中集成 `wangEditor`
   - 安装`npm install @wangeditor/editor-for-vue@next --save-dev`
   - 集成进项目<a href="https://www.wangeditor.com/v5/for-frame.html#vue3">参考文档</a>
3. 完整的代码(包括图片上传功能)

```vue
<script setup>
// 导包
import OAMain from '@/components/OAMain.vue'
import { ref, reactive, onBeforeUnmount, shallowRef, onMounted } from 'vue'
// 下面两条是wangEditor相关的
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import staffHttp from '@/api/staffHttp'
import { useAuthStore } from '@/stores/auth'
import informHttp from '@/api/informHttp'

const authStore = useAuthStore()

// 获取部门数据
let departments = ref([])
onMounted(async () => {
  try {
    departments.value = await staffHttp.getDepartments()
  } catch (detail) {
    ElMessage.error(detail)
  }
})

// 表单
let createInformForm = ref()
let createInformFormData = reactive({
  title: '',
  content: '',
  department_ids: [],
})

const createInformFormRules = reactive({
  title: [
    { required: true, message: '必须填写通知标题', trigger: 'blur' },
    { min: 2, max: 20, message: '标题最少2个字,最多20个字', trigger: 'blur' },
  ],
  // 没办法, wangEditor不填内容就是"<p><br></p>", 填一个字符1就是"<p>1</p>", 所以不能少于17个字符, 一对p标签就是7个字
  // 再加上10个字的内容
  // 就是做不了required必填验证
  content: [{ min: 17, message: '必须填写通知内容!且不少于10个字', trigger: 'blur' }],
})

/**
 * wangEditor
 */
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 编辑器-工具栏配置
const toolbarConfig = {
  // 排除的功能: 视频组 和 全屏功能
  excludeKeys: ['group-video', 'fullScreen'],
}
// 编辑器-内容区域配置
const editorConfig = {
  // 占位提示
  placeholder: '请输入内容...',
  // 具体配置
  MENU_CONF: {
    // 图片上传功能
    uploadImage: {
      // 1, 上传的地址
      server: import.meta.env.VITE_BASE_URL + '/image/upload/',
      // 2, 上传过去的图片的key, 和后端序列化里设置的变量名必须一样
      fieldName: 'image',
      // 3, 前端图片大小校验, 单位b, 最大1mb
      maxFileSize: 1 * 1024 * 1024,
      // 4, 可以批量上传几张?
      maxNumberOfFiles: 10,
      // 5, 允许的图片烈性
      allowedFileTypes: ['image/*'],
      // 6, 配置请求头
      headers: {
        Authorization: 'JWT ' + authStore.token,
      },
      // 7, 自定义后端上传成功后, 前端进行展示的参数
      customInsert(res, insertFn) {
        if (res.errno == 0) {
          // 必须配置图片地址为绝对地址, 否则端口是5173(VUE的), 而非8000(django的)
          let url = import.meta.env.VITE_BASE_URL + res.data.url
          let alt = res.data.alt
          let href = import.meta.env.VITE_BASE_URL + res.data.href
          insertFn(url, alt, href)
        } else {
          ElMessage.error(res.message)
        }
      },
      // 上传失败时执行
      onFailed() {
        ElMessage.error('图片上传失败!')
      },
      // 出现错误时执行
      onError() {
        ElMessage.error('图片上传失败!')
      },
    },
  },
}
// wangEditor的模式, 直接default
let mode = 'default'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

// 提交表单
const onSubmit = async () => {
  createInformForm.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        let inform = await informHttp.createInform(createInformFormData)
        ElMessage.success('通知发布成功')
        setTimeout(() => {
          console.log(inform)
          // 一秒钟以后跳转到详情页, 待完成....
        }, 1000)
      } catch (detail) {
        ElMessage.error(detail)
      }
    } else {
      for (let key in fields) {
        ElMessage.error(fields[key][0]['message'])
      }
      return false
    }
  })
}
</script>

<template>
  <OAMain title="发布通知">
    <el-card style="width: 1000px">
      <!-- el-card头部插槽 -->
      <template #header>
        <h1 style="text-align: center">发布通知</h1>
      </template>
      <!-- el-card默认插槽(身体部分) -->
      <el-form
        :model="createInformFormData"
        :rules="createInformFormRules"
        ref="createInformForm"
        :label-width="100"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input type="text" v-model="createInformFormData.title" />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <div style="border: 1px solid #ccc; width: 100%">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <!-- wangEditor的内部部分, 以v-model绑定表单的content属性 -->
            <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="createInformFormData.content"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        <el-form-item label="可见部门">
          <el-checkbox-group v-model="createInformFormData.department_ids">
            <el-tooltip
              content="注意: 所有部门被勾选时, 即使勾选了其他部门也被视为所有部门可见!"
              placement="top"
              effect="light"
            >
              <el-checkbox label="所有部门" :value="0" />
            </el-tooltip>
            <el-checkbox
              v-for="department in departments"
              :label="department.name"
              :value="department.id"
              :key="department.id"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="primary" class="create-inform-submit-button" @click="onSubmit">
            提交
          </el-button>
        </div>
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.create-inform-submit-button {
  margin-bottom: 20px;
  width: 100px;
  height: 40px;
}
</style>
```

- 前端有1个问题:`~/.env.development`配置文件中`VITE_BASE_URL = 'http://localhost:8000/'`地址最后的`/`会导致wangEditor上传的图片地址编程`http://localhost:8000//media/图片地址`, 经发现,删除`/`后, 不影响`http.js`里`axios.baseURL`
- 后端有2个:1是没有给图片配置上路由, 2是中间件拦住了前端访问wangEditor在编辑页访问自己上传进去的图片, 解决参考后端部分

4. 新建`~/src/api/informHttp.js`, 完成提交按钮引发的发布功能, 略

### 列表页面

1. 导入复用组件
2. 写好模板: 插入组件, 写好`<el-table>`
3. 在`informHttp.js`中完成请求方法`requestInform()`,拼接好路由后, 让它调用`http.js.get()`获取数据
4. 回到列表页, setup中写好获取数据的方法`getInform`, 然后在生命周期函数`onMounted`中调用一次, 同时用`watch`监听页码的变化, 每次变化再调用一次, 实现获取数据并分页
5. 渲染几乎没有难点, 基本数据直接在`el-table-column`上生命`props`, 复杂逻辑就在`el-table-column`里写一个`<template #default="scope">`,再在这个插槽内用`scope.row`获取当前行的数据
6. 路由配置有问题, 详情页后面应该传参, `~src/router/index.js`中关于informdetail,即详情页的路由应该是`path: 'inform/detail/:pk',`

### 删除通知

1. 删除按钮点击后弹出`ElMessageBox.confirm`确认是否删除
   - 自定义提示内容可以引用`h`后进行配置`import { ..., h } from 'vue'`, 示例:
   ```js
   ElMessageBox.confirm(
     h('div', null, [
       h('p', null, `标题为:【${data.title}】`),
       h('p', null, `发布时间是:【${timeFormatter.stringFromDateTime(data.create_time)}】`),
       h('p', { style: 'color:red;' }, '确认删除?'),
     ]),
     {
       //其他配置
     },
   )
   ```
2. 通过`.them()` 确定按钮点击后实行真正的删除操作
   - 在`/src/api/http.js`中新建`delete`函数, 用于以`DELETE`方式请求后端服务器
   - 在`informHttp.js`中新建`deleteInform(id)`函数, 拼接好`path`后调用`http.delete()`
   - 在`~/src/views/InformList.vue`中, `ElMessageBox.confirm().then()`里面调用`informHttp.deleteInform(id)`函数, 根据id删除数据库中的数据
   - 列表展示页上的删除按钮绑定的点击事件是可以传递参数的, 在模板上用`@click="onDelete(scope.row)`直接将整行数据传递过来
3. 后端部分需要完善逻辑: 要删除某条通知, 要求必须发布者(author)是自己才行, 参考后端.

### 通知详情

1. `infromHttp.js` 新建方法`requestInformDetail(id)` 通过传入的id拼接正确的path, 再以get请求
2. 给`informList.vue`通知列表页绑定好路由
   - 标题
   - 查看详情按钮
   - `<router-link:to="{ name: 'informdetail', params: { pk: scope.row.id } }">`
     > {name: '路由名称参考index.js'}
     > {..., params: {key: value} }
3. 在`InformDetail.vue`中进行以下步骤
   1. 获取url里传过来的参数pk:`route.params.pk`
      > 记得引用router`import { useRoute } from 'vue-router'`, 然后实例化`route = useRoute()`
   2. `onMounted`调用`infromHttp.js.requestInformDetail(id)`, 传入`route.params.pk`作为`(id)`, 获取详情
   3. 有个莫名奇妙的问题: 似乎只能读取一层数据? 如果我读取`inform.author.realname`会报错! 那没关系, 我直接把这些数据用新的响应式变量存储即可:`author.value = inform.value.author.realname`
      > 后来我修改了代码, 将变量存储为reactive, 并且将变量定义的与所需要的数据格式一一对应, 最后用`Object.assign(inform, informData)`将后者数据写入前者
   4. 渲染页面
4. 完成`createInform.vue`里的`onSubmit()`, 提交后, 自动跳转到详情页`router.push({ name: 'informdetail', params: { pk: inform.id } })`
5. 填坑: 前后端都没有校验可见部门, 有两种处理逻辑:
   - 要么不选, 前端提交的ids为`[]` 时, 自动公开, 自动所有部门可见
   - 要么强制要求选, 不选前端报错, 后端`raise exceptions.ValidationError()`
     > 我用的第二种, 判断逻辑非常简单, 就是判断数组长度是否为0即可.前端:`arr.length == 0`, 后端`len(arr)`
6. 补充一个知识点: 富文本编辑器的内容都是由html标签组成的, 所以没有任何样式的`123`存进数据库里其实是`<p>123</p>`, 为了将他展示成本来的样子,就需要使用`v-html`,比如 `<div v-html="inform.content"></div>`

### 阅读量

1. 阅读一次底层自动增加阅读量, 以及前端展示阅读量
   - `informHttp.js`新增`readInform`函数, 函数通过路由`../inform/onread/`调用后台接口`InformReadView`
   - 在`InfromDetail.vue`中,`onMounted()`时,调用`readInform()`, 实现阅读量的自动增长
2. 在列表页,通过判断`.been_read`的长度,展示已读未读.

   > 在后端完成序列化嵌套后, 前端就有相应的只读字段了. 通过判断该字段的长度即可实现确认数据是否已读

   - 我写了个函数`checkRead()`,传入当前行的been_read数据,判断长度,返回真假
   - 标题前是否展示红色感叹号?`<span v-if="checkRead(scope.row.been_read)" style="color: red">!</span>`

   > element-plus 提供了`badge`组件可以实现同样的效果:`<el-badge v-if="checkRead(scope.row.been_read)" is-dot class="item">标题放里面</el-badge>`, 但这是OA项目, 加上我讨厌红点, 所以我决定用我的方式实现更简洁的效果: 未读前面有个红色的小感叹号

# 员工管理模块

### 搭架子

1. 两个新视图, 新增员工`~/src/views/staff/CreateStaff.vue`, 员工列表`StaffList.vue`
2. 在`~/src/router/index.js`中配置路由
3. 在`FrameView.vue`中给侧边栏导航绑定路由

### 新增员工

1. 表单, 略.
