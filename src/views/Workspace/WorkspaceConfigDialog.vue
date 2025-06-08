<template>
  <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="1000px"
      :close-on-click-modal="false"
      class="workspace-config-dialog"
      @close="onCancel"
  >
    <el-tabs v-model="activeTab" type="card" class="workspace-config-tabs">
      <!-- 摘要 -->
      <el-tab-pane label="摘要" name="summary">
        <div class="tab-pane-content summary-pane">
          <el-form :model="form" label-width="90px">
            <el-form-item label="工作组名称" required>
              <el-input v-model="form.name" placeholder="请输入工作组名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="任务描述">
              <el-input
                  v-model="form.description"
                  type="textarea"
                  placeholder="请输入任务描述"
                  maxlength="200"
                  show-word-limit
                  :rows="4"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 文件集 -->
      <el-tab-pane label="文件集" name="fileSet">
        <div class="transfer-panel">
          <div class="transfer-layout">
            <!-- 左侧全局文件集 -->
            <div class="transfer-list-panel">
              <div class="panel-header">
                <h4>全局文件集</h4>
                <div class="panel-search">
                  <el-input
                      v-model="fileSetSearchKeyword"
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
      </el-tab-pane>

      <!-- 数据源 -->
      <el-tab-pane label="数据源" name="datasource">
        <div class="transfer-panel">
          <div class="transfer-layout">
            <!-- 左侧全局数据源 -->
            <div class="transfer-list-panel">
              <div class="panel-header">
                <h4>全局数据源</h4>
                <div class="panel-search">
                  <el-input
                      v-model="datasourceSearchKeyword"
                      placeholder="搜索数据源"
                      size="small"
                      :prefix-icon="Search"
                      style="width: 200px"
                  />
                </div>
              </div>
              <el-table
                  :data="filteredGlobalDatasources"
                  border
                  style="width: 100%"
                  height="350"
                  @selection-change="handleDatasourceLeftSelection"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column prop="name" label="名称" show-overflow-tooltip />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'connected' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'connected' ? '已测试' : '未测试' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 中间操作按钮 -->
            <div class="transfer-actions">
              <el-button
                  type="primary"
                  :icon="ArrowRight"
                  :disabled="datasourceLeftSelection.length === 0"
                  @click="addDatasourceToWorkspace"
              >
                添加到工作区
              </el-button>
              <el-button
                  type="warning"
                  :icon="ArrowLeft"
                  :disabled="datasourceRightSelection.length === 0"
                  @click="removeDatasourceFromWorkspace"
              >
                从工作区移除
              </el-button>
            </div>

            <!-- 右侧工作区数据源 -->
            <div class="transfer-list-panel">
              <div class="panel-header">
                <h4>工作区数据源</h4>
                <span class="selected-count">{{ form.selectedDatasources.length }} 个</span>
              </div>
              <el-table
                  :data="form.selectedDatasources"
                  border
                  style="width: 100%"
                  height="350"
                  @selection-change="handleDatasourceRightSelection"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column prop="name" label="名称" show-overflow-tooltip />
                <el-table-column prop="type" label="类型" width="100" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === 'connected' ? 'success' : 'danger'" size="small">
                      {{ row.status === 'connected' ? '已测试' : '未测试' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-tab-pane>


      <!-- 智能体 -->
      <el-tab-pane label="智能体" name="agent">
        <div class="transfer-panel">
          <div class="transfer-layout">
            <!-- 左侧全局智能体 -->
            <div class="transfer-list-panel">
              <div class="panel-header">
                <h4>全局智能体</h4>
                <div class="panel-search">
                  <el-input
                      v-model="agentSearchKeyword"
                      placeholder="搜索智能体"
                      size="small"
                      :prefix-icon="Search"
                      style="width: 200px"
                  />
                </div>
              </div>
              <el-table
                  :data="filteredGlobalAgents"
                  border
                  style="width: 100%"
                  height="350"
                  @selection-change="handleAgentLeftSelection"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column prop="name" label="名称" show-overflow-tooltip />
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
              </el-table>
            </div>

            <!-- 中间操作按钮 -->
            <div class="transfer-actions">
              <el-button
                  type="primary"
                  :icon="ArrowRight"
                  :disabled="agentLeftSelection.length === 0"
                  @click="addAgentToWorkspace"
              >
                添加到工作区
              </el-button>
              <el-button
                  type="warning"
                  :icon="ArrowLeft"
                  :disabled="agentRightSelection.length === 0"
                  @click="removeAgentFromWorkspace"
              >
                从工作区移除
              </el-button>
            </div>

            <!-- 右侧工作区智能体 -->
            <div class="transfer-list-panel">
              <div class="panel-header">
                <h4>工作区智能体</h4>
                <span class="selected-count">{{ form.selectedAgents.length }} 个</span>
              </div>
              <el-table
                  :data="form.selectedAgents"
                  border
                  style="width: 100%"
                  height="350"
                  @selection-change="handleAgentRightSelection"
              >
                <el-table-column type="selection" width="50" />
                <el-table-column prop="name" label="名称" show-overflow-tooltip />
                <el-table-column prop="category" label="分类" width="100" />
                <el-table-column prop="description" label="描述" show-overflow-tooltip />
              </el-table>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <div class="footer-actions">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowRight, ArrowLeft, Search, Check, Close } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  editing: Boolean,
  value: Object
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

const dialogTitle = computed(() => props.editing ? '编辑工作区' : '创建工作区')
const activeTab = ref('summary')

// 表单数据
const form = reactive({
  name: '',
  description: '',
  selectedFileSets: [],
  selectedDatasources: [],
  selectedAgents: [],
})

// 搜索关键词
const fileSetSearchKeyword = ref('')
const datasourceSearchKeyword = ref('')
const agentSearchKeyword = ref('')


// 选择状态
const fileSetLeftSelection = ref([])
const fileSetRightSelection = ref([])
const datasourceLeftSelection = ref([])
const datasourceRightSelection = ref([])
const agentLeftSelection = ref([])
const agentRightSelection = ref([])


// 全局资源数据
const globalFileSets = ref([
  { id: 1, name: 'project-docs.pdf', type: '文档', size: '2.5MB', path: '/files/project-docs.pdf' },
  { id: 2, name: 'data-sample.xlsx', type: '表格', size: '1.2MB', path: '/files/data-sample.xlsx' },
  { id: 3, name: '用户手册.docx', type: '文档', size: '800KB', path: '/files/user-manual.docx' },
  { id: 4, name: 'API文档', type: '网址', size: '-', url: 'https://api.example.com/docs' },
  { id: 5, name: '技术博客', type: '网址', size: '-', url: 'https://blog.example.com' }
])

const globalDatasources = ref([
  { id: 1, name: '用户数据库', type: 'MySQL', status: 'connected', host: 'localhost', port: 3306 },
  { id: 2, name: '产品数据库', type: 'PostgreSQL', status: 'disconnected', host: '192.168.1.100', port: 5432 },
  { id: 3, name: 'Redis缓存', type: 'Redis', status: 'connected', host: 'redis.example.com', port: 6379 },
  { id: 4, name: '分析数据库', type: 'MongoDB', status: 'connected', host: 'mongo.example.com', port: 27017 }
])

const globalAgents = ref([
  { id: 1, name: '编程助手', category: '开发工具', description: '专业的编程和代码优化助手' },
  { id: 2, name: '数据分析师', category: '数据分析', description: '数据处理和分析专家' },
  { id: 3, name: '文档编写员', category: '文档工具', description: '专业的文档编写和格式化助手' },
  { id: 4, name: '项目经理', category: '管理工具', description: '项目规划和管理助手' },
  { id: 5, name: '测试工程师', category: '测试工具', description: '自动化测试和质量保证助手' }
])

// 过滤后的数据
const filteredGlobalFileSets = computed(() => {
  const keyword = fileSetSearchKeyword.value.toLowerCase()
  const selected = form.selectedFileSets.map(item => item.id)
  return globalFileSets.value.filter(item =>
      !selected.includes(item.id) &&
      (item.name.toLowerCase().includes(keyword) || item.type.toLowerCase().includes(keyword))
  )
})

const filteredGlobalDatasources = computed(() => {
  const keyword = datasourceSearchKeyword.value.toLowerCase()
  const selected = form.selectedDatasources.map(item => item.id)
  return globalDatasources.value.filter(item =>
      !selected.includes(item.id) &&
      (item.name.toLowerCase().includes(keyword) || item.type.toLowerCase().includes(keyword))
  )
})


const filteredGlobalAgents = computed(() => {
  const keyword = agentSearchKeyword.value.toLowerCase()
  const selected = form.selectedAgents.map(item => item.id)
  return globalAgents.value.filter(item =>
      !selected.includes(item.id) &&
      (item.name.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword))
  )
})


