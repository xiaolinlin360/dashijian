<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>{{ title }}</span>
        <div class="extra">
          <!-- 额外内容，默认插槽，用于定制添加操作按钮等 -->
          <slot name="extra"></slot>
        </div>
      </div>
    </template>
    <!-- 主内容，默认插槽 -->
    <slot></slot>
  </el-card>
</template>
<style scoped lang="scss">
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
