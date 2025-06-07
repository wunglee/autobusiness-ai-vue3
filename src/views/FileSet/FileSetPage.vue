<template>
  <div class="fileset-page">
    <div class="page-header">
      <h1>文件集管理</h1>
      <p>管理全局文件和网址资源</p>
    </div>

    <div class="fileset-content">
      <div class="fileset-lists">
        <!-- 文件列表 -->
        <div class="file-list-panel">
          <div class="panel-header">
            <h3>文件列表</h3>
            <div class="panel-actions">
              <el-button size="small" :icon="Upload" @click="uploadFiles">上传文件</el-button>
              <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  :disabled="selectedFiles.length === 0"
                  @click="deleteSelectedFiles"
              >
                删除选中
              </el-button>
            </div>
          </div>

          <el-table
              :data="fileList"
              border
              style="width: 100%"
              height="500"
              @selection-change="handleFileSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="name" label="文件名" show-overflow-tooltip />
            <el-table-column prop="path" label="路径" show-overflow-tooltip />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="150" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                    text
                    :icon="Download"
                    @click="downloadFile(row)"
                    title="下载"
                />
                <el-button
                    text
                    :icon="Delete"
                    type="danger"
                    @click="deleteFile(row)"
                    title="删除"
                />
              </template>
            </el-table-column>
          </el-table>

          <input
              ref="fileInput"
              type="file"
              style="display: none"
              multiple
              @change="handleFileUpload"
          />
        </div>

        <!-- 网址列表 -->
        <div class="url-list-panel">
          <div class="panel-header">
            <h3>网址列表</h3>
            <div class="panel-actions">
              <el-button size="small" :icon="Plus" @click="showAddUrlDialog">新增网址</el-button>
              <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  :disabled="selectedUrls.length === 0"
                  @click="deleteSelectedUrls"
              >
                删除选中
              </el-button>
            </div>
          </div>

          <el-table
              :data="urlList"
              border
              style="width: 100%"
              height="500"
              @selection-change="handleUrlSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="name" label="名称" show-overflow-tooltip />
            <el-table-column prop="url" label="网址" show-overflow-tooltip />
            <el-table-column prop="description" label="描述" show-overflow-tooltip />
            <el-table-column prop="createTime" label="创建时间" width="150" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button
                    text
                    :icon="View"
                    @click="openUrl(row.url)"
                    title="访问"
                />
                <el-button
                    text
                    :icon="Edit"
                    @click="editUrl(row)"
                    title="编辑"
                />
                <el-button
                    text
                    :icon="Delete"
                    type="danger"
                    @click="deleteUrl(row)"
                    title="删除"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 新增/编辑网址对话框 -->
    <el-dialog
        v-model="showUrlDialog"
        :title="editingUrl ? '编辑网址' : '新增网址'"
        width="500px"
    >
      <el-form :model="urlForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="urlForm.name" placeholder="请输入网址名称" />
        </el-form-item>
        <el-form-item label="网址" required>
          <el-input v-model="urlForm.url" placeholder="请输入网址URL" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="urlForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入网址描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUrlDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUrl">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  Download,
  Delete,
  Plus,
  Edit,
  View
} from '@element-plus/icons-vue'

// 响应式数据
const fileList = ref([])
const urlList = ref([])
const selectedFiles = ref([])
const selectedUrls = ref([])

const showUrlDialog = ref(false)
const editingUrl = ref(null)
const urlForm = ref({
  name: '',
  url: '',
  description: ''
})

const fileInput = ref(null)

// 初始化数据
onMounted(() => {
  loadFileList()
  loadUrlList()
})

// 文件相关方法
const loadFileList = () => {
  // 模拟数据
  fileList.value = [
    {
      id: 1,
      name: 'project-doc.pdf',
      path: '/uploads/docs/project-doc.pdf',
      size: '2.5MB',
      type: 'PDF',
      createTime: '2024-01-15 10:30'
    },
    {
      id: 2,
      name: 'data-sample.xlsx',
      path: '/uploads/data/data-sample.xlsx',
      size: '1.2MB',
      type: 'Excel',
      createTime: '2024-01-14 15:45'
    },
    {
      id: 3,
      name: 'image-gallery.zip',
      path: '/uploads/images/image-gallery.zip',
      size: '15.8MB',
      type: 'ZIP',
      createTime: '2024-01-13 09:20'
    }
  ]
}

const loadUrlList = () => {
  // 模拟数据
  urlList.value = [
    {
      id: 1,
      name: 'OpenAI API文档',
      url: 'https://platform.openai.com/docs',
      description: 'OpenAI官方API文档',
      createTime: '2024-01-15 10:30'
    },
    {
      id: 2,
      name: 'Vue.js官方文档',
      url: 'https://vuejs.org/guide/',
      description: 'Vue.js框架官方使用指南',
      createTime: '2024-01-14 15:45'
    },
    {
      id: 3,
      name: 'Element Plus组件库',
      url: 'https://element-plus.org/',
      description: 'Element Plus UI组件库文档',
      createTime: '2024-01-13 09:20'
    }
  ]
}

