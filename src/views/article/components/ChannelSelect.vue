<script setup>
import { ref, onMounted } from 'vue'
import { artGetChannelsService } from '@/api/article'
const channelList = ref([])
onMounted(async () => {
  channelList.value = await artGetChannelsService()
})
const modelValue = defineModel({
  type: [String, Number],
  required: true,
})
defineProps({
  width: {
    type: String,
    default: '200px',
  },
})
</script>
<template>
  <el-select v-model="modelValue" placeholder="请选择文章分类" :style="{ width: width }">
    <el-option
      v-for="item in channelList"
      :key="item.id"
      :label="item.cate_name"
      :value="item.id"
    ></el-option>
  </el-select>
</template>
