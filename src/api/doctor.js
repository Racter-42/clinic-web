import request from './request'

// 医生列表（标准 Result，列表在 data 里）
export const listDoctors = () => request.get('/doctor/list')

// 下面三个写操作成功时返回纯字符串"成功"，不是 JSON，看 HTTP 2xx 就算成功
export const addDoctor = (data) => request.post('/doctor/add', data)
export const updateDoctor = (data) => request.put('/doctor/update', data)
export const deleteDoctor = (id) => request.delete(`/doctor/delete/${id}`)

// 各科室在岗医生数，返回 [{ deptId, deptName, doctorCount }]
export const countByDept = () => request.get('/doctor/countByDept')
