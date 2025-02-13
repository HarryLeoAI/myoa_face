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
