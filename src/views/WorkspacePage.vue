<template>
  <div class="workspace-page">
    <!-- 左侧工作区列表 -->
    <div class="workspace-sidebar">
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
    </div>

    <!-- 主工作区 -->
    <div class="workspace-main">
      <!-- 文件管理器 -->
      <FileManager
          :files="currentFiles"
          @create-file="handleCreateFile"
          @create-folder="handleCreateFolder"
          @rename-file="handleRenameFile"
          @delete-file="handleDeleteFile"
          @save-content="handleSaveContent"
      />
    </div>

    <!-- AI助手面板 -->
    <div class="ai-assistant-panel" v-if="showAIAssistant">
      <AIAssistant
          :initialMessages="aiMessages"
          @send-message="handleSendMessage"
          @clear-history="handleClearHistory"
          @regenerate-response="handleRegenerateResponse"
          @attach-file="handleAttachFile"
      />
    </div>

    <!-- 创建工作区对话框 -->
    <el-dialog
        v-model="showCreateDialog"
        :title="editingWorkspace ? '编辑工作区' : '创建工作区'"
        width="500px"
    >
      <el-form :model="workspaceForm" label-width="100px">
        <el-form-item label="工作区名称" required>
          <el-input
              v-model="workspaceForm.name"
              placeholder="请输入工作区名称"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="workspaceForm.description"
              type="textarea"
              placeholder="请输入工作区描述（可选）"
              maxlength="200"
              show-word-limit
              :rows="3"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="workspaceForm.type">
            <el-radio label="private">私域</el-radio>
            <el-radio label="public">公域</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelWorkspaceForm">取消</el-button>
          <el-button type="primary" @click="saveWorkspace">
            {{ editingWorkspace ? '保存' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkspaceList from '@/components/WorkspaceList.vue'
import FileManager from '@/components/FileManager.vue'
import AIAssistant from '@/components/AIAssistant.vue'

// 响应式数据
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

// 初始化数据
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

// 监听工作区变化
watch(activeWorkspaceId, (newId) => {
  if (newId) {
    loadFilesForWorkspace(newId)
  }
})

// 方法
const selectWorkspace = (id) => {
  activeWorkspaceId.value = id
  // 更新工作区状态
  workspaces.value.forEach(w => {
    w.status = w.id === id ? 'active' : 'idle'
  })
}

const loadFilesForWorkspace = (workspaceId) => {
  // 模拟加载不同工作区的文件
  if (workspaceId === 1) {
    // 私域文件
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
    // 公域文件
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

// 工作区操作处理
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
  // 模拟导出工作区
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
    // 编辑模式
    Object.assign(editingWorkspace.value, workspaceForm.value)
    ElMessage.success('工作区已更新')
  } else {
    // 创建模式
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

// 文件操作处理
const handleCreateFile = (fileName) => {
  const newFile = {
    id: Date.now().toString(),
    name: fileName,
    type: 'file',
    content: ''
  }
  // 添加到根目录
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
  // 递归查找并重命名文件
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
  // 递归删除文件
  const deleteFromTree = (items, parent = null) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === file.id) {
        items.splice(i, 1)
        return true
      }
      if (items[i].children && deleteFromTree(items[i].children, items[i])) {
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
  // 递归查找并保存文件内容
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

// AI助手相关处理
const handleSendMessage = ({ message, settings, onResponse, onError, onComplete }) => {
  // 模拟AI响应
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
</script>

<style scoped>
.workspace-page {
  display: flex;
  height: calc(100vh - 64px);
  background-color: #f5f7fa;
}

.workspace-sidebar {
  flex-shrink: 0;
}

.workspace-main {
  flex: 1;
  background-color: white;
  overflow: hidden;
}

.ai-assistant-panel {
  width: 400px;
  border-left: 1px solid #e4e7ed;
  background-color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-assistant-panel {
    width: 350px;
  }
}

@media (max-width: 768px) {
  .workspace-page {
    flex-direction: column;
  }

  .workspace-sidebar {
    width: 100%;
    height: auto;
  }

  .ai-assistant-panel {
    width: 100%;
    height: 50vh;
  }
}
</style>