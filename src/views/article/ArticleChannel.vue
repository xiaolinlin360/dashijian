<script setup>
import { ref, onMounted } from 'vue'
import { artGetChannelsService, artDeleteChannelService } from '@/api/article'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import ChannelEdit from './components/ChannelEdit.vue'

const channelsList = ref([])
const loading = ref(false)
const dialog = ref()
const getChannelsList = async () => {
  loading.value = true
  try {
    const res = await artGetChannelsService()
    channelsList.value = res
  } catch (error) {
    ElMessage.error(error.message)
    console.log(error)
  } finally {
    loading.value = false
  }
}
const onEditChannel = (row) => {
  dialog.value.open(row)
}
const onDeleteChannel = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await artDeleteChannelService(row.id)
    ElMessage.success('删除成功')
    getChannelsList()
  } catch (error) {
    ElMessage.error('您已取消删除或删除失败')
    console.log(error)
  }
}
const onAddChannel = () => {
  dialog.value.open({})
}
const onSuccess = () => {
  getChannelsList()
}
onMounted(() => {
  getChannelsList()
})
</script>
<template>
  <page-container title="添加分类">
    <template #extra>
      <el-button type="primary" @click="onAddChannel">添加分类</el-button>
    </template>
    <el-table :data="channelsList" stripe style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="100" />
      <el-table-column label="创建时间">
        <template #default="{ row }">
          {{ row.created_at?.split('T')[0] || '---' }}
        </template>
      </el-table-column>
      <el-table-column prop="cate_name" label="分类名称" />
      <el-table-column prop="cate_alias" label="分类别名" />
      <el-table-column label="操作" width="120">
        <template #default="{ row, $index }">
          <el-button
            @click="onEditChannel(row, $index)"
            type="primary"
            :icon="Edit"
            circle
            plain
          ></el-button>
          <el-button
            @click="onDeleteChannel(row, $index)"
            type="danger"
            :icon="Delete"
            circle
            plain
          ></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>
    <ChannelEdit ref="dialog" @success="onSuccess"></ChannelEdit>
  </page-container>
</template>
<style scoped lang="scss"></style>
