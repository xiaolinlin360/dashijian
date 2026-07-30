<script setup>
import { ref, onMounted } from 'vue'
import { artGetChannelsService } from '@/api/article'
import { ElMessage } from 'element-plus'

const channelsList = ref([])
const getChannelsList = async () => {
  try {
    const res = await artGetChannelsService()
    channelsList.value = res
    console.log(channelsList.value)
  } catch (error) {
    ElMessage.error(error.message)
    console.log(error)
  }
}
onMounted(() => {
  getChannelsList()
})
</script>
<template>
  <page-container title="添加分类">
    <template #extra>
      <el-button type="primary">添加分类</el-button>
    </template>
    hhhhhhhhhhhhhhhhhhhhhhh
  </page-container>
</template>
<style scoped lang="scss"></style>
