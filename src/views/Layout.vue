<template>
  <el-container style="height:100vh">
    <!-- 左侧菜单：router 模式，点菜单直接跳路由 -->
    <el-aside width="200px">
      <el-menu :default-active="$route.path" router style="height:100%">
        <el-menu-item index="/doctor">医生管理</el-menu-item>
        <el-menu-item index="/schedule">排班管理</el-menu-item>
        <el-menu-item index="/reserve">挂号预约</el-menu-item>
        <el-menu-item index="/recommend">智能导诊</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="topbar">
        <span>诊所管理系统 · 演示台</span>
        <el-button type="danger" plain @click="onLogout">退出登录</el-button>
      </el-header>
      <el-main>
        <!-- 子页面显示在这里 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 退出登录：清掉 token 回登录页
const onLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
}
</style>
