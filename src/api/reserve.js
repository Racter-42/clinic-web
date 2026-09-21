import request from './request'

// 拿防重 token：进挂号页时调，后端存 Redis 10 分钟，提交一次就作废
export const getReserveToken = () => request.get('/reserve/token')

// 提交挂号。注意！后端用 @RequestParam 收参，所以参数必须走 URL query，
// 不能放 JSON body —— 写法是 post(url, null, { params })
export const submitReserve = (params) => request.post('/reserve', null, { params })

// 按手机号查这位患者约过哪些号（导诊台用），返回的每条记录带医生姓名 / 日期 / 时段
export const listByPhone = (phone) => request.get('/reserve/list', { params: { phone } })
