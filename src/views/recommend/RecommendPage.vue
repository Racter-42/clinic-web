<template>
  <div>
    <el-card>
      <template #header>智能导诊：描述症状，AI 推荐科室</template>
      <el-input v-model="symptom" type="textarea" :rows="3"
                placeholder="例如：最近总是头晕、乏力，持续一周了……"
                style="margin-bottom:12px" />
      <el-button type="primary" :loading="loading" @click="onSubmit">获取推荐</el-button>
    </el-card>

    <!-- 推荐结果：后端返回的 data 就是一段文案 -->
    <el-card v-if="result" style="margin-top:16px">
      <template #header>推荐结果</template>
      <div style="white-space:pre-wrap">{{ result }}</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { recommend } from '../../api/recommend'

const symptom = ref('')
const result = ref('')
const loading = ref(false)

const onSubmit = async () => {
  if (!symptom.value.trim()) {
    ElMessage.warning('先描述一下症状')
    return
  }
  loading.value = true
  result.value = ''
  try {
    const res = await recommend(symptom.value)
    result.value = res.data.data
  } finally {
    loading.value = false // AI 接口可能较慢，失败时拦截器会弹提示
  }
}
</script>
