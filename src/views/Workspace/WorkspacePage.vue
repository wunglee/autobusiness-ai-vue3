<template>
  <div class="workspace-page">
    <!-- 左侧工作区列表 -->
    <div
        class="workspace-resize-sidebar"
        :style="{ width: sidebarWidth + 'px' }"
    >
      <WorkspaceList
          :workspaces="workspaces"
          :activeWorkspaceId="activeWorkspaceId"
          @select-workspace="selectWorkspace"
          @create-workspace="handleCreateWorkspace"
          @edit-workspace="handleEditWorkspace"
          @duplicate-workspace="handleDuplicateWorkspace"
          @export-workspace="handleExportWorkspace"
          @delete-workspace="handleDeleteWorkspace"
      />
      <!-- 拖拽条（调整左侧宽度） -->
      <div
          class="resize-bar"
          @mousedown="startSidebarResize"
          @mouseenter="showSidebarResizeCursor"
          @mouseleave="hideSidebarResizeCursor"
      ></div>
    </div>

    <!-- 主工作区 -->
    <div class="workspace-main" :class="{ 'with-agent-sidebar': !showAgentTeamChat }">
      <el-tabs
          v-model="activeMainTab"
          tab-position="left"
          class="workspace-main-tabs"
          type="border-card"
      >
        <el-tab-pane label="任务看板" name="taskBoard">
          <TaskBoard />
        </el-tab-pane>
        <el-tab-pane label="文件管理" name="fileManager">
          <FileManager
              :files="currentFiles"
              @create-file="handleCreateFile"
              @create-folder="handleCreateFolder"
              @rename-file="handleRenameFile"
              @delete-file="handleDeleteFile"
              @save-content="handleSaveContent"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 智能体团队侧边栏 -->
    <div
        class="agent-team-sidebar"
        v-if="!showAgentTeamChat"
        @click="handleOpenAgentTeam"
    >
      <div class="sidebar-content">
        <div class="sidebar-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>智能体团队</span>
        </div>
        <el-tooltip content="展开智能体团队" placement="left">
          <el-button type="primary" :icon="ArrowLeft" circle size="small" />
        </el-tooltip>
      </div>
    </div>

    <!-- 智能体团队群聊面板 -->
    <AgentTeamChat
        v-if="showAgentTeamChat"
        @minimize="handleMinimizeAgentTeam"
        @close="handleCloseAgentTeam"
    />
    <!-- 创建工作区对话框 -->
    <WorkspaceConfigDialog
        v-model="showCreateDialog"
        :editing="!!editingWorkspace"
        :value="editingWorkspace"
        @confirm="saveWorkspace"
        @cancel="cancelWorkspaceForm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, ArrowLeft } from '@element-plus/icons-vue'
import WorkspaceList from '@/views/Workspace/WorkspaceList.vue'
import FileManager from '@/views/Workspace/FileManager.vue'
import TaskBoard from '@/views/Workspace/TaskBoard.vue'
import AgentTeamChat from '@/views/Workspace/AgentTeamChat.vue'
import { useResizePanel } from '@/components/useResizePanel'
import WorkspaceConfigDialog from './WorkspaceConfigDialog.vue'

// ======= 原有数据与业务方法 =======
const activeWorkspaceId = ref(null)
const workspaces = ref([])
const currentFiles = ref([])
const showAgentTeamChat = ref(false)
const showCreateDialog = ref(false)
const editingWorkspace = ref(null)
const activeMainTab = ref('taskBoard') // 默认显示任务看板
const workspaceForm = ref({
  name: '',
  description: '',
  type: 'private'
})

onMounted(() => {

  // 初始化工作区数据
  workspaces.value = [
    {
      id: 1,
      name: '私域',
      description: '私有文件和项目',
      status: 'active',
      type: 'private'
    },
    {
      id: 2,
      name: '公域',
      description: '公共资源和共享项目',
      status: 'idle',
      type: 'public'
    }
  ]
  // 默认选中第一个工作区
  if (workspaces.value.length > 0) {
    selectWorkspace(workspaces.value[0].id)
  }
})

