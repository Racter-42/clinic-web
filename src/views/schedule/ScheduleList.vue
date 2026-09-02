<template>
  <div>
    <!-- 新增排班表单 -->
    <el-card style="margin-bottom:16px">
      <el-form inline :model="form">
        <el-form-item label="医生">
          <el-select v-model="form.doctorId" placeholder="选择医生" style="width:160px">
            <el-option v-for="d in doctors" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="form.shiftDate" type="date" value-format="YYYY-MM-DD"
                          placeholder="选择日期" style="width:160px" />
        </el-form-item>
        <el-form-item label="班次">
          <el-radio-group v-model="form.shiftType">
            <el-radio :value="1">上午</el-radio>
            <el-radio :value="2">下午</el-radio>
            <el-radio :value="3">晚班</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onAdd">新增排班</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 查询条件 + 排班列表 -->
    <el-card>
      <el-form inline>
        <el-form-item label="科室">
          <el-select v-model="query.deptId" placeholder="选择科室" style="width:160px" @change="loadList">
            <el-option v-for="dept in depts" :key="dept.deptId" :label="dept.deptName" :value="dept.deptId" />
          </el-select>
        </el-form-item>
        <el-form-item label="未来天数">
          <el-input-number v-model="query.days" :min="1" :max="30" @change="loadList" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="list" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="doctorName" label="医生" />
        <el-table-column prop="deptName" label="科室" />
        <el-table-column prop="shiftDate" label="日期" />
        <el-table-column label="班次">
          <template #default="{ row }">
            <el-tag>{{ shiftText[row.shiftType] || row.shiftType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本号" width="90" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listDoctors, countByDept } from '../../api/doctor'
import { addSchedule, queryByDept } from '../../api/schedule'

const doctors = ref([]) // 医生下拉选项
const depts = ref([])   // 科室下拉选项（复用统计接口的数据，省得再做一个科室接口）
const list = ref([])    // 排班列表
const loading = ref(false)
const form = reactive({ doctorId: null, shiftDate: '', shiftType: 1 })
const query = reactive({ deptId: null, days: 7 })
const shiftText = { 1: '上午', 2: '下午', 3: '晚班' } // 班次数字 → 文字

// 初始化：拉医生下拉和科室下拉，然后默认查第一个科室
onMounted(async () => {
  const [docRes, deptRes] = await Promise.all([listDoctors(), countByDept()])
  doctors.value = docRes.data.data
  depts.value = deptRes.data.data
  if (depts.value.length) {
    query.deptId = depts.value[0].deptId
    loadList()
  }
})

// 按科室 + 天数查询排班
const loadList = async () => {
  if (!query.deptId) return
  loading.value = true
  try {
    const res = await queryByDept(query.deptId, query.days)
    list.value = res.data.data
  } finally {
    loading.value = false
  }
}

// 新增排班：重复排班（同医生同日期同班次）会被后端唯一索引拦下并提示
const onAdd = async () => {
  if (!form.doctorId || !form.shiftDate) {
    ElMessage.warning('医生和日期都要选')
    return
  }
  await addSchedule(form)
  ElMessage.success('排班成功')
  loadList() // 刷新列表（如果当前科室和医生对得上，新排班就会出现）
}
</script>
