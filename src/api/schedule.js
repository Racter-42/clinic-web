import request from './request'

// 新增排班：body 是 { doctorId, shiftDate, shiftType }
// shiftType：1 上午 / 2 下午 / 3 晚班；重复排班会被后端唯一索引拦下
export const addSchedule = (data) => request.post('/schedule/add', data)

// 按科室 + 未来天数查排班，返回带医生名、科室名的 VO 列表
export const queryByDept = (deptId, days = 7) =>
  request.get('/schedule/queryByDept', { params: { deptId, days } })
