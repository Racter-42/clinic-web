import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 后端在 8080，且没开 CORS，所以前端不能直连。
// 这里用 vite 自带的代理：把接口前缀开头的请求转发给后端，
// 浏览器看到的是同源（localhost:5173），就不会有跨域问题。
const backend = 'http://localhost:8080'
const prefixes = ['/login', '/doctor', '/schedule', '/source', '/reserve', '/upload', '/uploads', '/api']

const proxy = {}
prefixes.forEach((p) => {
  proxy[p] = { target: backend, changeOrigin: true }
})

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy
  }
})
