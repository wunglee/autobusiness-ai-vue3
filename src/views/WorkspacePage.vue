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
    <div class="workspace-main">
      <FileManager
          :files="currentFiles"
          @create-file="handleCreateFile"
          @create-folder="handleCreateFolder"
          @rename-file="handleRenameFile"
          @delete-file="handleDeleteFile"
          @save-content="handleSaveContent"
      />
    </div>

    <!-- AI助手边条+弹窗组合 -->
    <div class="ai-assistant-bar"
         v-if="!showAIAssistant"
         @click="showAIAssistant = true">
      <span class="ai-bar-text">智能体团队</span>
    </div>
    <AIAssistant
        v-if="showAIAssistant"
        :visible="showAIAssistant"
        :initialMessages="aiMessages"
        @close="showAIAssistant = false"
        @send-message="handleSendMessage"
        @clear-history="handleClearHistory"
        @regenerate-response="handleRegenerateResponse"
        @attach-file="handleAttachFile"
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
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import WorkspaceList from '@/components/WorkspaceList.vue'
import FileManager from '@/components/FileManager.vue'
import AIAssistant from '@/components/AIAssistant.vue'
import { useResizePanel } from '@/components/useResizePanel'
import WorkspaceConfigDialog from './WorkspaceConfigDialog.vue'
// ======= 原有数据与业务方法 =======
const activeWorkspaceId = ref(null)
const workspaces = ref([])
const currentFiles = ref([])
const showAIAssistant = ref(false)
const aiMessages = ref([])
const showCreateDialog = ref(false)
const editingWorkspace = ref(null)
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

const handleSendMessage = ({ message, settings, onResponse, onError, onComplete }) => {
  setTimeout(() => {
    const response = `收到您的消息："${message}"。这是一个模拟的AI响应。在实际应用中，这里会调用真实的AI服务。`
    onResponse(response)
    onComplete()
  }, 1000)
}

const handleClearHistory = () => {
  aiMessages.value = []
}

const handleRegenerateResponse = ({ message, settings, onResponse, onError, onComplete }) => {
  handleSendMessage({ message, settings, onResponse, onError, onComplete })
}

const handleAttachFile = () => {
  ElMessage.info('文件附件功能正在开发中')
}

// ======= 拖拽宽度调整逻辑 =======
const sidebarWidth = ref(240)
const assistantWidth = ref(400)

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

// 右侧
const {
  startResize: startAssistantResize,
  showResizeCursor: showAssistantResizeCursor,
  hideResizeCursor: hideAssistantResizeCursor,
} = useResizePanel({
  widthRef: assistantWidth,
  direction: 'horizontal',
  min: 240,
  max: 700,
  reverse: true   // 右侧拖动需要reverse
})

const handleMouseMove = (event) => {
  if (!isResizing.value) return
  const deltaX = event.clientX - startX.value
  if (resizingPanel.value === 'sidebar') {
    let newWidth = initialWidth + deltaX
    newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidth))
    sidebarWidth.value = newWidth
  } else if (resizingPanel.value === 'assistant') {
    let newWidth = initialWidth - deltaX
    newWidth = Math.max(minAssistantWidth, Math.min(maxAssistantWidth, newWidth))
    assistantWidth.value = newWidth
  }
}

const handleMouseUp = () => {
  if (isResizing.value) {
    isResizing.value = false
    resizingPanel.value = ''
    document.body.style.cursor = ''
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }
}


onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = ''
})
</script>

<style scoped>
.workspace-page {
  display: flex;
  height: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}

.workspace-resize-sidebar {
  flex-shrink: 0;
  height: 100%;
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
}

.ai-assistant-bar {
  position: fixed;
  top: 80px;
  right: 0;
  width: 36px;
  height: 140px;
  background: #232323;
  color: #fff;
  border-radius: 10px 0 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  font-size: 15px;
  user-select: none;
  transition: background 0.2s;
}
.ai-assistant-bar:hover {
  background: #404040;
}
.ai-bar-text {
  writing-mode: vertical-rl;
  text-align: center;
  letter-spacing: 4px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-assistant-panel {
    width: 350px !important;
  }
}

@media (max-width: 768px) {
  .workspace-page {
    flex-direction: column;
  }

  .workspace-resize-sidebar {
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    background: #f4f5fa;
  }

  .ai-assistant-panel {
    width: 100% !important;
    height: 50vh;
  }
  .sidebar-content {
    flex: 1;
    min-width: 0;
    height: 100%;
    /* 可加padding，根据需要 */
    background: #f4f5fa;
    overflow: auto;
  }
}
</style>