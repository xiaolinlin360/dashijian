<script setup>
import { ref } from 'vue'
const isDrawer = ref(false)
const open = (res) => {
  console.log(res)
  isDrawer.value = true
}
defineExpose({
  open,
})
</script>
<template>
  <el-drawer v-model="isDrawer" title="标题" size="50%">
    <span>Hi there!</span>
  </el-drawer>
</template>
