<template>
  <div class="transfer-panel">
    <div class="transfer-layout">
      <!-- 左侧全局文件集 -->
      <div class="transfer-list-panel">
        <div class="panel-header">
          <h4>全局文件集</h4>
          <div class="panel-search">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索文件集"
                size="small"
                :prefix-icon="Search"
                style="width: 200px"
            />
          </div>
        </div>
        <el-table
            :data="filteredGlobalFileSets"
            border
            style="width: 100%"
            height="350"
            @selection-change="handleFileSetLeftSelection"
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
            :disabled="fileSetLeftSelection.length === 0"
            @click="addFileSetToWorkspace"
        >
          添加到工作区
        </el-button>
        <el-button
            type="warning"
            :icon="ArrowLeft"
            :disabled="fileSetRightSelection.length === 0"
            @click="removeFileSetFromWorkspace"
        >
          从工作区移除
        </el-button>
      </div>

      <!-- 右侧工作区文件集 -->
      <div class="transfer-list-panel">
        <div class="panel-header">
          <h4>工作区文件集</h4>
          <span class="selected-count">{{ form.selectedFileSets.length }} 个</span>
        </div>
        <el-table
            :data="form.selectedFileSets"
            border
            style="width: 100%"
            height="350"
            @selection-change="handleFileSetRightSelection"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="名称" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="80" />
          <el-table-column prop="size" label="大小" width="80" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

// 使用列表过滤 hook
const { searchKeyword, createFilteredList } = useListFilter()

// 创建过滤后的全局文件集列表
const filteredGlobalFileSets = createFilteredList(
    ref(props.globalFileSets),
    props.form.selectedFileSets,
    ['name', 'type']
)

// 选择状态
const fileSetLeftSelection = ref([])
const fileSetRightSelection = ref([])

// 选择处理方法
const handleFileSetLeftSelection = (selection) => {
  fileSetLeftSelection.value = selection
}

const handleFileSetRightSelection = (selection) => {
  fileSetRightSelection.value = selection
}

// 添加到工作区方法
const addFileSetToWorkspace = () => {
  fileSetLeftSelection.value.forEach(item => {
    if (!props.form.selectedFileSets.find(selected => selected.id === item.id)) {
      props.form.selectedFileSets.push(item)
    }
  })
  fileSetLeftSelection.value = []
  emit('update:form', props.form)
}

// 从工作区移除方法
const removeFileSetFromWorkspace = () => {
  const selectedIds = fileSetRightSelection.value.map(item => item.id)
  props.form.selectedFileSets = props.form.selectedFileSets.filter(item => !selectedIds.includes(item.id))
  fileSetRightSelection.value = []
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

.transfer-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
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