<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// App.vue - 醒客自主智能体应用主组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Element Plus 样式调整 */
.el-tree {
  --el-tree-node-hover-bg-color: #f5f7fa;
  --el-tree-text-color: #606266;
  --el-tree-expand-icon-color: #c0c4cc;
}

.el-button {
  font-weight: 500;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 全局过渡效果 */
* {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>