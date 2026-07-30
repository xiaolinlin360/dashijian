<script setup>
import { ref } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
const formModel = ref({
  title: '',
  content: '',
})
const articleList = ref([
  {
    id: 5961,
    title: '新的文章啊',
    pub_date: '2022-07-10 14:53:52.604',
    state: '已发布',
    cate_name: '体育',
  },
  {
    id: 5962,
    title: '新的文章啊',
    pub_date: '2022-07-10 14:54:30.904',
    state: '草稿',
    cate_name: '体育',
  },
])
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
      <el-form-item prop="title" label="文章分类">
        <el-select v-model="formModel.title" placeholder="请选择文章分类" style="width: 200px">
          <el-option label="分类1" value="1"></el-option>
          <el-option label="分类2" value="2"></el-option>
          <el-option label="分类3" value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item prop="content" label="发布状态">
        <el-select v-model="formModel.content" placeholder="请选择发布状态" style="width: 200px">
          <el-option label="已发布" value="1"></el-option>
          <el-option label="草稿" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">搜索</el-button>
        <el-button type="info">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 文章列表 -->
    <el-table :data="articleList" stripe style="width: 100%">
      <el-table-column type="index" label="序号" width="100" />
      <el-table-column prop="title" label="文章标题" />
      <el-table-column prop="cate_name" label="分类" />
      <el-table-column prop="pub_date" label="发布日期" />
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
