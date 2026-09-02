import request from './request'

// 登录：body 是 { username, password }
// 注意：成功返回的是纯字符串 token（text/plain），不是 JSON
export const login = (data) => request.post('/login', data)
