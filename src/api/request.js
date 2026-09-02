import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 统一的 axios 实例：所有接口都从这里发，
// 鉴权、报错集中在这一个文件处理，页面里就不用重复写了
const request = axios.create({ timeout: 10000 })

// 发请求前：除了登录和静态图片，其他请求都要在 Header 带上 token
request.interceptors.request.use((config) => {
  const url = config.url || ''
  const noNeedToken = url.startsWith('/login') || url.startsWith('/uploads')
  const token = localStorage.getItem('token')
  if (!noNeedToken && token) {
    config.headers.token = token // 后端拦截器认的就是 Header 里这个 "token" 字段
  }
  return config
})

// 收到响应后：统一处理"401 失效"和"业务错误码"
request.interceptors.response.use(
  (res) => {
    // 后端有几个"非标"接口：登录成功返回纯字符串 token，
    // 医生增删改成功返回纯字符串"成功" —— 字符串直接放行，页面看 HTTP 状态就行
    if (typeof res.data === 'string') return res
    // 标准 JSON 统一是 { code, message, data }，code 不是 0 就是业务失败
    if (res.data && res.data.code !== 0) {
      ElMessage.error(res.data.message || '操作失败')
      return Promise.reject(res.data)
    }
    return res
  },
  (err) => {
    // HTTP 层面的失败：401 说明 token 过期或无效，清掉登录态回登录页
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.error('登录已失效，请重新登录')
    } else {
      ElMessage.error(err.message || '网络异常，请稍后再试')
    }
    return Promise.reject(err)
  }
)

export default request
