<script setup>
import { ref } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import { artGetListService } from '@/api/article'

const formModel = ref({
  pagenum: 1,
  pagesize: 5,
  article_id: 3,
  state: '',
})
const total = ref(0) //文章总数
const articleList = ref([])
const getArticleList = async () => {
  articleList.value = await artGetListService(formModel.value)
  total.value = articleList.value.length
}
getArticleList()
const onEditArticle = (row) => {
  console.log(row)
}
const onDeleteArticle = async (row) => {
  console.log(row)

  // try {
  //   await ElMessageBox.confirm('确认删除吗？', '提示', {
  //     confirmButtonText: '确定',
  //     cancelButtonText: '取消',
  //     type: 'warning',
  //   })
  //   await artDeleteArticleService(row.id)
  //   ElMessage.success('删除成功')
  //   getArticleList()
  // } catch (error) {
  //   ElMessage.error('您已取消删除或删除失败')
  //   console.log(error)
  // }
}
</script>
<template>
  <page-container title="添加文章">
    <template #extra>
      <el-button type="primary">添加文章</el-button>
    </template>
    <el-form
      :model="formModel"
      ref="formRef"
      inline
      style="display: flex; justify-content: space-between"
    >
      <el-form-item prop="article_id" label="文章分类">
        <ChannelSelect v-model="formModel.article_id" />
      </el-form-item>
      <el-form-item prop="state" label="发布状态">
        <el-select v-model="formModel.state" placeholder="请选择发布状态" style="width: 200px">
          <el-option label="已发布" value="1"></el-option>
          <el-option label="草稿" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getArticleList">搜索</el-button>
        <el-button type="info">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 文章列表 -->
    <el-table :data="articleList" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="100" />
      <el-table-column prop="title" label="文章标题" />
      <el-table-column prop="cate_name" label="分类" />
      <el-table-column prop="create_time" label="发布日期">
        <template #default="{ row }">
          {{ row.created_at?.split('T')[0] || '---' }}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="发布状态" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            type="primary"
            :icon="Edit"
            @click="onEditArticle(row)"
            circle
            plain
          ></el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="onDeleteArticle(row)"
            circle
            plain
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </page-container>
</template>
<style scoped lang="scss"></style>
