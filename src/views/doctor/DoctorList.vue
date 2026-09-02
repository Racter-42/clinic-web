<template>
  <div>
    <!-- 顶部统计卡片：各科室在岗医生数 -->
    <el-row :gutter="16" style="margin-bottom:16px">
      <el-col v-for="item in deptStats" :key="item.deptId" :span="6">
        <el-card>
          <div>{{ item.deptName || '未分配科室' }}</div>
          <div style="font-size:28px;font-weight:bold">{{ item.doctorCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-button type="primary" style="margin-bottom:12px" @click="openDialog()">新增医生</el-button>

    <!-- 医生列表（后端实体只有这 4 个字段） -->
    <el-table :data="doctors" border v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="title" label="职称" />
      <el-table-column prop="licenseNo" label="执业证号" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑共用弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑医生' : '新增医生'" width="420px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="执业证号" prop="licenseNo">
          <el-input v-model="form.licenseNo" :disabled="!!form.id" placeholder="15 位数字" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listDoctors, addDoctor, updateDoctor, deleteDoctor, countByDept } from '../../api/doctor'

const doctors = ref([])   // 医生列表
const deptStats = ref([]) // 科室统计卡片数据
const loading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const emptyForm = { id: null, name: '', title: '', licenseNo: '' }
const form = reactive({ ...emptyForm })

// 校验规则和后端 Doctor 实体上的注解保持一致
const rules = {
  name: [{ required: true, message: '医生姓名不能为空', trigger: 'blur' }],
  title: [{ required: true, message: '职称不能为空', trigger: 'blur' }],
  licenseNo: [
    { required: true, message: '执业证号不能为空', trigger: 'blur' },
    { pattern: /^\d{15}$/, message: '执业证号应为 15 位数字', trigger: 'blur' }
  ]
}

// 加载列表 + 统计，两个请求一起发
const loadData = async () => {
  loading.value = true
  try {
    const [listRes, countRes] = await Promise.all([listDoctors(), countByDept()])
    doctors.value = listRes.data.data
    deptStats.value = countRes.data.data
  } finally {
    loading.value = false
  }
}

// 打开弹窗：传了行数据就是编辑，否则是新增
const openDialog = (row) => {
  Object.assign(form, row ? { ...row } : { ...emptyForm })
  dialogVisible.value = true
}

// 提交：新增和编辑走不同接口。成功返回纯字符串"成功"，只要 HTTP 2xx 就算成功
const onSubmit = async () => {
  try {
    await formRef.value.validate() // 校验不过会抛异常，红字提示已显示
  } catch {
    return
  }
  if (form.id) {
    await updateDoctor(form)
  } else {
    await addDoctor(form)
  }
  ElMessage.success('操作成功')
  dialogVisible.value = false
  loadData()
}

// 删除：先弹确认框
const onDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除医生「${row.name}」吗？`, '提示', { type: 'warning' })
  } catch {
    return // 用户点了取消
  }
  await deleteDoctor(row.id)
  ElMessage.success('删除成功')
  loadData()
}

onMounted(loadData)
</script>
