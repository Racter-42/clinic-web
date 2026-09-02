<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 style="text-align:center;margin-top:0">诊所管理系统</h2>
      <el-form :model="form" label-width="70px" @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password
                    placeholder="123456" @keyup.enter="onLogin" />
        </el-form-item>
        <el-button type="primary" style="width:100%" :loading="loading" @click="onLogin">
          登 录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api/login'

const router = useRouter()
const form = reactive({ username: 'admin', password: '123456' }) // 演示用，预填好账号
const loading = ref(false)

const onLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('用户名和密码都要填')
    return
  }
  loading.value = true
  try {
    const res = await login(form)
    // 后端登录成功返回的是纯字符串 token（不是 JSON），所以用类型判断成功
    if (typeof res.data === 'string') {
      localStorage.setItem('token', res.data)
      ElMessage.success('登录成功')
      router.push('/')
    }
  } finally {
    loading.value = false // 失败时拦截器已经弹过错误提示了，这里只管关 loading
  }
}
</script>

<style scoped>
/* 只写居中和卡片宽度，外观全部用 Element 默认 */
.login-wrap {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 400px;
}
</style>
