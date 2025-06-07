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
          <el-dropdown trigger="click" @command="cmd => {
    if (cmd==='edit') editWorkspace(workspace)
    else if (cmd==='delete') deleteWorkspace(workspace)
  }" size="small">
            <el-icon class="more-icon" :size="16" @click.stop>
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">
                  <el-icon><Edit /></el-icon>
                  <span>配置</span>
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { useNamedEntityActions } from '@/components/useNamedEntityActions'
const {handleDelete } = useNamedEntityActions()
import {MoreFilled, Plus} from '@element-plus/icons-vue'

const deleteWorkspace = async (workspace) => {
  const confirmed = await handleDelete(workspace.name, {
    title: '删除空间',
    message: `确定要删除空间 "${workspace.name}" 吗？`
  })
  if (confirmed) {
    emit('delete-workspace', workspace)
  }
}
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

const editWorkspace = (workspace) => {
  emit('edit-workspace',workspace)
}
</script>

<style scoped>
.workspace-sidebar {
  flex-shrink: 0;
  height: 100%;
  position: relative;
  background: #f4f5fa;
  display: flex;
  flex-direction: column;
}

.workspace-list {
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
  height: 100%;
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

.more-icon {
  cursor: pointer;
  color: #909399;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s;
}

.more-icon:hover {
  background-color: #e6f4ff;
  color: #409eff;
}
</style>