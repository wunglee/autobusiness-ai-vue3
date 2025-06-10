<template>
  <div class="trigger-management">
    <div class="page-header">
      <div>
        <h2>触发器实例管理</h2>
        <p class="page-description">管理和配置可在状态转换中使用的触发器实例</p>
      </div>
      <el-button type="primary" @click="createTriggerInstance">
        创建触发器实例
      </el-button>
    </div>

    <div class="content-area">
      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
                v-model="searchQuery"
                placeholder="搜索触发器实例..."
                :prefix-icon="Search"
                @input="handleSearch"
            />
          </el-col>
          <el-col :span="6">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable>
              <el-option label="已启用" value="enabled" />
              <el-option label="已禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="categoryFilter" placeholder="类型筛选" clearable>
              <el-option label="系统预设" value="condition" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button @click="clearFilters">清除筛选</el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 触发器实例网格 -->
      <div class="instances-grid">
        <div
            v-for="instance in filteredInstances"
            :key="instance.id"
            :class="['instance-card', { disabled: !instance.enabled }]"
        >
          <div class="card-header">
            <div class="instance-info">
              <h3>{{ instance.name }}</h3>
              <div class="instance-meta">
                <el-tag
                    :type="getCategoryColor(instance.category)"
                    size="small"
                    class="category-tag"
                >
                  {{ getCategoryName(instance.category) }}
                </el-tag>
              </div>
            </div>
            <div class="card-actions">
              <el-switch
                  v-model="instance.enabled"
                  @change="toggleInstanceStatus(instance)"
                  :disabled="instance.system"
              />
              <el-dropdown @command="handleAction">
                <el-button type="text" :icon="More" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="{ action: 'edit', instance }">编辑</el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'duplicate', instance }">复制</el-dropdown-item>
                    <el-dropdown-item :command="{ action: 'test', instance }">测试</el-dropdown-item>
                    <el-dropdown-item
                        v-if="!instance.system"
                        :command="{ action: 'delete', instance }"
                        divided
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="card-content">
            <p class="instance-description">{{ instance.description }}</p>

            <div class="instance-details">
              <!-- 配置参数 -->
              <div class="detail-section">
                <h4>配置参数</h4>
                <div class="config-preview">
                  <div v-for="(param, key) in instance.parameters" :key="key" class="param-item">
                    <span class="param-label">{{ getParameterLabel(key) }}:</span>
                    <span class="param-value">{{ param }}</span>
                  </div>
                </div>
              </div>

              <!-- 触发条件 -->
              <div class="detail-section" v-if="instance.conditions && instance.conditions.length > 0">
                <h4>触发条件</h4>
                <div class="conditions-preview">
                  <el-tag
                      v-for="(condition, index) in instance.conditions.slice(0, 3)"
                      :key="index"
                      size="small"
                      effect="plain"
                  >
                    {{ condition.attribute }} {{ condition.operator }} {{ condition.value }}
                  </el-tag>
                  <span v-if="instance.conditions.length > 3" class="more-conditions">
                    +{{ instance.conditions.length - 3 }}个条件
                  </span>
                </div>
              </div>

              <!-- 使用统计 -->
              <div class="detail-section">
                <h4>使用统计</h4>
                <div class="usage-stats">
                  <span class="stat-item">
                    <el-icon><Link /></el-icon>
                    {{ instance.usageCount || 0 }} 个转换使用
                  </span>
                  <span class="stat-item">
                    <el-icon><Clock /></el-icon>
                    最后触发: {{ formatDate(instance.lastTriggered) }}
                  </span>
                  <span class="stat-item">
                    <el-icon><Check /></el-icon>
                    成功率: {{ instance.successRate || 0 }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="system-badge" v-if="instance.system">
              <el-icon><Lock /></el-icon>
              系统预设
            </div>
            <div class="create-info">
              创建于 {{ formatDate(instance.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredInstances.length === 0" class="empty-state">
        <el-icon class="empty-icon"><DocumentAdd /></el-icon>
        <p>暂无触发器实例</p>
        <p class="empty-description">创建触发器实例，用于在状态转换中定义具体的触发条件和参数</p>
        <el-button type="primary" @click="createTriggerInstance">
          创建第一个触发器实例
        </el-button>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
        v-model="showCreateDialog"
        :title="editMode ? '编辑触发器实例' : '创建触发器实例'"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="instanceForm"
          :model="currentInstance"
          :rules="formRules"
          label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实例名称" prop="name">
              <el-input
                  v-model="currentInstance.name"
                  placeholder="请输入触发器实例名称"
                  maxlength="50"
                  show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="currentInstance.category" placeholder="选择分类">
                <el-option label="系统预设" value="condition" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="currentInstance.enabled" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="currentInstance.description"
              type="textarea"
              :rows="3"
              placeholder="请输入触发器实例描述"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <!-- 配置参数 -->
        <el-form-item label="配置参数">
          <div class="parameters-editor">
            <div
                v-for="(param, index) in currentInstance.parametersList"
                :key="index"
                class="parameter-item"
            >
              <el-row :gutter="12">
                <el-col :span="8">
                  <el-input
                      v-model="param.key"
                      placeholder="参数名"
                  />
                </el-col>
                <el-col :span="8">
                  <el-input
                      v-model="param.value"
                      placeholder="参数值"
                  />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="param.type" placeholder="类型">
                    <el-option label="文本" value="text" />
                    <el-option label="数字" value="number" />
                    <el-option label="日期" value="date" />
                    <el-option label="布尔" value="boolean" />
                  </el-select>
                </el-col>
                <el-col :span="2">
                  <el-button
                      type="danger"
                      :icon="Delete"
                      @click="removeParameter(index)"
                      title="删除参数"
                  />
                </el-col>
              </el-row>
            </div>
            <el-button
                type="primary"
                :icon="Plus"
                @click="addParameter"
                plain
                size="small"
            >
              添加参数
            </el-button>
          </div>
        </el-form-item>

        <!-- 触发条件 -->
        <el-form-item label="触发条件">
          <div class="conditions-editor">
            <div
                v-for="(condition, index) in currentInstance.conditions"
                :key="index"
                class="condition-item"
            >
              <el-row :gutter="12">
                <el-col :span="6">
                  <el-input
                      v-model="condition.attribute"
                      placeholder="属性名"
                  />
                </el-col>
                <el-col :span="6">
                  <el-select v-model="condition.operator" placeholder="操作符">
                    <el-option label="等于" value="等于" />
                    <el-option label="不等于" value="不等于" />
                    <el-option label="大于" value="大于" />
                    <el-option label="小于" value="小于" />
                    <el-option label="包含" value="包含" />
                  </el-select>
                </el-col>
                <el-col :span="8">
                  <el-input
                      v-model="condition.value"
                      placeholder="条件值"
                  />
                </el-col>
                <el-col :span="4">
                  <el-button
                      type="danger"
                      :icon="Delete"
                      @click="removeCondition(index)"
                      title="删除条件"
                  />
                </el-col>
              </el-row>
            </div>
            <el-button
                type="primary"
                :icon="Plus"
                @click="addCondition"
                plain
                size="small"
            >
              添加条件
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveInstance" :loading="saving">
          {{ editMode ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  More,
  Plus,
  Delete,
  DocumentAdd,
  Link,
  Clock,
  Check,
  Lock
} from '@element-plus/icons-vue'

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const showCreateDialog = ref(false)
const editMode = ref(false)
const saving = ref(false)

// 表单引用
const instanceForm = ref(null)

// 触发器实例数据
const triggerInstances = ref([
  {
    id: 1,
    name: '高优先级任务检查',
    description: '检查任务优先级和进度，当高优先级任务完成度达标时自动转换',
    category: 'condition',
    enabled: true,
    system: false,
    usageCount: 15,
    lastTriggered: new Date('2024-06-06'),
    successRate: 92,
    createdAt: new Date('2024-03-01'),
    parameters: {
      checkInterval: '60',
      priority: 'high'
    },
    parametersList: [
      { key: 'checkInterval', value: '60', type: 'number' },
      { key: 'priority', value: 'high', type: 'text' }
    ],
    conditions: [
      { attribute: 'priority', operator: '等于', value: 'high' },
      { attribute: 'progress', operator: '大于', value: '80' }
    ]
  },
  {
    id: 2,
    name: '截止日期预警',
    description: '监控任务截止日期，在临近时自动触发预警转换',
    category: 'time',
    enabled: false,
    system: false,
    usageCount: 3,
    lastTriggered: new Date('2024-05-20'),
    successRate: 100,
    createdAt: new Date('2024-04-01'),
    parameters: {
      warningDays: '3',
      checkTime: '08:00'
    },
    parametersList: [
      { key: 'warningDays', value: '3', type: 'number' },
      { key: 'checkTime', value: '08:00', type: 'text' }
    ],
    conditions: [
      { attribute: 'due_date', operator: '小于', value: 'today+3days' }
    ]
  }
])

// 当前编辑的触发器实例
const currentInstance = ref({
  name: '',
  description: '',
  category: '',
  enabled: true,
  system: false,
  parameters: {},
  parametersList: [],
  conditions: []
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入触发器实例名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入描述', trigger: 'blur' },
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 计算属性
const filteredInstances = computed(() => {
  let result = triggerInstances.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(instance =>
        instance.name.toLowerCase().includes(query) ||
        instance.description.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(instance =>
        statusFilter.value === 'enabled' ? instance.enabled : !instance.enabled
    )
  }

  if (categoryFilter.value) {
    result = result.filter(instance => instance.category === categoryFilter.value)
  }

  return result
})

// 方法
const getCategoryName = (category) => {
  const names = {
    'condition': '系统预设',
    'custom': '自定义'
  }
  return names[category] || category
}

const getCategoryColor = (category) => {
  const colors = {
    'time': 'success',
    'event': 'primary',
    'condition': 'warning',
    'custom': 'info'
  }
  return colors[category] || 'info'
}

const formatDate = (date) => {
  if (!date) return '从未'
  return date.toLocaleDateString('zh-CN')
}

const getParameterLabel = (key) => {
  const labels = {
    interval: '间隔',
    unit: '单位',
    startTime: '开始时间',
    workdaysOnly: '仅工作日',
    eventType: '事件类型',
    eventName: '事件名称',
    timeout: '超时时间',
    checkInterval: '检查间隔',
    priority: '优先级',
    warningDays: '预警天数',
    checkTime: '检查时间'
  }
  return labels[key] || key
}

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
}

const toggleInstanceStatus = (instance) => {
  ElMessage.success(`触发器实例已${instance.enabled ? '启用' : '禁用'}`)
}

const handleAction = ({ action, instance }) => {
  switch (action) {
    case 'edit':
      editInstance(instance)
      break
    case 'duplicate':
      duplicateInstance(instance)
      break
    case 'test':
      testInstance(instance)
      break
    case 'delete':
      deleteInstance(instance)
      break
  }
}

const createTriggerInstance = () => {
  editMode.value = false
  resetForm()
  showCreateDialog.value = true
}

const editInstance = (instance) => {
  currentInstance.value = JSON.parse(JSON.stringify(instance))
  editMode.value = true
  showCreateDialog.value = true
}

const duplicateInstance = (instance) => {
  const duplicated = JSON.parse(JSON.stringify(instance))
  duplicated.id = Date.now()
  duplicated.name = instance.name + ' - 副本'
  duplicated.system = false
  duplicated.usageCount = 0
  duplicated.lastTriggered = null
  duplicated.successRate = 0
  duplicated.createdAt = new Date()

  triggerInstances.value.push(duplicated)
  ElMessage.success('触发器实例复制成功')
}

const testInstance = (instance) => {
  ElMessage.info(`正在测试触发器实例 "${instance.name}"...`)
  // 这里可以添加实际的测试逻辑
  setTimeout(() => {
    ElMessage.success('触发器实例测试成功')
  }, 2000)
}

const deleteInstance = async (instance) => {
  if (instance.usageCount > 0) {
    ElMessage.warning('该触发器实例正在被使用，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定要删除触发器实例"${instance.name}"吗？此操作不可恢复。`,
        '确认删除',
        { type: 'warning' }
    )

    triggerInstances.value = triggerInstances.value.filter(t => t.id !== instance.id)
    ElMessage.success('触发器实例删除成功')
  } catch {
    // 用户取消删除
  }
}

const addParameter = () => {
  currentInstance.value.parametersList.push({
    key: '',
    value: '',
    type: 'text'
  })
}

const removeParameter = (index) => {
  currentInstance.value.parametersList.splice(index, 1)
}

const addCondition = () => {
  currentInstance.value.conditions.push({
    attribute: '',
    operator: '等于',
    value: ''
  })
}

const removeCondition = (index) => {
  currentInstance.value.conditions.splice(index, 1)
}

const resetForm = () => {
  currentInstance.value = {
    name: '',
    description: '',
    category: '',
    enabled: true,
    system: false,
    parameters: {},
    parametersList: [],
    conditions: []
  }
  instanceForm.value?.clearValidate()
}

const saveInstance = async () => {
  try {
    await instanceForm.value.validate()
    saving.value = true

    // 转换parametersList为parameters对象
    const parameters = {}
    currentInstance.value.parametersList.forEach(param => {
      if (param.key) {
        parameters[param.key] = param.value
      }
    })
    currentInstance.value.parameters = parameters

    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editMode.value) {
      const index = triggerInstances.value.findIndex(t => t.id === currentInstance.value.id)
      if (index !== -1) {
        triggerInstances.value[index] = { ...currentInstance.value }
      }
      ElMessage.success('触发器实例更新成功')
    } else {
      const newInstance = {
        ...currentInstance.value,
        id: Date.now(),
        usageCount: 0,
        lastTriggered: null,
        successRate: 0,
        createdAt: new Date()
      }
      triggerInstances.value.push(newInstance)
      ElMessage.success('触发器实例创建成功')
    }

    showCreateDialog.value = false
    editMode.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 生命周期
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.trigger-management {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-description {
  margin: 8px 0 0 0;
  color: #606266;
  font-size: 14px;
}

.content-area {
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.search-bar {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.instances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.instance-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.instance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.instance-card.disabled {
  opacity: 0.6;
}

.card-header {
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.instance-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.instance-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-tag {
  margin-right: 8px;
}

.instance-type {
  font-size: 12px;
  color: #909399;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-content {
  padding: 20px;
}

.instance-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.5;
}

.instance-details {
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.config-preview {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.param-label {
  color: #909399;
  min-width: 60px;
}

.param-value {
  color: #303133;
  font-weight: 500;
}

.conditions-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.more-conditions {
  font-size: 12px;
  color: #909399;
}

.usage-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  font-size: 12px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-footer {
  padding: 12px 20px;
  background: #fafbfc;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.system-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e6a23c;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.empty-description {
  margin: 8px 0 24px 0;
  font-size: 14px;
  line-height: 1.5;
}

.parameters-editor,
.conditions-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #fafbfc;
}

.parameter-item,
.condition-item {
  margin-bottom: 12px;
}

.parameter-item:last-child,
.condition-item:last-child {
  margin-bottom: 0;
}
</style>