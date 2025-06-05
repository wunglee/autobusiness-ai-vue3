<template>
  <div class="workspace-sidebar">
    <!-- 搜索框 -->
    <div class="search-container">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索工作区..."
        :prefix-icon="Search"
        clearable
        size="small"
      />
    </div>

    <!-- 新建工作区按钮 -->
    <div class="create-container">
      <el-button 
        type="primary" 
        :icon="Plus" 
        size="small" 
        @click="createWorkspace"
        style="width: 100%;"
      >
        新建工作区
      </el-button>
    </div>

    <!-- 工作区列表 -->
    <div class="workspace-list">
      <div v-if="filteredWorkspaces.length === 0" class="empty-state">
        <el-icon size="48"><Avatar /></el-icon>
        <p>暂无工作区</p>
        <el-button type="primary" size="small" @click="createWorkspace">
          创建第一个工作区
        </el-button>
      </div>
      
      <div 
        v-for="workspace in filteredWorkspaces" 
        :key="workspace.id"
        class="workspace-item"
        :class="{ active: workspace.id === activeWorkspaceId }"
        @click="selectWorkspace(workspace.id)"
      >
        <div class="workspace-avatar">
          <el-icon><Avatar /></el-icon>
        </div>
        <div class="workspace-info">
          <div class="workspace-name">{{ workspace.name }}</div>
          <div class="workspace-desc">{{ workspace.description }}</div>
          <el-tag size="small" :type="workspace.status === 'active' ? 'success' : 'info'" class="workspace-status">
            {{ workspace.status === 'active' ? '活跃' : '空闲' }}
          </el-tag>
        </div>
        <div class="workspace-actions">
          <el-dropdown trigger="click" @command="handleWorkspaceAction">
            <span class="action-trigger">
              <el-icon><MoreFilled /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'edit', workspace }">
                  <el-icon><Edit /></el-icon> 编辑
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'duplicate', workspace }">
                  <el-icon><CopyDocument /></el-icon> 克隆
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'export', workspace }">
                  <el-icon><Download /></el-icon> 导出
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'delete', workspace }" divided>
                  <el-icon><Delete /></el-icon> 删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Search, 
  Avatar, 
  MoreFilled,
  Edit,
  CopyDocument,
  Download,
  Delete
} from '@element-plus/icons-vue'

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

// 响应式数据
const searchKeyword = ref('')

// 计算属性
const filteredWorkspaces = computed(() => {
  if (!searchKeyword.value) return props.workspaces
  return props.workspaces.filter(workspace => 
    workspace.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 方法
const selectWorkspace = (id) => {
  emit('select-workspace', id)
}

const createWorkspace = () => {
  emit('create-workspace')
}

const handleWorkspaceAction = ({ action, workspace }) => {
  switch (action) {
    case 'edit':
      emit('edit-workspace', workspace)
      break
    case 'duplicate':
      emit('duplicate-workspace', workspace)
      break
    case 'export':
      emit('export-workspace', workspace)
      break
    case 'delete':
      handleDeleteWorkspace(workspace)
      break
  }
}

const handleDeleteWorkspace = async (workspace) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工作区 "${workspace.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete-workspace', workspace)
    ElMessage.success('工作区删除成功')
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.workspace-sidebar {
  width: 320px;
  height: 100%;
  background: #fafbfc;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.create-container {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.workspace-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.workspace-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.workspace-item:hover {
  background-color: #f5f7fa;
}

.workspace-item.active {
  background-color: #e6f4ff;
  border-color: #409eff;
}

.workspace-avatar {
  margin-right: 12px;
  color: #909399;
}

.workspace-info {
  flex: 1;
  min-width: 0;
}

.workspace-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-status {
  margin-bottom: 0;
}

.workspace-actions {
  margin-left: 8px;
}

.action-trigger {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.action-trigger:hover {
  color: #409eff;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin: 16px 0 24px 0;
}
</style>