<script setup>
import { ref } from 'vue'
const dialogVisible = ref(false)
const formRef = ref()
import { artAddChannelService, artEditChannelService } from '@/api/article'
import { ElMessage } from 'element-plus'

const formModel = ref({
  id: '',
  cate_name: '',
  cate_alias: '',
})

//对外暴露一个方法open
const open = (row) => {
  dialogVisible.value = true
  formModel.value.cate_alias = row?.cate_alias || ''
  formModel.value.cate_name = row?.cate_name || ''
  formModel.value.id = row?.id || ''
}
const emit = defineEmits(['success'])
const onSubmit = async () => {
  try {
    await formRef.value.validate()
    if (formModel.value.id) {
      await artEditChannelService(formModel.value)
      ElMessage.success('编辑分类成功')
    } else {
      await artAddChannelService(formModel.value)
      ElMessage.success('添加分类成功')
    }
    emit('success')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    dialogVisible.value = false
  }
}
const rules = ref({
  cate_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    {
      pattern: /^[^\s]{2,10}$/,
      message: '分类名称必须是2到10个非空字符',
      trigger: 'blur',
    },
  ],
  cate_alias: [
    { required: true, message: '请输入分类别名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{2,10}$/,
      message: '分类别名必须是2到10个字符，只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],
})
defineExpose({
  open,
})
</script>
<template>
  <el-dialog v-model="dialogVisible" :title="formModel.id ? '编辑分类' : '添加分类'" width="500">
    <el-form ref="formRef" :model="formModel" :rules="rules">
      <el-form-item label="分类名称" prop="cate_name">
        <el-input v-model="formModel.cate_name" placeholder="请输入分类名称"></el-input>
      </el-form-item>
      <el-form-item label="分类别名" prop="cate_alias">
        <el-input v-model="formModel.cate_alias" placeholder="请输入分类别名"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>