// 选择处理方法
const handleFileSetLeftSelection = (selection) => { fileSetLeftSelection.value = selection }
const handleFileSetRightSelection = (selection) => { fileSetRightSelection.value = selection }
const handleDatasourceLeftSelection = (selection) => { datasourceLeftSelection.value = selection }
const handleDatasourceRightSelection = (selection) => { datasourceRightSelection.value = selection }
const handleAgentLeftSelection = (selection) => { agentLeftSelection.value = selection }
const handleAgentRightSelection = (selection) => { agentRightSelection.value = selection }

// 添加到工作区方法
const addFileSetToWorkspace = () => {
  fileSetLeftSelection.value.forEach(item => {
    if (!form.selectedFileSets.find(selected => selected.id === item.id)) {
      form.selectedFileSets.push(item)
    }
  })
  fileSetLeftSelection.value = []
}

const addDatasourceToWorkspace = () => {
  datasourceLeftSelection.value.forEach(item => {
    if (!form.selectedDatasources.find(selected => selected.id === item.id)) {
      form.selectedDatasources.push(item)
    }
  })
  datasourceLeftSelection.value = []
}


const addAgentToWorkspace = () => {
  agentLeftSelection.value.forEach(item => {
    if (!form.selectedAgents.find(selected => selected.id === item.id)) {
      form.selectedAgents.push(item)
    }
  })
  agentLeftSelection.value = []
}


