<template>
  <div>
    <!-- 查询栏：导诊台是拿着手机号来找人的，所以只留这一个条件 -->
    <el-form inline @submit.prevent>
      <el-form-item label="患者手机号">
        <el-input
          v-model="phone"
          placeholder="11 位手机号"
          clearable
          style="width:200px"
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onSearch">查询</el-button>
      </el-form-item>
    </el-form>

    <!-- 记录表格：字段名和接口返回一一对应。
         doctorName / shiftDate / timeSlot 是后端 JOIN 出来的，不是本表字段 -->
    <el-table :data="pageData" border v-loading="loading" empty-text="没有查到记录">
      <el-table-column prop="patientName" label="患者姓名" width="110" />
      <el-table-column prop="patientPhone" label="手机号" width="130" />
      <el-table-column prop="doctorName" label="医生" width="110" />
      <el-table-column prop="shiftDate" label="就诊日期" width="130" />
      <el-table-column prop="timeSlot" label="时段" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '已预约' : '已取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="预约时间" min-width="160" />
    </el-table>

    <!-- 分页：接口一次把这人所有记录都返回了，所以先在前端切页。
         如果哪天单个人的记录上千条，这里要改成后端分页，把 page/size 传给接口 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="records.length"
      layout="total, prev, pager, next"
      style="margin-top:16px"
      hide-on-single-page
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listByPhone } from '../../api/reserve'

const phone = ref('')
const records = ref([])     // 接口返回的全量记录
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 10

// 表格只渲染当前页这 10 条，避免一次塞几百个 DOM 节点
const pageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return records.value.slice(start, start + pageSize)
})

// 手机号规则和后端 @Pattern 保持一致：先在前面挡一道，省掉一次注定失败的请求
const isValidPhone = (v) => /^1[3-9]\d{9}$/.test(v)

const onSearch = async () => {
  if (!isValidPhone(phone.value)) {
    ElMessage.warning('请输入正确的 11 位手机号')
    return
  }
  loading.value = true
  try {
    const res = await listByPhone(phone.value)
    records.value = res.data.data || []   // 查不到时后端返回空数组，不是报错
    currentPage.value = 1                 // 换了查询条件，页码回到第一页
  } finally {
    loading.value = false
  }
}
</script>
