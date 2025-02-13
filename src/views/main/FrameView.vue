<script setup name="frame"></script>

<template>
  <el-container class="container">
    <!-- 侧边栏 -->
    <el-aside class="aside">
      <router-link to="/" class="brand">MyOA</router-link>
      <el-menu
        active-text-color="skyblue"
        background-color="#2b369c"
        class="el-menu-vertical-demo"
        default-active="1"
        text-color="#fff"
      >
        <el-menu-item index="1">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <el-icon><Checked /></el-icon>
            考勤管理
          </template>
          <el-menu-item index="2-1">
            <el-icon><Avatar /></el-icon>
            <span>个人考勤</span>
          </el-menu-item>
          <el-menu-item index="2-2">
            <el-icon><Finished /></el-icon>
            <span>下属考勤</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><BellFilled /></el-icon>
            通知管理
          </template>
          <el-menu-item index="3-1">
            <el-icon><Phone /></el-icon>
            <span>发布通知</span>
          </el-menu-item>
          <el-menu-item index="3-2">
            <el-icon><List /></el-icon>
            <span>通知列表</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            员工管理
          </template>
          <el-menu-item index="4-1">
            <el-icon><CirclePlusFilled /></el-icon>
            <span>新增员工</span>
          </el-menu-item>
          <el-menu-item index="4-2">
            <el-icon><Memo /></el-icon>
            <span>员工列表</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">Header</el-header>
      <!-- 具体内容 -->
      <el-main class="main">Main</el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.container {
  height: 100vh;
  background-color: #edeff1;
}
.aside {
  width: 15%;
  background: linear-gradient(135deg, #a5acf1, #2b369c);
}
.aside .brand {
  display: flex;
  color: #fff;
  text-decoration: none;
  background-color: #1d2151;
  border-bottom: 1px solid black;
  padding: 3px 0 3px 0;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  height: 10%;
}
.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e7e6;
  height: 50px;
}
.el-menu {
  border-right: none;
}
</style>
