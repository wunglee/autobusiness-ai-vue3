<template>
  <div class="transfer-panel">
    <el-tabs v-model="activeTab" class="resource-tabs">
      <!-- 文件Tab -->
      <el-tab-pane label="文件" name="files">
        <div class="transfer-layout">
          <!-- 左侧全局文件 -->
          <div class="transfer-list-panel">
            <div class="panel-header">
              <h4>全局文件</h4>
              <div class="panel-search">
                <el-input
                    v-model="fileSearchKeyword"
                    placeholder="搜索文件"
                    size="small"
                    :prefix-icon="Search"
                    style="width: 200px"
                />
              </div>
            </div>
            <el-table
                :data="filteredGlobalFiles"
                border
                style="width: 100%"
                height="350"
                @selection-change="handleFileLeftSelection"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="type" label="类型" width="80" />
              <el-table-column prop="size" label="大小" width="80" />
            </el-table>
          </div>

          <!-- 中间操作按钮 -->
          <div class="transfer-actions">
            <el-button
                type="primary"
                :icon="ArrowRight"
                :disabled="fileLeftSelection.length === 0"
                @click="addFilesToWorkspace"
            >
              添加到工作区
            </el-button>
            <el-button
                type="warning"
                :icon="ArrowLeft"
                :disabled="fileRightSelection.length === 0"
                @click="removeFilesFromWorkspace"
            >
              从工作区移除
            </el-button>
          </div>

          <!-- 右侧工作区文件 -->
          <div class="transfer-list-panel">
            <div class="panel-header">
              <h4>工作区文件</h4>
              <span class="selected-count">{{ selectedFiles.length }} 个</span>
            </div>
            <el-table
                :data="selectedFiles"
                border
                style="width: 100%"
                height="350"
                @selection-change="handleFileRightSelection"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="type" label="类型" width="80" />
              <el-table-column prop="size" label="大小" width="80" />
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 网址Tab -->
      <el-tab-pane label="网址" name="urls">
        <div class="transfer-layout">
          <!-- 左侧全局网址 -->
          <div class="transfer-list-panel">
            <div class="panel-header">
              <h4>全局网址</h4>
              <div class="panel-search">
                <el-input
                    v-model="urlSearchKeyword"
                    placeholder="搜索网址"
                    size="small"
                    :prefix-icon="Search"
                    style="width: 200px"
                />
              </div>
            </div>
            <el-table
                :data="filteredGlobalUrls"
                border
                style="width: 100%"
                height="350"
                @selection-change="handleUrlLeftSelection"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="url" label="网址" show-overflow-tooltip />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
            </el-table>
          </div>

          <!-- 中间操作按钮 -->
          <div class="transfer-actions">
            <el-button
                type="primary"
                :icon="ArrowRight"
                :disabled="urlLeftSelection.length === 0"
                @click="addUrlsToWorkspace"
            >
              添加到工作区
            </el-button>
            <el-button
                type="warning"
                :icon="ArrowLeft"
                :disabled="urlRightSelection.length === 0"
                @click="removeUrlsFromWorkspace"
            >
              从工作区移除
            </el-button>
          </div>

          <!-- 右侧工作区网址 -->
          <div class="transfer-list-panel">
            <div class="panel-header">
              <h4>工作区网址</h4>
              <span class="selected-count">{{ selectedUrls.length }} 个</span>
            </div>
            <el-table
                :data="selectedUrls"
                border
                style="width: 100%"
                height="350"
                @selection-change="handleUrlRightSelection"
            >
              <el-table-column type="selection" width="50" />
              <el-table-column prop="name" label="名称" show-overflow-tooltip />
              <el-table-column prop="url" label="网址" show-overflow-tooltip />
              <el-table-column prop="description" label="描述" show-overflow-tooltip />
            </el-table>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowRight, ArrowLeft, Search } from '@element-plus/icons-vue'
import { useListFilter } from '@/components/useListFilter'

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  globalFileSets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:form'])

// Tab状态
const activeTab = ref('files')

// 文件过滤hook
const {
  searchKeyword: fileSearchKeyword,
  createFilteredList: createFileFilteredList
} = useListFilter()

// 网址过滤hook
const {
  searchKeyword: urlSearchKeyword,
  createFilteredList: createUrlFilteredList
} = useListFilter()

// 分离文件和网址数据
const globalFiles = computed(() => props.globalFileSets.filter(item => item.type !== '网址'))
const globalUrls = computed(() => props.globalFileSets.filter(item => item.type === '网址'))

const selectedFiles = computed(() => props.form.selectedFileSets.filter(item => item.type !== '网址'))
const selectedUrls = computed(() => props.form.selectedFileSets.filter(item => item.type === '网址'))

