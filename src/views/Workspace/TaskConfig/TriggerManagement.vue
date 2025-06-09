<template>
  <div class="trigger-management">
    <div class="page-header">
      <h2>触发器类型管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i>
        新建触发器类型
      </el-button>
    </div>

    <div class="content-area">
      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
                v-model="searchQuery"
                placeholder="搜索触发器名称或描述"
                clearable
                @input="handleSearch"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-select
                v-model="statusFilter"
                placeholder="状态筛选"
                clearable
                @change="handleSearch"
            >
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select
                v-model="categoryFilter"
                placeholder="分类筛选"
                clearable
                @change="handleSearch"
            >
              <el-option label="时间类" value="time" />
              <el-option label="事件类" value="event" />
              <el-option label="条件类" value="condition" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 触发器列表 -->
      <div class="trigger-grid">
        <div
            v-for="trigger in filteredTriggers"
            :key="trigger.id"
            class="trigger-card"
            :class="{ 'disabled': !trigger.enabled }"
        >
          <div class="card-header">
            <div class="trigger-info">
              <h3 class="trigger-name">{{ trigger.name }}</h3>
              <span class="trigger-category" :class="trigger.category">
                {{ getCategoryName(trigger.category) }}
              </span>
            </div>
            <div class="card-actions">
              <el-switch
                  v-model="trigger.enabled"
                  @change="toggleTriggerStatus(trigger)"
                  :disabled="trigger.system"
              />
              <el-dropdown @command="handleAction">
                <el-button type="text" size="small">
                  <i class="el-icon-more"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                        :command="{ action: 'edit', trigger }"
                        :disabled="trigger.system"
                    >
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item
                        :command="{ action: 'duplicate', trigger }"
                    >
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item
                        :command="{ action: 'delete', trigger }"
                        :disabled="trigger.system"
                        style="color: #f56c6c;"
                    >
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="card-content">
            <p class="trigger-description">{{ trigger.description }}</p>

            <div class="trigger-details">
              <div class="detail-section">
                <h4>触发条件配置</h4>
                <div class="config-preview">
                  <el-tag
                      v-for="field in trigger.configFields.slice(0, 3)"
                      :key="field.key"
                      size="small"
                      effect="plain"
                  >
                    {{ field.label }}
                  </el-tag>
                  <span v-if="trigger.configFields.length > 3" class="more-fields">
                    +{{ trigger.configFields.length - 3 }}项
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <h4>使用统计</h4>
                <div class="usage-stats">
                  <span class="stat-item">
                    <i class="el-icon-link"></i>
                    {{ trigger.usageCount || 0 }} 个连线使用
                  </span>
                  <span class="stat-item">
                    <i class="el-icon-time"></i>
                    {{ formatDate(trigger.lastUsed) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="system-badge" v-if="trigger.system">
              <i class="el-icon-lock"></i>
              系统内置
            </div>
            <div class="create-info">
              创建于 {{ formatDate(trigger.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredTriggers.length === 0" class="empty-state">
        <i class="el-icon-info"></i>
        <p>暂无触发器类型</p>
        <el-button type="primary" @click="showCreateDialog = true">
          创建第一个触发器类型
        </el-button>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
        v-model="showCreateDialog"
        :title="editMode ? '编辑触发器类型' : '新建触发器类型'"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="triggerForm"
          :model="currentTrigger"
          :rules="formRules"
          label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="触发器名称" prop="name">
              <el-input
                  v-model="currentTrigger.name"
                  placeholder="请输入触发器名称"
                  maxlength="50"
                  show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category">
              <el-select v-model="currentTrigger.category" placeholder="选择分类">
                <el-option label="时间类" value="time" />
                <el-option label="事件类" value="event" />
                <el-option label="条件类" value="condition" />
                <el-option label="自定义" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="currentTrigger.description"
              type="textarea"
              :rows="3"
              placeholder="请输入触发器描述"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="图标">
          <el-select v-model="currentTrigger.icon" placeholder="选择图标">
            <el-option label="⏰ 时钟" value="clock" />
            <el-option label="⚡ 闪电" value="lightning" />
            <el-option label="🔔 铃铛" value="bell" />
            <el-option label="🎯 目标" value="target" />
            <el-option label="⚙️ 设置" value="settings" />
          </el-select>
        </el-form-item>

        <el-form-item label="配置字段">
          <div class="config-fields-editor">
            <div
                v-for="(field, index) in currentTrigger.configFields"
                :key="index"
                class="field-item"
            >
              <el-row :gutter="10">
                <el-col :span="6">
                  <el-input
                      v-model="field.key"
                      placeholder="字段标识"
                      size="small"
                  />
                </el-col>
                <el-col :span="6">
                  <el-input
                      v-model="field.label"
                      placeholder="字段标签"
                      size="small"
                  />
                </el-col>
                <el-col :span="4">
                  <el-select v-model="field.type" placeholder="类型" size="small">
                    <el-option label="文本" value="text" />
                    <el-option label="数字" value="number" />
                    <el-option label="选择" value="select" />
                    <el-option label="开关" value="switch" />
                    <el-option label="日期" value="date" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-checkbox v-model="field.required" size="small">
                    必填
                  </el-checkbox>
                </el-col>
                <el-col :span="4">
                  <el-button
                      @click="removeConfigField(index)"
                      size="small"
                      type="danger"
                      icon="el-icon-delete"
                  />
                </el-col>
              </el-row>

              <!-- 选择类型的选项配置 -->
              <div v-if="field.type === 'select'" class="field-options">
                <el-tag
                    v-for="(option, optIndex) in field.options"
                    :key="optIndex"
                    closable
                    @close="removeFieldOption(index, optIndex)"
                    size="small"
                >
                  {{ option }}
                </el-tag>
                <el-input
                    v-model="newOptionValue"
                    placeholder="添加选项"
                    size="small"
                    style="width: 120px; margin-left: 8px;"
                    @keyup.enter="addFieldOption(index)"
                />
                <el-button
                    @click="addFieldOption(index)"
                    size="small"
                    type="primary"
                    icon="el-icon-plus"
                />
              </div>
            </div>

            <el-button
                @click="addConfigField"
                type="dashed"
                icon="el-icon-plus"
                style="width: 100%; margin-top: 10px;"
            >
              添加配置字段
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="执行脚本">
          <div class="script-editor">
            <el-input
                v-model="currentTrigger.script"
                type="textarea"
                :rows="8"
                placeholder="请输入触发器执行逻辑的JavaScript代码..."
            />
            <div class="script-help">
              <el-alert
                  title="脚本说明"
                  type="info"
                  :closable="false"
                  show-icon
              >
                <template #default>
                  <p>可用变量：</p>
                  <ul>
                    <li><code>state</code>: 当前状态对象</li>
                    <li><code>config</code>: 触发器配置参数</li>
                    <li><code>context</code>: 工作流上下文</li>
                  </ul>
                  <p>返回 <code>true</code> 表示触发条件满足</p>
                </template>
              </el-alert>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button @click="resetForm">重置</el-button>
        <el-button type="primary" @click="saveTrigger" :loading="saving">
          {{ editMode ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const showCreateDialog = ref(false)
const editMode = ref(false)
const saving = ref(false)
const newOptionValue = ref('')

// 表单引用
const triggerForm = ref(null)

// 触发器数据
const triggers = ref([
  {
    id: 1,
    name: '定时触发器',
    description: '基于时间间隔或特定时间点触发状态迁移',
    category: 'time',
    icon: 'clock',
    enabled: true,
    system: true,
    usageCount: 5,
    lastUsed: new Date('2024-06-01'),
    createdAt: new Date('2024-01-01'),
    configFields: [
      { key: 'interval', label: '时间间隔', type: 'number', required: true },
      { key: 'unit', label: '时间单位', type: 'select', options: ['秒', '分钟', '小时', '天'], required: true },
      { key: 'startTime', label: '开始时间', type: 'date', required: false }
    ],
    script: `
// 定时触发器逻辑
const now = new Date();
const startTime = new Date(config.startTime || state.createdAt);
const intervalMs = config.interval * getIntervalMultiplier(config.unit);

return now - startTime >= intervalMs;

function getIntervalMultiplier(unit) {
  const multipliers = {
    '秒': 1000,
    '分钟': 60 * 1000,
    '小时': 60 * 60 * 1000,
    '天': 24 * 60 * 60 * 1000
  };
  return multipliers[unit] || 1000;
}
    `
  },
  {
    id: 2,
    name: '事件触发器',
    description: '响应特定事件触发状态迁移',
    category: 'event',
    icon: 'lightning',
    enabled: true,
    system: true,
    usageCount: 3,
    lastUsed: new Date('2024-05-15'),
    createdAt: new Date('2024-01-15'),
    configFields: [
      { key: 'eventType', label: '事件类型', type: 'select', options: ['用户操作', '系统事件', '外部API'], required: true },
      { key: 'eventName', label: '事件名称', type: 'text', required: true },
      { key: 'timeout', label: '超时时间(秒)', type: 'number', required: false }
    ],
    script: `
// 事件触发器逻辑
const targetEvent = config.eventName;
const recentEvents = context.events || [];

// 检查最近是否有匹配的事件
const matchingEvent = recentEvents.find(event =>
  event.type === config.eventType &&
  event.name === targetEvent &&
  event.timestamp > state.lastCheckTime
);

return !!matchingEvent;
    `
  },
  {
    id: 3,
    name: '条件触发器',
    description: '基于状态属性条件判断触发状态迁移',
    category: 'condition',
    icon: 'target',
    enabled: true,
    system: false,
    usageCount: 8,
    lastUsed: new Date('2024-06-05'),
    createdAt: new Date('2024-02-01'),
    configFields: [
      { key: 'attribute', label: '监控属性', type: 'text', required: true },
      { key: 'operator', label: '比较操作', type: 'select', options: ['等于', '不等于', '大于', '小于', '包含'], required: true },
      { key: 'value', label: '目标值', type: 'text', required: true },
      { key: 'checkInterval', label: '检查间隔(秒)', type: 'number', required: false }
    ],
    script: `
// 条件触发器逻辑
const attributeValue = state.attributes[config.attribute];
const targetValue = config.value;

switch(config.operator) {
  case '等于':
    return attributeValue == targetValue;
  case '不等于':
    return attributeValue != targetValue;
  case '大于':
    return Number(attributeValue) > Number(targetValue);
  case '小于':
    return Number(attributeValue) < Number(targetValue);
  case '包含':
    return String(attributeValue).includes(targetValue);
  default:
    return false;
}
    `
  }
])

// 当前编辑的触发器
const currentTrigger = ref({
  name: '',
  description: '',
  category: '',
  icon: '',
  enabled: true,
  system: false,
  configFields: [],
  script: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入触发器名称', trigger: 'blur' },
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
const filteredTriggers = computed(() => {
  let result = triggers.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(trigger =>
        trigger.name.toLowerCase().includes(query) ||
        trigger.description.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    result = result.filter(trigger =>
        statusFilter.value === 'enabled' ? trigger.enabled : !trigger.enabled
    )
  }

  if (categoryFilter.value) {
    result = result.filter(trigger => trigger.category === categoryFilter.value)
  }

  return result
})

// 方法
const getCategoryName = (category) => {
  const names = {
    'time': '时间类',
    'event': '事件类',
    'condition': '条件类',
    'custom': '自定义'
  }
  return names[category] || category
}

const formatDate = (date) => {
  if (!date) return '未使用'
  return date.toLocaleDateString('zh-CN')
}

const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

const toggleTriggerStatus = (trigger) => {
  ElMessage.success(`触发器已${trigger.enabled ? '启用' : '禁用'}`)
}

const handleAction = ({ action, trigger }) => {
  switch (action) {
    case 'edit':
      editTrigger(trigger)
      break
    case 'duplicate':
      duplicateTrigger(trigger)
      break
    case 'delete':
      deleteTrigger(trigger)
      break
  }
}

const editTrigger = (trigger) => {
  currentTrigger.value = JSON.parse(JSON.stringify(trigger))
  editMode.value = true
  showCreateDialog.value = true
}

const duplicateTrigger = (trigger) => {
  const duplicated = JSON.parse(JSON.stringify(trigger))
  duplicated.id = Date.now()
  duplicated.name = trigger.name + ' - 副本'
  duplicated.system = false
  duplicated.usageCount = 0
  duplicated.lastUsed = null
  duplicated.createdAt = new Date()

  triggers.value.push(duplicated)
  ElMessage.success('触发器复制成功')
}

const deleteTrigger = async (trigger) => {
  if (trigger.usageCount > 0) {
    ElMessage.warning('该触发器正在被使用，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(
        `确定要删除触发器"${trigger.name}"吗？此操作不可恢复。`,
        '确认删除',
        { type: 'warning' }
    )

    triggers.value = triggers.value.filter(t => t.id !== trigger.id)
    ElMessage.success('触发器删除成功')
  } catch {
    // 用户取消删除
  }
}

const addConfigField = () => {
  currentTrigger.value.configFields.push({
    key: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  })
}

const removeConfigField = (index) => {
  currentTrigger.value.configFields.splice(index, 1)
}

const addFieldOption = (fieldIndex) => {
  if (newOptionValue.value.trim()) {
    if (!currentTrigger.value.configFields[fieldIndex].options) {
      currentTrigger.value.configFields[fieldIndex].options = []
    }
    currentTrigger.value.configFields[fieldIndex].options.push(newOptionValue.value.trim())
    newOptionValue.value = ''
  }
}

const removeFieldOption = (fieldIndex, optionIndex) => {
  currentTrigger.value.configFields[fieldIndex].options.splice(optionIndex, 1)
}

const resetForm = () => {
  currentTrigger.value = {
    name: '',
    description: '',
    category: '',
    icon: '',
    enabled: true,
    system: false,
    configFields: [],
    script: ''
  }
  triggerForm.value?.clearValidate()
}

const saveTrigger = async () => {
  try {
    await triggerForm.value.validate()
    saving.value = true

    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editMode.value) {
      const index = triggers.value.findIndex(t => t.id === currentTrigger.value.id)
      if (index !== -1) {
        triggers.value[index] = { ...currentTrigger.value }
      }
      ElMessage.success('触发器更新成功')
    } else {
      const newTrigger = {
        ...currentTrigger.value,
        id: Date.now(),
        usageCount: 0,
        lastUsed: null,
        createdAt: new Date()
      }
      triggers.value.push(newTrigger)
      ElMessage.success('触发器创建成功')
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
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
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

.trigger-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.trigger-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.trigger-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.trigger-card.disabled {
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

.trigger-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.trigger-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
}

.trigger-category.time {
  background-color: #409eff;
}

.trigger-category.event {
  background-color: #67c23a;
}

.trigger-category.condition {
  background-color: #e6a23c;
}

.trigger-category.custom {
  background-color: #909399;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-content {
  padding: 20px;
}

.trigger-description {
  margin: 0 0 16px 0;
  color: #606266;
  line-height: 1.5;
}

.trigger-details {
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
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.more-fields {
  font-size: 12px;
  color: #909399;
}

.usage-stats {
  display: flex;
  gap: 16px;
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

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  display: block;
}

.config-fields-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background: #fafbfc;
}

.field-item {
  margin-bottom: 16px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

.field-item:last-child {
  margin-bottom: 0;
}

.field-options {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.script-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.script-help {
  padding: 12px;
  background: #f8f9fa;
  border-top: 1px solid #ebeef5;
}

.script-help ul {
  margin: 8px 0;
  padding-left: 20px;
}

.script-help code {
  background: #e4e7ed;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}
</style>