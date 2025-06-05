<template>
  <div class="workspace-page">
    <!-- 顶部工具栏 -->
    <div class="workspace-toolbar">
      <div class="toolbar-left">
        <div class="workspace-selector">
          <el-select 
            v-model="selectedWorkspaceId" 
            placeholder="选择工作空间"
            @change="switchWorkspace"
            size="small"
          >
            <el-option
              v-for="workspace in workspaces"
              :key="workspace.id"
              :label="workspace.name"
              :value="workspace.id"
            />
          </el-select>
          <el-button 
            type="primary" 
            size="small" 
            @click="showCreateDialog = true"
            style="margin-left: 8px;"
          >
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="toolbar-right">
        <el-button-group size="small">
          <el-button @click="saveCurrentFile" :disabled="!currentFile">
            <el-icon><Document /></el-icon>
            保存
          </el-button>
          <el-button @click="createNewFile">
            <el-icon><DocumentAdd /></el-icon>
            新建文件
          </el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="workspace-main" v-if="selectedWorkspaceId">
      <!-- 左侧文件目录 -->
      <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <div class="sidebar-title" v-if="!sidebarCollapsed">
            <el-icon><Folder /></el-icon>
            <span>文件浏览器</span>
          </div>
          <el-button 
            type="text" 
            size="small" 
            @click="toggleSidebar"
          >
            <el-icon><Expand v-if="sidebarCollapsed" /><Fold v-else /></el-icon>
          </el-button>
        </div>
        <div class="file-tree" v-if="!sidebarCollapsed">
          <div class="tree-actions">
            <el-button type="text" size="small" @click="createNewFile">
              <el-icon><DocumentAdd /></el-icon>
            </el-button>
            <el-button type="text" size="small" @click="createNewFolder">
              <el-icon><FolderAdd /></el-icon>
            </el-button>
            <el-button type="text" size="small" @click="refreshFileTree">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
          <el-tree
            :data="fileTree"
            :props="treeProps"
            node-key="id"
            :expand-on-click-node="false"
            @node-click="openFile"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon class="node-icon">
                  <Folder v-if="data.type === 'folder'" />
                  <Document v-else />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
                <div class="node-actions" v-if="!data.isRoot">
                  <el-dropdown trigger="click" @click.stop>
                    <el-button type="text" size="small">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="renameFile(data)">
                          <el-icon><Edit /></el-icon>
                          重命名
                        </el-dropdown-item>
                        <el-dropdown-item @click="deleteFile(data)" divided>
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 右侧编辑区 -->
      <div class="editor-area">
        <!-- 文件标签页 -->
        <div class="editor-tabs" v-if="openFiles.length > 0">
          <div 
            v-for="file in openFiles" 
            :key="file.id"
            class="editor-tab"
            :class="{ active: currentFile?.id === file.id }"
            @click="switchToFile(file)"
          >
            <el-icon class="tab-icon"><Document /></el-icon>
            <span class="tab-name">{{ file.name }}</span>
            <el-button 
              type="text" 
              size="small" 
              class="tab-close"
              @click.stop="closeFile(file)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 编辑器 -->
        <div class="editor-container" v-if="currentFile">
          <div class="editor-header">
            <div class="file-info">
              <span class="file-path">{{ currentFile.path }}</span>
            </div>
            <div class="editor-actions">
              <el-button type="text" size="small" @click="formatCode">
                <el-icon><Magic /></el-icon>
                格式化
              </el-button>
            </div>
          </div>
          <div class="editor-content">
            <el-input
              v-model="currentFile.content"
              type="textarea"
              :rows="20"
              placeholder="在这里编写代码..."
              @input="markFileAsModified"
            />
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="editor-empty">
          <div class="empty-content">
            <el-icon class="empty-icon" size="80"><Document /></el-icon>
            <h3 class="empty-title">选择文件开始编辑</h3>
            <p class="empty-description">从左侧文件树选择文件，或创建新文件</p>
            <el-button type="primary" @click="createNewFile">
              <el-icon><DocumentAdd /></el-icon>
              创建新文件
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 工作空间选择提示 -->
    <div v-else class="workspace-selector-prompt">
      <div class="prompt-content">
        <el-icon class="prompt-icon" size="80"><FolderOpened /></el-icon>
        <h3 class="prompt-title">选择工作空间</h3>
        <p class="prompt-description">请先选择一个工作空间开始编码</p>
        <div class="workspace-options">
          <el-select 
            v-model="selectedWorkspaceId" 
            placeholder="选择工作空间"
            @change="switchWorkspace"
            size="large"
            style="width: 300px; margin-bottom: 16px;"
          >
            <el-option
              v-for="workspace in workspaces"
              :key="workspace.id"
              :label="workspace.name"
              :value="workspace.id"
            />
          </el-select>
          <br>
          <el-button type="primary" size="large" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建新工作空间
          </el-button>
        </div>
      </div>
    </div>

    <!-- 创建/编辑工作空间对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      :title="editingWorkspace ? '编辑工作空间' : '创建工作空间'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="workspaceForm" label-width="100px">
        <el-form-item label="工作空间名称" required>
          <el-input 
            v-model="workspaceForm.name" 
            placeholder="请输入工作空间名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="workspaceForm.description" 
            type="textarea" 
            placeholder="请输入工作空间描述（可选）"
            maxlength="200"
            show-word-limit
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm">取消</el-button>
          <el-button type="primary" @click="saveWorkspace">
            {{ editingWorkspace ? '保存' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, Edit, Delete, MoreFilled, DocumentAdd, Document, 
  Folder, FolderAdd, FolderOpened, Expand, Fold, Refresh, 
  Close, Magic 
} from '@element-plus/icons-vue'

const router = useRouter()

// 注入全局状态
const currentWorkspace = inject('currentWorkspace')
const messages = inject('messages')

// 响应式数据
const workspaces = ref([])
const selectedWorkspaceId = ref(null)
const showCreateDialog = ref(false)
const editingWorkspace = ref(null)
const workspaceForm = ref({
  name: '',
  description: ''
})

// 文件管理相关
const sidebarCollapsed = ref(false)
const fileTree = ref([])
const openFiles = ref([])
const currentFile = ref(null)
const treeProps = {
  children: 'children',
  label: 'name'
}

// 生命周期
onMounted(() => {
  loadWorkspacesFromStorage()
  initializeFileTree()
})

// 从存储加载工作空间
const loadWorkspacesFromStorage = () => {
  try {
    const stored = localStorage.getItem('ai-workspaces')
    if (stored) {
      workspaces.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载工作空间失败:', error)
  }
}

// 保存工作空间到存储
const saveWorkspacesToStorage = () => {
  try {
    localStorage.setItem('ai-workspaces', JSON.stringify(workspaces.value))
  } catch (error) {
    console.error('保存工作空间失败:', error)
    ElMessage.error('保存失败')
  }
}

// 选择工作空间
const selectWorkspace = (workspace) => {
  // 更新当前工作空间
  currentWorkspace.value = workspace
  
  // 更新工作空间状态
  workspaces.value.forEach(w => {
    w.status = w.id === workspace.id ? 'active' : 'idle'
  })
  saveWorkspacesToStorage()
  
  // 加载该工作空间的消息
  loadMessagesForWorkspace(workspace.id)
  
  // 跳转到聊天页面
  router.push('/chat')
}

// 加载指定工作空间的消息
const loadMessagesForWorkspace = (workspaceId) => {
  try {
    const stored = localStorage.getItem(`ai-messages-${workspaceId}`)
    if (stored) {
      messages.value = JSON.parse(stored)
    } else {
      messages.value = []
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    messages.value = []
  }
}

// 保存工作空间
const saveWorkspace = () => {
  if (!workspaceForm.value.name.trim()) {
    ElMessage.warning('请输入工作空间名称')
    return
  }
  
  if (editingWorkspace.value) {
    // 编辑模式
    editingWorkspace.value.name = workspaceForm.value.name.trim()
    editingWorkspace.value.description = workspaceForm.value.description.trim()
    ElMessage.success('工作空间已更新')
  } else {
    // 创建模式
    const newWorkspace = {
      id: Date.now(),
      name: workspaceForm.value.name.trim(),
      description: workspaceForm.value.description.trim(),
      status: 'idle',
      createdAt: new Date()
    }
    workspaces.value.push(newWorkspace)
    ElMessage.success('工作空间已创建')
  }
  
  saveWorkspacesToStorage()
  resetForm()
}

// 编辑工作空间
const editWorkspace = (workspace) => {
  editingWorkspace.value = workspace
  workspaceForm.value.name = workspace.name
  workspaceForm.value.description = workspace.description
  showCreateDialog.value = true
}

// 删除工作空间
const deleteWorkspace = async (workspace) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工作空间 "${workspace.name}" 吗？这将同时删除所有相关消息。`,
      '确认删除',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    
    // 删除工作空间
    const index = workspaces.value.findIndex(w => w.id === workspace.id)
    if (index !== -1) {
      workspaces.value.splice(index, 1)
      saveWorkspacesToStorage()
    }
    
    // 删除相关消息
    localStorage.removeItem(`ai-messages-${workspace.id}`)
    
    // 如果删除的是当前工作空间，清空当前状态
    if (currentWorkspace.value?.id === workspace.id) {
      currentWorkspace.value = null
      messages.value = []
    }
    
    ElMessage.success('工作空间已删除')
  } catch {
    // 用户取消
  }
}

// 重置表单
const resetForm = () => {
  workspaceForm.value.name = ''
  workspaceForm.value.description = ''
  editingWorkspace.value = null
  showCreateDialog.value = false
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.workspace-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.workspace-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.workspace-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.workspace-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  max-width: 1200px;
}

.workspace-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.workspace-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.workspace-card.active {
  border-color: #409eff;
  background: #f0f8ff;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.workspace-info {
  flex: 1;
}

.workspace-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.workspace-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
  line-height: 1.4;
}

.workspace-actions {
  margin-left: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #909399;
}

.empty-description {
  margin: 0 0 20px 0;
  color: #c0c4cc;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>