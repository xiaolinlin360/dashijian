<script setup>
import { ref } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import { artGetListService, artGetChannelsService } from '@/api/article'
import ArticleEdit from './components/ArticleEdit.vue'

const formModel = ref({
  pagenum: 1,
  pagesize: 5,
  article_id: '',
  state: '',
})
const total = ref(0) //文章总数
const articleList = ref([]) //文章列表
const channelList = ref([]) //文章分类表
const loading = ref(false) //加载中
const articleEditRef = ref(null) //抽屉组件实例

//重置表单
const resetForm = () => {
  formModel.value.article_id = ''
  formModel.value.state = ''
  getArticleList()
}
//获取文章列表
const getArticleList = async () => {
  loading.value = true
  articleList.value = await artGetListService(formModel.value)
  total.value = articleList.value.total
  articleList.value = articleList.value.pageList
  loading.value = false
  console.log('刷新成功！！！！！！')
}
getArticleList()
//获取文章分类表
const getChannelList = async () => {
  channelList.value = await artGetChannelsService()
}
getChannelList()
const onSizeChange = (val) => {
  formModel.value.pagenum = 1
  formModel.value.pagesize = val
  console.log(val)
  getArticleList()
}
const onCurrentChange = (val) => {
  formModel.value.pagenum = val
  console.log(val)
  getArticleList()
}
//编辑文章
const onEditArticle = (row) => {
  articleEditRef.value.open(row)
}
//删除文章
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
//添加文章
const onAddArticle = () => {
  articleEditRef.value.open({})
}
</script>
<template>
  <page-container title="添加文章">
    <template #extra>
      <el-button type="primary" @click="onAddArticle">添加文章</el-button>
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
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getArticleList">搜索</el-button>
        <el-button type="info" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 文章列表 -->
    <el-table :data="articleList" stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="title" label="文章标题" />
      <el-table-column prop="article_id" label="分类">
        <template #default="{ row }">
          {{ channelList.find((item) => item.id === row.article_id)?.cate_name || '---' }}
        </template>
      </el-table-column>
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
    <!-- 分页组件 -->
    <el-pagination
      v-model:current-page="formModel.pagenum"
      v-model:page-size="formModel.pagesize"
      :page-sizes="[3, 5, 7, 10]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />
    <!--  size-change 分页大小改变时触发 ,current-change 当前页改变时触发 -->
    <!-- 抽屉组件 -->
    <ArticleEdit ref="articleEditRef" @refreshArticleList="getArticleList" />
  </page-container>
</template>
<style scoped lang="scss"></style>
