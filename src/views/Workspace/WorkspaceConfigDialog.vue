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
        <SummaryTab :form="form" />
      </el-tab-pane>

      <!-- 文件集 -->
      <el-tab-pane label="文件集" name="fileSet">
        <FileSetTab
            :form="form"
            :global-file-sets="globalFileSets"
            @update:form="updateForm"
        />
      </el-tab-pane>

      <!-- 数据源 -->
      <el-tab-pane label="数据源" name="datasource">
        <DatasourceTab
            :form="form"
            :global-datasources="globalDatasources"
            @update:form="updateForm"
        />
      </el-tab-pane>

      <!-- 智能体 -->
      <el-tab-pane label="智能体" name="agent">
        <AgentTab
            :selected-agent-list="form.selectedAgents"
            :global-agents="globalAgents"
            @update:selected-agent-list="updateSelectedAgents"
        />
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
import SummaryTab from './ConfigTabs/SummaryTab.vue'
import FileSetTab from './ConfigTabs/FileSetTab.vue'
import DatasourceTab from './ConfigTabs/DatasourceTab.vue'
import AgentTab from './ConfigTabs/AgentTab.vue'

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

// 更新方法
const updateForm = (newForm) => {
  Object.assign(form, newForm)
}

const updateSelectedAgents = (newAgents) => {
  form.selectedAgents = newAgents
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
}

@media (max-width: 768px) {
  .workspace-config-dialog {
    width: 100% !important;
    margin: 5vh auto;
    border-radius: 0 !important;
  }
}
</style>