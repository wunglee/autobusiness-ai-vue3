<template>
  <div class="fileset-page">
    <div class="page-header">
      <h1>文件集管理</h1>
      <p>管理全局文件和网址资源</p>
    </div>
    <div class="fileset-content modern-card">
      <el-tabs v-model="activeTab" class="fileset-tabs" stretch>
        <!-- 文件列表Tab -->
        <el-tab-pane label="文件列表" name="files">
          <div class="list-panel">
            <div class="panel-header">
              <h3>文件列表</h3>
              <div class="panel-header-right">
                <el-input
                    v-model="fileSearchKeyword"
                    placeholder="搜索文件名或类型"
                    size="small"
                    clearable
                    style="width: 200px; margin-right: 12px"
                />
                <div class="panel-actions">
                  <el-button size="small" :icon="Upload" class="btn-main" @click="uploadFiles">上传文件</el-button>
                  <el-button
                      size="small"
                      type="danger"
                      class="btn-danger"
                      :icon="Delete"
                      :disabled="selectedFiles.length === 0"
                      @click="deleteSelectedFiles"
                  >
                    删除选中
                  </el-button>
                </div>
              </div>
            </div>
            <el-table
                :data="filteredFileList"
                border
                style="width: 100%"
                height="500"
                class="modern-table"
                @selection-change="handleFileSelectionChange"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="文件名" show-overflow-tooltip />
              <el-table-column prop="path" label="路径" show-overflow-tooltip />
              <el-table-column prop="size" label="大小" width="100" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="createTime" label="创建时间" width="150" />
              <el-table-column label="操作" width="150">
                <template #default="{ row }">
                  <el-button
                      text
                      :icon="Download"
                      class="btn-action"
                      @click="downloadFile(row)"
                      title="下载"
                  />
                  <el-button
                      text
                      :icon="Delete"
                      class="btn-action"
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
        </el-tab-pane>

        <!-- 网址列表Tab -->
        <el-tab-pane label="网址列表" name="urls">
          <div class="list-panel">
            <div class="panel-header">
              <h3>网址列表</h3>
              <div class="panel-header-right">
                <el-input
                    v-model="urlSearchKeyword"
                    placeholder="搜索网址名称或描述"
                    size="small"
                    clearable
                    style="width: 200px; margin-right: 12px"
                />
                <div class="panel-actions">
                  <el-button size="small" :icon="Plus" class="btn-main" @click="showAddUrlDialog">新增网址</el-button>
                  <el-button
                      size="small"
                      type="danger"
                      class="btn-danger"
                      :icon="Delete"
                      :disabled="selectedUrls.length === 0"
                      @click="deleteSelectedUrls"
                  >
                    删除选中
                  </el-button>
                </div>
              </div>
            </div>
            <el-table
                :data="filteredUrlList"
                border
                style="width: 100%"
                height="500"
                class="modern-table"
                @selection-change="handleUrlSelectionChange"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="url" label="网址" show-overflow-tooltip />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
              <el-table-column prop="createTime" label="创建时间" width="150" />
              <el-table-column label="操作" width="200">
                <template #default="{ row }">
                  <el-button
                      text
                      :icon="View"
                      class="btn-action"
                      @click="openUrl(row.url)"
                      title="访问"
                  />
                  <el-button
                      text
                      :icon="Edit"
                      class="btn-action"
                      @click="editUrl(row)"
                      title="编辑"
                  />
                  <el-button
                      text
                      :icon="Delete"
                      class="btn-action"
                      type="danger"
                      @click="deleteUrl(row)"
                      title="删除"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <!-- 新增/编辑网址对话框 -->
    <el-dialog
        v-model="showUrlDialog"
        :title="editingUrl ? '编辑网址' : '新增网址'"
        width="500px"
        class="modern-dialog"
    >
      <el-form :model="urlForm" label-width="120px" class="modern-form">
        <el-form-item label="名称" required>
          <el-input v-model="urlForm.name" placeholder="请输入网址名称" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="网址" required>
          <el-input v-model="urlForm.url" placeholder="请输入网址URL" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="urlForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入网址描述"
              style="width: 100%;"
          />
        </el-form-item>
        <div class="form-actions">
          <el-button @click="showUrlDialog = false" style="width: 100px;">取消</el-button>
          <el-button type="primary" @click="saveUrl" style="width: 100px;">保存</el-button>
        </div>
      </el-form>
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
import { useListFilter } from '@/components/useListFilter'