const handleFileSelectionChange = (selection) => {
  selectedFiles.value = selection
}

const handleUrlSelectionChange = (selection) => {
  selectedUrls.value = selection
}

const uploadFiles = () => {
  fileInput.value.click()
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const newFile = {
      id: Date.now() + Math.random(),
      name: file.name,
      path: `/uploads/${file.name}`,
      size: formatFileSize(file.size),
      type: getFileType(file.name),
      createTime: new Date().toLocaleString('zh-CN')
    }
    fileList.value.push(newFile)
  })
  ElMessage.success(`成功上传 ${files.length} 个文件`)
  // 清空input
  event.target.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const typeMap = {
    pdf: 'PDF',
    doc: 'Word',
    docx: 'Word',
    xls: 'Excel',
    xlsx: 'Excel',
    ppt: 'PPT',
    pptx: 'PPT',
    txt: 'Text',
    zip: 'ZIP',
    rar: 'RAR',
    jpg: 'Image',
    jpeg: 'Image',
    png: 'Image',
    gif: 'Image'
  }
  return typeMap[ext] || 'Other'
}

const downloadFile = (file) => {
  // 模拟下载
  ElMessage.success(`开始下载: ${file.name}`)
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除文件 "${file.name}" 吗？`,
        '确认删除',
        {
          type: 'warning'
        }
    )
    const index = fileList.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      fileList.value.splice(index, 1)
      ElMessage.success('文件删除成功')
    }
  } catch {
    // 用户取消
  }
}

const deleteSelectedFiles = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
        '批量删除',
        {
          type: 'warning'
        }
    )
    const selectedIds = selectedFiles.value.map(f => f.id)
    fileList.value = fileList.value.filter(f => !selectedIds.includes(f.id))
    selectedFiles.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消
  }
}

// 网址相关方法
const showAddUrlDialog = () => {
  editingUrl.value = null
  urlForm.value = {
    name: '',
    url: '',
    description: ''
  }
  showUrlDialog.value = true
}

const editUrl = (url) => {
  editingUrl.value = url
  urlForm.value = { ...url }
  showUrlDialog.value = true
}

const saveUrl = () => {
  if (!urlForm.value.name.trim() || !urlForm.value.url.trim()) {
    ElMessage.warning('请填写名称和网址')
    return
  }

  if (editingUrl.value) {
    // 编辑
    const index = urlList.value.findIndex(u => u.id === editingUrl.value.id)
    if (index > -1) {
      urlList.value[index] = {
        ...urlForm.value,
        id: editingUrl.value.id,
        createTime: editingUrl.value.createTime
      }
      ElMessage.success('网址更新成功')
    }
  } else {
    // 新增
    const newUrl = {
      ...urlForm.value,
      id: Date.now(),
      createTime: new Date().toLocaleString('zh-CN')
    }
    urlList.value.push(newUrl)
    ElMessage.success('网址添加成功')
  }

  showUrlDialog.value = false
}

const openUrl = (url) => {
  window.open(url, '_blank')
}

const deleteUrl = async (url) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除网址 "${url.name}" 吗？`,
        '确认删除',
        {
          type: 'warning'
        }
    )
    const index = urlList.value.findIndex(u => u.id === url.id)
    if (index > -1) {
      urlList.value.splice(index, 1)
      ElMessage.success('网址删除成功')
    }
  } catch {
    // 用户取消
  }
}

const deleteSelectedUrls = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedUrls.value.length} 个网址吗？`,
        '批量删除',
        {
          type: 'warning'
        }
    )
    const selectedIds = selectedUrls.value.map(u => u.id)
    urlList.value = urlList.value.filter(u => !selectedIds.includes(u.id))
    selectedUrls.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.fileset-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.fileset-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.fileset-lists {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 16px;
  overflow: hidden;
}

.file-list-panel,
.url-list-panel {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  min-width: 0;
}

.url-list-panel {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* 表格容器需要能滚动 */
.file-list-panel :deep(.el-table),
.url-list-panel :deep(.el-table) {
  flex: 1;
  overflow: hidden;
}

.file-list-panel :deep(.el-table__body-wrapper),
.url-list-panel :deep(.el-table__body-wrapper) {
  max-height: calc(100vh - 300px);
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .fileset-lists {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .file-list-panel {
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    max-height: 50vh;
  }

  .url-list-panel {
    max-height: 50vh;
  }

  .file-list-panel :deep(.el-table__body-wrapper),
  .url-list-panel :deep(.el-table__body-wrapper) {
    max-height: calc(50vh - 150px);
  }
}

@media (max-width: 768px) {
  .fileset-page {
    padding: 16px;
  }

  .file-list-panel,
  .url-list-panel {
    padding: 16px;
    max-height: 45vh;
  }

  .panel-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .panel-actions {
    justify-content: center;
  }

  .file-list-panel :deep(.el-table__body-wrapper),
  .url-list-panel :deep(.el-table__body-wrapper) {
    max-height: calc(45vh - 120px);
  }
}
</style>