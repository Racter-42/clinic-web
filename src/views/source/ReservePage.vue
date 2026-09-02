<template>
  <div>
    <!-- 上半部分：按日期分组的号源卡片 -->
    <el-card style="margin-bottom:16px">
      <template #header>第一步：选择号源（灰色 = 已被约走）</template>
      <el-empty v-if="!dates.length" description="未来 7 天暂无号源" />
      <div v-for="date in dates" :key="date" style="margin-bottom:12px">
        <div style="font-weight:bold;margin-bottom:8px">{{ date }}</div>
        <el-card v-for="s in grouped[date]" :key="s.id" shadow="hover"
                 class="source-card"
                 :class="{ active: selected && selected.id === s.id, disabled: s.status !== 0 }"
                 @click="pick(s)">
          <div>医生：{{ s.doctorName || ('医生#' + s.doctorId) }}</div>
          <div>时段：{{ s.timeSlot }}</div>
          <div>{{ s.status === 0 ? '可预约' : '已约走' }}</div>
        </el-card>
      </div>
    </el-card>

    <!-- 下半部分：患者信息表单 -->
    <el-card>
      <template #header>第二步：填写患者信息并提交</template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" style="max-width:420px">
        <el-form-item label="已选号源">
          <el-input :model-value="selected ? `${selected.shiftDate} ${selected.timeSlot}` : '还没选号源'" disabled />
        </el-form-item>
        <el-form-item label="患者姓名" prop="patientName">
          <el-input v-model="form.patientName" />
        </el-form-item>
        <el-form-item label="手机号" prop="patientPhone">
          <el-input v-model="form.patientPhone" placeholder="11 位手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="onSubmit">提交挂号</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { listSources } from '../../api/source'
import { getReserveToken, submitReserve } from '../../api/reserve'

const sources = ref([])      // 所有号源
const selected = ref(null)   // 当前选中的号源
const reserveToken = ref('') // 防重 token（只能用一次）
const submitting = ref(false)
const formRef = ref()
const form = reactive({ patientName: '', patientPhone: '' })

// 校验规则和后端 @Pattern 保持一致
const rules = {
  patientName: [{ required: true, message: '患者姓名不能为空', trigger: 'blur' }],
  patientPhone: [
    { required: true, message: '患者手机号不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 把号源按日期分组：{ '2026-09-03': [号源...], ... }
const grouped = computed(() => {
  const map = {}
  sources.value.forEach((s) => {
    ;(map[s.shiftDate] = map[s.shiftDate] || []).push(s)
  })
  return map
})
const dates = computed(() => Object.keys(grouped.value).sort())

// 进页面：先拿防重 token，同时拉号源列表
onMounted(async () => {
  const [tokenRes, sourceRes] = await Promise.all([getReserveToken(), listSources()])
  reserveToken.value = tokenRes.data.data
  sources.value = sourceRes.data.data
})

// 点卡片选号源：已被约走的（status 不是 0）不能选
const pick = (s) => {
  if (s.status !== 0) return
  selected.value = s
}

// 提交挂号：后端用 @RequestParam 收参，所以走 URL query 而不是 JSON body
const onSubmit = async () => {
  if (!selected.value) {
    ElMessage.warning('先在上面选一个号源')
    return
  }
  try {
    await formRef.value.validate()
  } catch {
    return // 校验没过，红字已经提示了
  }
  submitting.value = true
  try {
    await submitReserve({
      token: reserveToken.value,
      sourceId: selected.value.id,
      patientName: form.patientName,
      patientPhone: form.patientPhone
    })
    ElMessage.success('预约成功')
    // token 是一次性的，用完重新拿一个；顺手刷新号源（刚约走的会变灰）
    const [tokenRes, sourceRes] = await Promise.all([getReserveToken(), listSources()])
    reserveToken.value = tokenRes.data.data
    sources.value = sourceRes.data.data
    selected.value = null
    form.patientName = ''
    form.patientPhone = ''
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* 只写卡片布局和选中态，外观用 Element 默认 */
.source-card {
  display: inline-block;
  width: 180px;
  margin: 0 8px 8px 0;
  cursor: pointer;
  vertical-align: top;
}
.source-card.active {
  border: 2px solid var(--el-color-primary);
}
.source-card.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
