<template>
  <div class="file-manager">
    <!-- 文件树面板 -->
    <div class="file-tree-panel">
      <div class="tree-header">
        <h3>文件管理</h3>
        <div class="header-actions">
          <el-button size="small" :icon="FolderAdd" @click="createFolder">新建文件夹</el-button>
          <el-button size="small" :icon="Document" @click="createFile">新建文件</el-button>
        </div>
      </div>
      
      <div class="search-container">
        <el-input
          v-model="fileSearchKeyword"
          placeholder="搜索文件..."
          :prefix-icon="Search"
          clearable
          size="small"
        />
      </div>

      <div class="file-tree">
        <div 
          v-for="file in filteredFiles" 
          :key="file.id"
          class="file-item"
          :class="{ active: file.id === activeFileId }"
          @dblclick="openFile(file)"
        >
          <div class="file-info">
            <el-icon class="file-icon">
              <Folder v-if="file.type === 'folder'" />
              <Document v-else />
            </el-icon>
            <span class="file-name">{{ file.name }}</span>
          </div>
          <div class="file-actions">
            <el-dropdown trigger="click" @command="handleFileAction">
              <span class="action-trigger">
                <el-icon><MoreFilled /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="{ action: 'rename', file }">
                    <el-icon><Edit /></el-icon> 重命名
                  </el-dropdown-item>
                  <el-dropdown-item :command="{ action: 'delete', file }" divided>
                    <el-icon><Delete /></el-icon> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑器面板 -->
    <div class="editor-panel">
      <div class="editor-tabs" v-if="openedFiles.length > 0">
        <div 
          v-for="file in openedFiles" 
          :key="file.id"
          class="editor-tab"
          :class="{ active: file.id === currentEditorFileId }"
          @click="switchToFile(file.id)"
        >
          <span class="tab-name">{{ file.name }}</span>
          <el-icon class="tab-close" @click.stop="closeFile(file.id)">
            <Close />
          </el-icon>
        </div>
      </div>
      
      <div class="editor-content">
        <div v-if="openedFiles.length === 0" class="empty-editor">
          <el-icon size="48"><Document /></el-icon>
          <p>双击文件开始编辑</p>
        </div>
        <div v-else class="code-editor">
          <el-input
            v-model="currentFileContent"
            type="textarea"
            :rows="20"
            placeholder="开始编写代码..."
            @input="saveFile"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Folder,
  FolderAdd,
  Search,
  MoreFilled,
  Edit,
  Delete,
  Close
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'create-file',
  'create-folder',
  'rename-file',
  'delete-file',
  'save-content'
])

// 响应式数据
const fileSearchKeyword = ref('')
const activeFileId = ref(null)
const openedFiles = ref([])
const currentEditorFileId = ref(null)
const currentFileContent = ref('')

// 计算属性
const filteredFiles = computed(() => {
  if (!fileSearchKeyword.value) return props.files
  return props.files.filter(file => 
    file.name.toLowerCase().includes(fileSearchKeyword.value.toLowerCase())
  )
})

// 监听当前文件内容变化
watch(currentEditorFileId, (newId) => {
  if (newId) {
    const file = props.files.find(f => f.id === newId)
    if (file) {
      currentFileContent.value = file.content || ''
    }
  } else {
    currentFileContent.value = ''
  }
})

// 方法
const openFile = (file) => {
  if (file.type === 'folder') return
  
  activeFileId.value = file.id
  
  // 检查文件是否已经打开
  if (!openedFiles.value.find(f => f.id === file.id)) {
    openedFiles.value.push(file)
  }
  
  currentEditorFileId.value = file.id
}

const switchToFile = (fileId) => {
  currentEditorFileId.value = fileId
  activeFileId.value = fileId
}

const closeFile = (fileId) => {
  const index = openedFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    openedFiles.value.splice(index, 1)
    
    // 如果关闭的是当前文件，切换到其他文件或清空
    if (currentEditorFileId.value === fileId) {
      if (openedFiles.value.length > 0) {
        const nextFile = openedFiles.value[Math.max(0, index - 1)]
        currentEditorFileId.value = nextFile.id
        activeFileId.value = nextFile.id
      } else {
        currentEditorFileId.value = null
        activeFileId.value = null
      }
    }
  }
}

const createFile = async () => {
  try {
    const { value: fileName } = await ElMessageBox.prompt(
      '请输入文件名',
      '新建文件',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\w\-. ]+$/,
        inputErrorMessage: '文件名格式不正确'
      }
    )
    emit('create-file', fileName)
    ElMessage.success('文件创建成功')
  } catch {
    // 用户取消
  }
}

const createFolder = async () => {
  try {
    const { value: folderName } = await ElMessageBox.prompt(
      '请输入文件夹名',
      '新建文件夹',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[\w\-. ]+$/,
        inputErrorMessage: '文件夹名格式不正确'
      }
    )
    emit('create-folder', folderName)
    ElMessage.success('文件夹创建成功')
  } catch {
    // 用户取消
  }
}

const handleFileAction = ({ action, file }) => {
  switch (action) {
    case 'rename':
      handleRenameFile(file)
      break
    case 'delete':
      handleDeleteFile(file)
      break
  }
}

const handleRenameFile = async (file) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新名字',
      '重命名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: file.name,
        inputPattern: /^[\w\-. ]+$/,
        inputErrorMessage: '名字格式不正确'
      }
    )
    emit('rename-file', { ...file, newName })
    ElMessage.success('重命名成功')
  } catch {
    // 用户取消
  }
}

const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除 "${file.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )
    emit('delete-file', file)
    
    // 如果删除的文件正在编辑，关闭它
    if (openedFiles.value.find(f => f.id === file.id)) {
      closeFile(file.id)
    }
    
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const saveFile = () => {
  if (currentEditorFileId.value) {
    emit('save-content', {
      fileId: currentEditorFileId.value,
      content: currentFileContent.value
    })
  }
}
</script>

<style scoped>
.file-manager {
  display: flex;
  height: 100%;
}

.file-tree-panel {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.tree-header h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-container {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.file-tree {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-item.active {
  background-color: #e6f4ff;
  color: #409eff;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.file-icon {
  margin-right: 8px;
  color: #909399;
}

.file-name {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-trigger {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.action-trigger:hover {
  color: #409eff;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafbfc;
}

.editor-tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-right: 1px solid #e4e7ed;
  cursor: pointer;
  background-color: #f5f7fa;
  transition: all 0.2s;
}

.editor-tab:hover {
  background-color: #e6f4ff;
}

.editor-tab.active {
  background-color: #ffffff;
  border-bottom: 2px solid #409eff;
}

.tab-name {
  margin-right: 8px;
  font-size: 14px;
}

.tab-close {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
}

.tab-close:hover {
  color: #f56c6c;
}

.editor-content {
  flex: 1;
  padding: 16px;
}

.empty-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.empty-editor p {
  margin-top: 16px;
  font-size: 14px;
}

.code-editor {
  height: 100%;
}

.code-editor .el-textarea {
  height: 100%;
}

.code-editor .el-textarea__inner {
  height: 100% !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}
</style>