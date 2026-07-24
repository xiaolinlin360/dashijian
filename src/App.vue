<script setup>
// import { ref } from 'vue'
import { useUserStore } from './stores'
const tokenStore = useUserStore()
</script>

<template>
  <div>
    router-view：<router-view></router-view>
    <hr />
    {{ tokenStore.token }}
    <el-button @click="tokenStore.setToken('123')">点击我</el-button>
    <el-button type="primary" @click="tokenStore.removeToken">点击删除</el-button>
  </div>
</template>

<style scoped></style>
