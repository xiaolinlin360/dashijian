<script setup>
// import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const handleClick = () => {
  router.push('/home')
  console.log(route.path)
}
const handleClick2 = () => {
  router.push('/ta1')
  console.log(route.path)
}
</script>

<template>
  <div>
    <el-button @click="handleClick">点击我</el-button>
    <el-button type="primary" @click="handleClick2">点击ta1</el-button>
  </div>
</template>

<style scoped></style>