// 响应式数据
const activeTab = ref('files')
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

// 使用列表过滤 hook - 文件列表
const {
  searchKeyword: fileSearchKeyword,
  createSearchFilteredList: createFileFilteredList
} = useListFilter()

// 使用列表过滤 hook - 网址列表
const {
  searchKeyword: urlSearchKeyword,
  createSearchFilteredList: createUrlFilteredList
} = useListFilter()

// 创建过滤后的列表
const filteredFileList = createFileFilteredList(fileList, ['name', 'type', 'path'])
const filteredUrlList = createUrlFilteredList(urlList, ['name', 'url', 'description'])

// 初始化数据
onMounted(() => {
  loadFileList()
  loadUrlList()
})

// 文件相关方法
const loadFileList = () => {
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
    },
    {
      id: 4,
      name: 'user-manual.docx',
      path: '/uploads/docs/user-manual.docx',
      size: '800KB',
      type: 'Word',
      createTime: '2024-01-12 14:30'
    },
    {
      id: 5,
      name: 'presentation.pptx',
      path: '/uploads/docs/presentation.pptx',
      size: '5.2MB',
      type: 'PPT',
      createTime: '2024-01-11 16:20'
    }
  ]
}

const loadUrlList = () => {
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
    },
    {
      id: 4,
      name: 'GitHub仓库',
      url: 'https://github.com/example/project',
      description: '项目代码仓库',
      createTime: '2024-01-12 11:15'
    },
    {
      id: 5,
      name: '技术博客',
      url: 'https://blog.example.com',
      description: '团队技术博客分享',
      createTime: '2024-01-11 09:30'
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
  ElMessage.success(`开始下载: ${file.name}`)
}

const deleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除文件 "${file.name}" 吗？`,
        '确认删除',
        { type: 'warning' }
    )
    const index = fileList.value.findIndex(f => f.id === file.id)
    if (index > -1) {
      fileList.value.splice(index, 1)
      ElMessage.success('文件删除成功')
    }
  } catch {}
}

const deleteSelectedFiles = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？`,
        '批量删除',
        { type: 'warning' }
    )
    const selectedIds = selectedFiles.value.map(f => f.id)
    fileList.value = fileList.value.filter(f => !selectedIds.includes(f.id))
    selectedFiles.value = []
    ElMessage.success('批量删除成功')
  } catch {}
}

// 网址相关方法
const showAddUrlDialog = () => {
  editingUrl.value = null
  urlForm.value = { name: '', url: '', description: '' }
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
        { type: 'warning' }
    )
    const index = urlList.value.findIndex(u => u.id === url.id)
    if (index > -1) {
      urlList.value.splice(index, 1)
      ElMessage.success('网址删除成功')
    }
  } catch {}
}

