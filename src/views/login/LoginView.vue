<script setup name="login">
import { reactive } from 'vue'
// import axios from 'axios'
import { useCounterStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import authHttp from '@/api/authHttp'

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
    let data = await authHttp.login(form.email, form.password)
    // 写入数据到内存和浏览器存储
    authStore.setUserToken(data.user, data.token)
    // 路由跳转
    router.push({ name: 'frame' })
  } catch (detail) {
    alert(detail)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="title">[myoa]企业管理_登录</h2>
      <form>
        <div class="input-group">
          <label for="email">电子邮件</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="请输入电子邮件"
            required
          />
        </div>
        <div class="input-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="button" class="login-btn" @click="onsubmit">登录</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #6e7dff, #a0c4ff);
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #666;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.input-group input:focus {
  border-color: #6e7dff;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #6e7dff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #5a6bd8;
}
</style>