// 创建过滤后的列表
const filteredGlobalFiles = createFileFilteredList(
    globalFiles,
    selectedFiles,
    ['name', 'type']
)

const filteredGlobalUrls = createUrlFilteredList(
    globalUrls,
    selectedUrls,
    ['name', 'url', 'description']
)

// 选择状态
const fileLeftSelection = ref([])
const fileRightSelection = ref([])
const urlLeftSelection = ref([])
const urlRightSelection = ref([])

// 文件选择处理方法
const handleFileLeftSelection = (selection) => {
  fileLeftSelection.value = selection
}

const handleFileRightSelection = (selection) => {
  fileRightSelection.value = selection
}

// 网址选择处理方法
const handleUrlLeftSelection = (selection) => {
  urlLeftSelection.value = selection
}

const handleUrlRightSelection = (selection) => {
  urlRightSelection.value = selection
}

// 文件操作方法
const addFilesToWorkspace = () => {
  fileLeftSelection.value.forEach(item => {
    if (!props.form.selectedFileSets.find(selected => selected.id === item.id)) {
      props.form.selectedFileSets.push(item)
    }
  })
  fileLeftSelection.value = []
  emit('update:form', props.form)
}

const removeFilesFromWorkspace = () => {
  const selectedIds = fileRightSelection.value.map(item => item.id)
  props.form.selectedFileSets = props.form.selectedFileSets.filter(item => !selectedIds.includes(item.id))
  fileRightSelection.value = []
  emit('update:form', props.form)
}

// 网址操作方法
const addUrlsToWorkspace = () => {
  urlLeftSelection.value.forEach(item => {
    if (!props.form.selectedFileSets.find(selected => selected.id === item.id)) {
      props.form.selectedFileSets.push(item)
    }
  })
  urlLeftSelection.value = []
  emit('update:form', props.form)
}

const removeUrlsFromWorkspace = () => {
  const selectedIds = urlRightSelection.value.map(item => item.id)
  props.form.selectedFileSets = props.form.selectedFileSets.filter(item => !selectedIds.includes(item.id))
  urlRightSelection.value = []
  emit('update:form', props.form)
}
</script>

<style scoped>
.transfer-panel {
  background: #fff;
  border-radius: 10px;
  padding: 18px 16px 0 16px;
  box-shadow: none;
}

.resource-tabs {
  height: 100%;
  --el-tabs-header-height: 40px;
}

.resource-tabs :deep(.el-tabs__header) {
  margin: 0 0 16px 0;
}

.resource-tabs :deep(.el-tabs__content) {
  height: calc(100% - 56px);
}

.resource-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.transfer-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
  height: 100%;
}

.transfer-list-panel {
  flex: 1;
  min-width: 0;
  background: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  background: none;
}

.panel-header h4 {
  margin: 0;
  font-size: 16px;
  color: #222c3c;
  font-weight: 600;
  letter-spacing: 0.4px;
}

.panel-search {
  flex-shrink: 0;
}

.selected-count {
  font-size: 14px;
  color: #909399;
  background: #f0f2f5;
  padding: 4px 10px;
  border-radius: 6px;
}

.transfer-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  padding: 0 8px;
  flex-shrink: 0;
}

.transfer-actions .el-button {
  min-width: 130px;
  white-space: nowrap;
  border-radius: 8px;
  font-weight: 500;
}

.transfer-actions .el-button--primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.transfer-actions .el-button--warning {
  background: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

/* 表格统一风格 */
:deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #fafbfc;
  --el-table-header-text-color: #3d4352;
  --el-table-row-hover-bg-color: #f5f7fa;
  --el-table-current-row-bg-color: #eaf3ff;
  --el-table-bg-color: transparent;
  --el-table-header-font-weight: 600;
  --el-table-font-size: 15px;
  --el-table-row-text-color: #2d2d2d;
  --el-table-header-border-bottom: 1px solid #f0f0f0;
  border-radius: 8px;
  background: none !important;
}

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
  padding: 8px 0;
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
  padding: 0 8px;
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

@media (max-width: 1200px) {
  .transfer-layout {
    flex-direction: column;
    gap: 24px;
  }

  .transfer-actions {
    flex-direction: row;
    justify-content: center;
    gap: 14px;
    padding: 16px 0;
  }

  .transfer-actions .el-button {
    min-width: 120px;
    flex: 1;
  }
}

@media (max-width: 768px) {
  .panel-header {
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .panel-search {
    width: 100%;
  }

  .panel-search .el-input {
    width: 100% !important;
  }

  .transfer-actions {
    gap: 8px;
  }
}
</style>