watch(activeWorkspaceId, (newId) => {
  if (newId) {
    loadFilesForWorkspace(newId)
  }
})

const selectWorkspace = (id) => {
  activeWorkspaceId.value = id
  workspaces.value.forEach(w => {
    w.status = w.id === id ? 'active' : 'idle'
  })
}

const loadFilesForWorkspace = (workspaceId) => {
  if (workspaceId === 1) {
    currentFiles.value = [
      {
        id: 'doc1',
        name: 'Documents',
        type: 'folder',
        children: [
          { id: 'doc1-1', name: 'README.md', type: 'file', content: '# 项目说明\n\n这是一个私有项目的说明文档。' },
          { id: 'doc1-2', name: 'notes.txt', type: 'file', content: '一些私人笔记内容...' }
        ]
      },
      {
        id: 'contracts1',
        name: 'Contracts',
        type: 'folder',
        children: [
          {
            id: 'legal1',
            name: 'Legal',
            type: 'folder',
            children: [
              { id: 'nda1', name: 'NDA.pdf', type: 'file', content: '保密协议内容...' },
              {
                id: 'agreements1',
                name: 'Agreements',
                type: 'folder',
                children: [
                  {
                    id: 'client1',
                    name: 'Client',
                    type: 'folder',
                    children: [
                      { id: 'service1', name: 'ServiceAgreement.pdf', type: 'file', content: '服务协议内容...' }
                    ]
                  },
                  {
                    id: 'vendor1',
                    name: 'Vendor',
                    type: 'folder',
                    children: []
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'reports1',
        name: 'Reports',
        type: 'folder',
        children: []
      },
      {
        id: 'media1',
        name: 'Media',
        type: 'folder',
        children: [
          {
            id: 'images1',
            name: 'Images',
            type: 'folder',
            children: [
              {
                id: 'vacation1',
                name: 'SummerVacation',
                type: 'folder',
                children: [
                  { id: 'beach1', name: 'BeachPhoto.jpg', type: 'file', content: '图片文件' },
                  { id: 'sunset1', name: 'SunsetView.jpg', type: 'file', content: '图片文件' }
                ]
              }
            ]
          },
          {
            id: 'videos1',
            name: 'Videos',
            type: 'folder',
            children: [
              {
                id: 'tutorials1',
                name: 'Tutorials',
                type: 'folder',
                children: [
                  { id: 'onboarding1', name: 'Onboarding.mp4', type: 'file', content: '视频文件' },
                  { id: 'feature2-1', name: 'Feature2.mp4', type: 'file', content: '视频文件' }
                ]
              }
            ]
          },
          {
            id: 'presentations1',
            name: 'Presentations',
            type: 'folder',
            children: [
              { id: 'feature2-2', name: 'Feature2.mp4', type: 'file', content: '演示文件' }
            ]
          }
        ]
      }
    ]
  } else if (workspaceId === 2) {
    currentFiles.value = [
      {
        id: 'public-docs',
        name: 'PublicDocuments',
        type: 'folder',
        children: [
          { id: 'pub1', name: 'Guidelines.md', type: 'file', content: '# 公共指南\n\n这是公共项目的指导文档。' },
          { id: 'pub2', name: 'API-Documentation.md', type: 'file', content: '# API 文档\n\n## 接口说明\n\n...' }
        ]
      },
      {
        id: 'shared-resources',
        name: 'SharedResources',
        type: 'folder',
        children: [
          { id: 'template1', name: 'Template.docx', type: 'file', content: '模板文件内容...' },
          { id: 'template2', name: 'Presentation.pptx', type: 'file', content: '演示模板...' }
        ]
      },
      {
        id: 'community',
        name: 'Community',
        type: 'folder',
        children: [
          { id: 'contrib1', name: 'Contributors.md', type: 'file', content: '# 贡献者列表\n\n...' },
          { id: 'guide1', name: 'ContributionGuide.md', type: 'file', content: '# 贡献指南\n\n...' }
        ]
      }
    ]
  }
}

const handleCreateWorkspace = () => {
  editingWorkspace.value = null
  workspaceForm.value = {
    name: '',
    description: '',
    type: 'private'
  }
  showCreateDialog.value = true
}

const handleEditWorkspace = (workspace) => {
  editingWorkspace.value = workspace
  workspaceForm.value = {
    name: workspace.name,
    description: workspace.description,
    type: workspace.type || 'private'
  }
  showCreateDialog.value = true
}

const handleDuplicateWorkspace = (workspace) => {
  const newWorkspace = {
    ...workspace,
    id: Date.now(),
    name: `${workspace.name} (副本)`,
    status: 'idle'
  }
  workspaces.value.push(newWorkspace)
  ElMessage.success('工作区已复制')
}

const handleExportWorkspace = (workspace) => {
  const data = {
    workspace,
    files: currentFiles.value
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${workspace.name}-export.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('工作区已导出')
}

const handleDeleteWorkspace = (workspace) => {
  const index = workspaces.value.findIndex(w => w.id === workspace.id)
  if (index !== -1) {
    workspaces.value.splice(index, 1)
    if (activeWorkspaceId.value === workspace.id) {
      activeWorkspaceId.value = workspaces.value[0]?.id || null
    }
  }
}

const saveWorkspace = () => {
  if (!workspaceForm.value.name.trim()) {
    ElMessage.warning('请输入工作区名称')
    return
  }

  if (editingWorkspace.value) {
    Object.assign(editingWorkspace.value, workspaceForm.value)
    ElMessage.success('工作区已更新')
  } else {
    const newWorkspace = {
      id: Date.now(),
      name: workspaceForm.value.name.trim(),
      description: workspaceForm.value.description.trim(),
      type: workspaceForm.value.type,
      status: 'idle'
    }
    workspaces.value.push(newWorkspace)
    ElMessage.success('工作区已创建')
  }
  showCreateDialog.value = false
}

const cancelWorkspaceForm = () => {
  showCreateDialog.value = false
  editingWorkspace.value = null
}

const handleCreateFile = (fileName) => {
  const newFile = {
    id: Date.now().toString(),
    name: fileName,
    type: 'file',
    content: ''
  }
  currentFiles.value.push(newFile)
  ElMessage.success('文件创建成功')
}

const handleCreateFolder = (folderName) => {
  const newFolder = {
    id: Date.now().toString(),
    name: folderName,
    type: 'folder',
    children: []
  }
  currentFiles.value.push(newFolder)
  ElMessage.success('文件夹创建成功')
}

const handleRenameFile = ({ newName, ...file }) => {
  const renameInTree = (items) => {
    for (let item of items) {
      if (item.id === file.id) {
        item.name = newName
        return true
      }
      if (item.children && renameInTree(item.children)) {
        return true
      }
    }
    return false
  }
  if (renameInTree(currentFiles.value)) {
    ElMessage.success('重命名成功')
  }
}

const handleDeleteFile = (file) => {
  const deleteFromTree = (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === file.id) {
        items.splice(i, 1)
        return true
      }
      if (items[i].children && deleteFromTree(items[i].children)) {
        return true
      }
    }
    return false
  }
  if (deleteFromTree(currentFiles.value)) {
    ElMessage.success('删除成功')
  }
}

const handleSaveContent = ({ fileId, content }) => {
  const saveInTree = (items) => {
    for (let item of items) {
      if (item.id === fileId) {
        item.content = content
        return true
      }
      if (item.children && saveInTree(item.children)) {
        return true
      }
    }
    return false
  }
  if (saveInTree(currentFiles.value)) {
    ElMessage.success('文件已保存')
  }
}

// 智能体团队相关方法
const handleOpenAgentTeam = () => {
  showAgentTeamChat.value = true
}

const handleMinimizeAgentTeam = () => {
  showAgentTeamChat.value = false
}

const handleCloseAgentTeam = () => {
  showAgentTeamChat.value = false
}

// ======= 拖拽宽度调整逻辑 =======
const sidebarWidth = ref(240)

// 左侧
const {
  startResize: startSidebarResize,
  showResizeCursor: showSidebarResizeCursor,
  hideResizeCursor: hideSidebarResizeCursor
} = useResizePanel({
  widthRef: sidebarWidth,
  direction: 'horizontal',
  min: 120,
  max: 400,
  reverse: false
})
</script>

<style scoped>
.workspace-page {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
  position: relative;
}

.workspace-resize-sidebar {
  flex-shrink: 0;
  position: relative;
  background: #f4f5fa;
  /* 宽度由JS控制 */
  display: flex;
  flex-direction: column;
}

.resize-bar {
  width: 5px;
  background: #e4e7ed;
  cursor: col-resize;
  transition: background 0.2s;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}
.resize-bar:hover,
.resize-bar:active {
  background: #b5bac8;
}

.workspace-main {
  flex: 1;
  background-color: white;
  overflow: hidden;
  position: relative;
  min-width: 0;
  transition: margin-right 0.3s ease;
}

.workspace-main-tabs {
  height: 100%;
  --el-tabs-header-height: 100%;
}

.workspace-main-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-right: 1px solid #e4e7ed;
  border-bottom: none;
  width: 60px;
  background: #fafbfc;
}

.workspace-main-tabs :deep(.el-tabs__nav-wrap) {
  height: 100%;
}

.workspace-main-tabs :deep(.el-tabs__nav) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.workspace-main-tabs :deep(.el-tabs__item) {
  text-align: center;
  border: none;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 0;
  padding: 20px 8px; /* 调整padding */
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  background: transparent;
  transition: all 0.2s;
  writing-mode: vertical-rl; /* 设置竖向排列 */
  text-orientation: mixed;
  min-height: auto;
  height: auto;
}
.workspace-main.with-agent-sidebar {
  margin-right: 56px; /* 智能体侧边栏宽度 + 一些余量 */
}
.workspace-main-tabs :deep(.el-tabs__item:hover) {
  background: #f5f7fa;
  color: #409eff;
}
/* 响应式设计中添加：移动端时取消边距 */
@media (max-width: 768px) {
  .workspace-main.with-agent-sidebar {
    margin-right: 0;
  }
}
.workspace-main-tabs :deep(.el-tabs__item.is-active) {
  background: #ffffff;
  color: #409eff;
  border-right: 3px solid #409eff;
  font-weight: 600;
}

.workspace-main-tabs :deep(.el-tabs__content) {
  flex: 1;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.workspace-main-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
}

.agent-team-sidebar {
  width: 48px;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  right: 0;
  top: 64px;
  bottom: 0;
  z-index: 999;
}

.agent-team-sidebar:hover {
  width: 56px;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  color: white;
}

.sidebar-title {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-title .el-icon {
  transform: rotate(90deg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workspace-page {
    flex-direction: column;
  }

  .workspace-resize-sidebar {
    width: 100% !important;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }

  .resize-bar {
    width: 100%;
    height: 5px;
    cursor: row-resize;
    bottom: 0;
    right: 0;
    left: 0;
    top: auto;
  }

  .agent-team-sidebar {
    width: 100%;
    height: 48px;
    writing-mode: horizontal-tb;
    flex-direction: row;
    justify-content: center;
    padding: 0 16px;
    top: auto;
    bottom: 0;
  }

  .sidebar-title {
    writing-mode: horizontal-tb;
    flex-direction: row;
  }

  .sidebar-title .el-icon {
    transform: none;
  }
}
</style>