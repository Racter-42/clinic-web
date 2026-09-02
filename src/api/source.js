import request from './request'

// 未来 7 天号源列表（带缓存的接口，可反复调）
// 号源字段：{ id, doctorId, shiftDate, timeSlot, status }，status 0=可约 1=已约走
export const listSources = () => request.get('/source/list')