const deleteSelectedUrls = async () => {
  try {
    await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedUrls.value.length} 个网址吗？`,
        '批量删除',
        { type: 'warning' }
    )
    const selectedIds = selectedUrls.value.map(u => u.id)
    urlList.value = urlList.value.filter(u => !selectedIds.includes(u.id))
    selectedUrls.value = []
    ElMessage.success('批量删除成功')
  } catch {}
}
</script>

<style scoped>
.fileset-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 32px 32px 0 32px;
  overflow: hidden;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 6px 0;
  font-size: 26px;
  color: #2d2d2d;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.page-header p {
  margin: 0;
  color: #a0a4ad;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.1px;
}

.fileset-content {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px 0 rgba(44, 78, 165, 0.04);
  min-height: 0;
  overflow: hidden;
  padding: 20px 0 0 0;
  display: flex;
  flex-direction: column;
}

.modern-card {
  border-radius: 12px;
  box-shadow: 0 4px 24px 0 rgba(44, 78, 165, 0.09);
}

.fileset-tabs {
  height: 100%;
}

.list-panel {
  padding: 12px 28px 0 28px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-shrink: 0;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #262d3e;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.panel-header-right {
  display: flex;
  align-items: center;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.btn-main {
  background: #f5f7fa !important;
  border: 1px solid #e3e5e8 !important;
  color: #222;
  font-weight: 500;
  box-shadow: none !important;
  border-radius: 6px !important;
}

.btn-main:hover {
  background: #f0f6ff !important;
  border: 1px solid #b7d8fb !important;
  color: #409eff;
}

.btn-danger {
  background: #fff0f0 !important;
  border: 1px solid #ffdddd !important;
  color: #f56c6c;
  font-weight: 500;
  border-radius: 6px !important;
}

.btn-danger:hover {
  background: #fff2f2 !important;
  border: 1px solid #ffa8a8 !important;
  color: #d81b36;
}

.btn-action {
  color: #bdbdbd;
  font-size: 16px;
  margin-right: 6px;
}

.btn-action:last-child {
  margin-right: 0;
}

.btn-action:hover {
  color: #409eff;
}

.modern-table {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #fafbfc;
  --el-table-header-text-color: #444e5f;
  --el-table-row-hover-bg-color: #f5f7fa;
  --el-table-current-row-bg-color: #eaf3ff;
  --el-table-bg-color: transparent;
  --el-table-header-font-weight: 600;
  --el-table-font-size: 15px;
  --el-table-row-text-color: #2d2d2d;
  --el-table-header-border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
}

:deep(.el-table),
:deep(.el-table__body-wrapper) {
  background: none !important;
}

:deep(.el-table th),
:deep(.el-table thead) {
  background: #fafbfc !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-weight: 600 !important;
  font-size: 15px !important;
  color: #3d4352 !important;
  letter-spacing: 0.2px;
}

:deep(.el-table td),
:deep(.el-table__cell) {
  border-bottom: 1px solid #f5f5f6 !important;
  font-size: 15px !important;
  color: #2d2d2d !important;
  background: none !important;
}

:deep(.el-table__body tr:hover) td {
  background: #f5f7fa !important;
}

:deep(.el-table__row) {
  transition: background 0.2s;
}

:deep(.el-table__empty-block) {
  background: none !important;
}

:deep(.el-table__column-resize-proxy) {
  display: none !important;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  border-color: #409eff !important;
  background-color: #409eff !important;
}

:deep(.el-checkbox__inner) {
  border-radius: 3px !important;
  border: 1.5px solid #bdbdbd !important;
  background: #fff !important;
  width: 18px !important;
  height: 18px !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #409eff !important;
  border-color: #409eff !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff !important;
}

.modern-form {
  width: 100%;
  padding: 0;
  background: none;
}

:deep(.modern-form .el-form-item__label) {
  color: #344563;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.1px;
}

:deep(.modern-form .el-form-item__content) {
  font-size: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
  margin-top: 16px;
}

.modern-dialog {
  border-radius: 10px !important;
  box-shadow: none !important;
  background: #fff !important;
  padding: 0 !important;
}

:deep(.modern-dialog .el-dialog__header) {
  border-bottom: 1px solid #f0f0f0 !important;
  background: #fafbfc !important;
  margin-bottom: 12px !important;
  padding: 18px 24px 10px 24px !important;
}

:deep(.modern-dialog .el-dialog__title) {
  font-weight: 600;
  font-size: 16px;
  color: #222;
}

:deep(.modern-dialog .el-dialog__body) {
  padding: 24px !important;
}

:deep(.modern-dialog .el-form-item__label) {
  color: #344563 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
}

:deep(.modern-dialog .el-form-item__content) {
  font-size: 15px !important;
}

:deep(.modern-dialog .el-input__wrapper) {
  border-radius: 5px !important;
  background: #f5f7fa !important;
  border: 1px solid #e3e5e8 !important;
  box-shadow: none !important;
}

:deep(.modern-dialog .el-textarea__inner) {
  border-radius: 5px !important;
  background: #f5f7fa !important;
  border: 1px solid #e3e5e8 !important;
  box-shadow: none !important;
  font-size: 15px;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .fileset-page {
    padding: 12px;
  }

  .list-panel {
    padding: 16px 8px 0 8px;
  }

  .panel-header {
    margin-bottom: 10px;
  }
}

@media (max-width: 600px) {
  .panel-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .panel-header-right {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .panel-header-right .el-input {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .panel-actions {
    justify-content: center;
  }
}
</style>