// 从工作区移除方法
const removeFileSetFromWorkspace = () => {
  const selectedIds = fileSetRightSelection.value.map(item => item.id)
  form.selectedFileSets = form.selectedFileSets.filter(item => !selectedIds.includes(item.id))
  fileSetRightSelection.value = []
}

const removeDatasourceFromWorkspace = () => {
  const selectedIds = datasourceRightSelection.value.map(item => item.id)
  form.selectedDatasources = form.selectedDatasources.filter(item => !selectedIds.includes(item.id))
  datasourceRightSelection.value = []
}

const removeAgentFromWorkspace = () => {
  const selectedIds = agentRightSelection.value.map(item => item.id)
  form.selectedAgents = form.selectedAgents.filter(item => !selectedIds.includes(item.id))
  agentRightSelection.value = []
}


// 对话框操作
const onCancel = () => {
  visible.value = false
  emit('cancel')
}

const onConfirm = () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入工作区名称')
    return
  }

  visible.value = false
  emit('confirm', JSON.parse(JSON.stringify(form)))
}

// 初始化表单数据
watch(() => props.value, (newValue) => {
  if (newValue) {
    Object.assign(form, {
      name: newValue.name || '',
      description: newValue.description || '',
      selectedFileSets: newValue.selectedFileSets || [],
      selectedDatasources: newValue.selectedDatasources || [],
      selectedAgents: newValue.selectedAgents || []
    })
  }
}, { immediate: true })
</script>

<style scoped>
.workspace-config-dialog {
  --el-dialog-bg-color: #fff;
  border-radius: 10px !important;
  box-shadow: 0 4px 24px rgba(0, 28, 64, 0.08) !important;
  padding: 0 !important;
}

.workspace-config-tabs {
  min-height: 520px;
  padding: 0 0 10px 0;
}

.tab-pane-content {
  padding: 32px 32px 10px 32px;
  background: #fff;
  border-radius: 10px;
}

.summary-pane .el-form {
  background: none;
  max-width: 560px;
  margin: 0 auto;
  padding: 0;
}
:deep(.summary-pane .el-form-item__label) {
  color: #344563;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.1px;
}
:deep(.summary-pane .el-form-item__content) {
  font-size: 15px;
}

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

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
.footer-actions .el-button {
  border-radius: 8px;
  min-width: 100px;
  font-weight: 500;
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

/* 弹窗内输入、选择框圆角背景 */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 6px !important;
  background: #f5f7fa !important;
  border: 1px solid #e3e5e8 !important;
  box-shadow: none !important;
  font-size: 15px;
}
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-size: 15px;
  color: #222c3c;
}

@media (max-width: 1200px) {
  .workspace-config-dialog {
    width: 98% !important;
    max-width: 900px;
  }
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
  .workspace-config-dialog {
    width: 100% !important;
    margin: 5vh auto;
    border-radius: 0 !important;
  }
  .tab-pane-content, .transfer-panel {
    padding: 12px 0 0 0;
  }
  .panel-header { flex-direction: column; gap: 6px; align-items: stretch; }
  .panel-search { width: 100%; }
  .panel-search .el-input { width: 100% !important; }
  .transfer-actions { gap: 8px; }
}
</style>