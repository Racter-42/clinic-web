import request from './request'

// 智能导诊：body 是 { symptom }，返回的 data 就是推荐文案字符串
export const recommend = (symptom) => request.post('/api/recommend', { symptom })
