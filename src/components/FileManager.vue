<template>
  <div class="file-manager">
    <!-- 文件树面板 -->
    <div class="file-tree-panel">
      <div class="tree-header">
        <h3>文件目录</h3>
      </div>

      <div class="file-tree">
        <el-tree
            :data="files"
            :props="defaultProps"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
            :indent="20"
            highlight-current
            @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span class="node-content">
                <el-icon class="file-icon" :size="16">
                  <Folder v-if="data.type === 'folder'" />
                  <Document v-else />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
              </span>
              <span class="node-actions">
                <el-dropdown trigger="click" @command="handleCommand($event, data)" size="small">
                  <el-icon class="more-icon" :size="16" @click.stop>
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="'rename'">
                        <el-icon><Edit /></el-icon>
                        <span>重命名</span>
                      </el-dropdown-item>
                      <el-dropdown-item :command="'delete'" divided>
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </span>
            </span>
          </template>
        </el-tree>
      </div>

      <div class="tree-footer">
        <el-button size="small" :icon="FolderAdd" @click="createFolder">新增文件夹</el-button>
      </div>
    </div>

    <!-- 编辑器面板 -->
    <div class="editor-panel">
      <div class="editor-tabs" v-if="openedFiles.length > 0">
        <div class="tabs-container">
          <div
              v-for="file in openedFiles"
              :key="file.id"
              class="editor-tab"
              :class="{ active: file.id === currentFileId }"
              @click="switchToFile(file.id)"
          >
            <span class="tab-name">{{ file.name }}</span>
            <el-icon class="tab-close" :size="14" @click.stop="closeFile(file.id)">
              <Close />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="editor-content">
        <div v-if="currentFile" class="code-editor-wrapper">
          <el-input
              v-model="currentFile.content"
              type="textarea"
              :rows="25"
              placeholder="开始编写代码..."
              @input="handleContentChange"
              class="code-textarea"
          />
        </div>
        <div v-else class="empty-editor">
          <el-icon :size="48"><Document /></el-icon>
          <p>双击文件开始编辑</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Document,
  Folder,
  FolderAdd,
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
const openedFiles = ref([])
const currentFileId = ref(null)
const defaultProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const currentFile = computed(() => {
  return openedFiles.value.find(f => f.id === currentFileId.value)
})

// 方法
const handleNodeClick = (data) => {
  if (data.type === 'file') {
    openFile(data)
  }
}

const openFile = (file) => {
  // 检查文件是否已经打开
  const existingFile = openedFiles.value.find(f => f.id === file.id)
  if (!existingFile) {
    openedFiles.value.push({ ...file })
  }
  currentFileId.value = file.id
}

const switchToFile = (fileId) => {
  currentFileId.value = fileId
}

const closeFile = (fileId) => {
  const index = openedFiles.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    openedFiles.value.splice(index, 1)

    // 如果关闭的是当前文件，切换到其他文件或清空
    if (currentFileId.value === fileId) {
      if (openedFiles.value.length > 0) {
        currentFileId.value = openedFiles.value[Math.max(0, index - 1)].id
      } else {
        currentFileId.value = null
      }
    }
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
  } catch {
    // 用户取消
  }
}

const handleCommand = async (command, file) => {
  switch (command) {
    case 'rename':
      handleRename(file)
      break
    case 'delete':
      handleDelete(file)
      break
  }
}

const handleRename = async (file) => {
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
  } catch {
    // 用户取消
  }
}

const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除 "${file.name}" 吗？此操作不可恢复。`,
        '确认删除',
        {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        }
    )
    emit('delete-file', file)

    // 如果删除的文件正在编辑，关闭它
    if (openedFiles.value.find(f => f.id === file.id)) {
      closeFile(file.id)
    }
  } catch {
    // 用户取消
  }
}

const handleContentChange = () => {
  if (currentFile.value) {
    emit('save-content', {
      fileId: currentFile.value.id,
      content: currentFile.value.content
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
  width: 300px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background-color: #fafbfc;
}

.tree-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: white;
}

.tree-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: normal;
}

.file-tree {
  flex: 1;
  overflow-y: auto;
  background-color: white;
  padding: 8px 0;
}

/* 自定义树节点样式 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

.file-icon {
  flex-shrink: 0;
  color: #909399;
}

.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.custom-tree-node:hover .node-actions {
  opacity: 1;
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

.tree-footer {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.editor-tabs {
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafbfc;
  overflow-x: auto;
}

.tabs-container {
  display: flex;
  height: 40px;
}

.editor-tab {
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-right: 1px solid #e4e7ed;
  cursor: pointer;
  background-color: #f5f7fa;
  transition: all 0.2s;
  min-width: 120px;
  max-width: 200px;
  gap: 8px;
}

.editor-tab:hover {
  background-color: #e6f4ff;
}

.editor-tab.active {
  background-color: #ffffff;
  position: relative;
}

.editor-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #409eff;
}

.tab-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  cursor: pointer;
  color: #909399;
  transition: color 0.2s;
  flex-shrink: 0;
}

.tab-close:hover {
  color: #f56c6c;
}

.editor-content {
  flex: 1;
  display: flex;
  background-color: white;
}

.code-editor-wrapper {
  flex: 1;
  padding: 16px;
}

.code-textarea {
  width: 100%;
  height: 100%;
}

:deep(.el-textarea__inner) {
  height: 100% !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.empty-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-editor p {
  margin-top: 16px;
  font-size: 14px;
}

/* Element Plus 树组件样式调整 */
:deep(.el-tree) {
  background-color: transparent;
  --el-tree-node-hover-bg-color: #f5f7fa;
}

:deep(.el-tree-node) {
  position: relative;
}

:deep(.el-tree-node__content) {
  height: 32px;
  line-height: 32px;
  padding-right: 8px;
}

:deep(.el-tree-node__expand-icon) {
  font-size: 14px;
  color: #c0c4cc;
  padding: 6px;
}

:deep(.el-tree-node__expand-icon:hover) {
  color: #909399;
}

:deep(.el-tree-node__expand-icon.is-leaf) {
  color: transparent;
  cursor: default;
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: #e6f4ff;
}

/* 确保下拉菜单中的图标和文字对齐 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}
</style>