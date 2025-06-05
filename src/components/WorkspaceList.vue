<template>
  <div class="workspace-sidebar">
    <!-- 标题 -->
    <div class="sidebar-header">
      <h3>空间列表</h3>
    </div>

    <!-- 工作区列表 -->
    <div class="workspace-list">
      <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="workspace-item"
          :class="{ active: workspace.id === activeWorkspaceId }"
          @click="selectWorkspace(workspace.id)"
      >
        <div class="workspace-content">
          <span class="workspace-name">{{ workspace.name }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="sidebar-footer">
      <el-button
          size="small"
          :icon="Plus"
          @click="createWorkspace"
      >
        新增
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  workspaces: {
    type: Array,
    default: () => []
  },
  activeWorkspaceId: {
    type: [Number, String],
    default: null
  }
})

// Emits
const emit = defineEmits([
  'select-workspace',
  'create-workspace',
  'edit-workspace',
  'duplicate-workspace',
  'export-workspace',
  'delete-workspace'
])

// 方法
const selectWorkspace = (id) => {
  emit('select-workspace', id)
}

const createWorkspace = () => {
  emit('create-workspace')
}
</script>

<style scoped>
.workspace-sidebar {
  width: 200px;
  height: 100%;
  background: #fafbfc;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: white;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.workspace-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  background-color: white;
}

.workspace-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #606266;
}

.workspace-item:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.workspace-item.active {
  background-color: #e6f4ff;
  color: #409eff;
  font-weight: 500;
}

.workspace-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.workspace-name {
  flex: 1;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.sidebar-footer .el-button {
  width: 100%;
}
</style>