<!-- src/views/Workspace/TaskBoard/TaskEditDialog.vue -->
<template>
  <el-dialog
      v-model="visible"
      title="编辑任务"
      width="600px"
      :close-on-click-modal="false"
      class="task-edit-dialog"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
    >
      <!-- 基础信息 -->
      <div class="form-section">
        <h4 class="section-title">基础信息</h4>

        <!-- 任务类型（只读） -->
        <el-form-item label="任务类型">
          <div class="readonly-field">
            <span class="type-icon">{{ taskType?.icon || '📝' }}</span>
            <span class="type-name">{{ taskType?.name || '未知类型' }}</span>
            <el-tag size="small" type="info">不可修改</el-tag>
          </div>
        </el-form-item>

        <!-- 任务ID（只读） -->
        <el-form-item label="任务ID">
          <div class="readonly-field">
            <el-input :value="task?.id" readonly />
          </div>
        </el-form-item>

        <!-- 任务标题 -->
        <el-form-item label="任务标题" prop="title" required>
          <el-input
              v-model="form.title"
              placeholder="请输入任务标题"
              maxlength="100"
              show-word-limit
          />
        </el-form-item>

        <!-- 任务描述 -->
        <el-form-item label="任务描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              placeholder="请输入任务描述"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <!-- 层级信息（只读） -->
        <el-form-item label="层级路径">
          <div class="readonly-field">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item v-for="pathItem in taskPath" :key="pathItem.id">
                {{ pathItem.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </el-form-item>
      </div>

      <!-- 任务属性 -->
      <div class="form-section">
        <h4 class="section-title">任务属性</h4>

        <!-- 状态 -->
        <el-form-item label="状态" prop="status">
          <el-select
              v-model="form.status"
              placeholder="请选择状态"
              style="width: 200px;"
          >
            <el-option
                v-for="status in availableStatuses"
                :key="status.key"
                :label="status.label"
                :value="status.key"
            >
              <div class="status-option">
                <span
                    class="status-dot"
                    :style="{ backgroundColor: status.color }"
                ></span>
                {{ status.label }}
              </div>
            </el-option>
          </el-select>
          <div v-if="statusChangeWarning" class="status-warning">
            <el-icon><Warning /></el-icon>
            <span>{{ statusChangeWarning }}</span>
          </div>
        </el-form-item>

        <!-- 负责人 -->
        <el-form-item label="负责人" prop="assignee">
          <el-select
              v-model="form.assignee"
              placeholder="请选择负责人"
              style="width: 200px;"
              filterable
              allow-create
          >
            <el-option
                v-for="agent in availableAgents"
                :key="agent.id"
                :label="agent.name"
                :value="agent.id"
            >
              <div class="agent-option">
                <el-avatar :size="20" :src="agent.avatar">
                  {{ agent.name.charAt(0) }}
                </el-avatar>
                <span>{{ agent.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 进度 -->
        <el-form-item label="进度" prop="progress">
          <el-slider
              v-model="form.progress"
              :min="0"
              :max="100"
              :step="5"
              show-input
              :show-input-controls="false"
              style="width: 300px;"
          />
          <span class="input-suffix">%</span>
        </el-form-item>

        <!-- 预算 -->
        <el-form-item label="总预算" prop="budget">
          <el-input-number
              v-model="form.budget"
              :min="0"
              :precision="0"
              style="width: 200px;"
              placeholder="请输入预算金额"
          />
          <span class="input-suffix">元</span>
        </el-form-item>

        <!-- 剩余预算 -->
        <el-form-item label="剩余预算" prop="remainingBudget">
          <el-input-number
              v-model="form.remainingBudget"
              :min="0"
              :max="form.budget"
              :precision="0"
              style="width: 200px;"
              placeholder="请输入剩余预算"
          />
          <span class="input-suffix">元</span>
          <div class="budget-info">
            <span>已使用: {{ usedBudget }}元</span>
            <span :class="{ 'budget-warning': budgetWarning }">
              ({{ budgetUsagePercentage }}%)
            </span>
          </div>
        </el-form-item>
      </div>

      <!-- 自定义属性 -->
      <div v-if="customAttributes.length > 0" class="form-section">
        <h4 class="section-title">自定义属性</h4>

        <el-form-item
            v-for="attr in customAttributes"
            :key="attr.key"
            :label="attr.label"
            :prop="`attributes.${attr.key}`"
            :rules="getAttributeRules(attr)"
        >
          <!-- 文本输入 -->
          <el-input
              v-if="attr.type === 'text'"
              v-model="form.attributes[attr.key]"
              :placeholder="`请输入${attr.label}`"
          />

          <!-- 数字输入 -->
          <el-input-number
              v-else-if="attr.type === 'number'"
              v-model="form.attributes[attr.key]"
              :min="attr.config?.min"
              :max="attr.config?.max"
              :placeholder="`请输入${attr.label}`"
          />

          <!-- 日期选择 -->
          <el-date-picker
              v-else-if="attr.type === 'date'"
              v-model="form.attributes[attr.key]"
              type="date"
              :placeholder="`请选择${attr.label}`"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />

          <!-- 单选 -->
          <el-radio-group
              v-else-if="attr.type === 'radio'"
              v-model="form.attributes[attr.key]"
          >
            <el-radio
                v-for="option in attr.config?.options || []"
                :key="option.value"
                :label="option.value"
            >
              {{ option.label }}
            </el-radio>
          </el-radio-group>

          <!-- 下拉选择 -->
          <el-select
              v-else-if="attr.type === 'select'"
              v-model="form.attributes[attr.key]"
              :placeholder="`请选择${attr.label}`"
          >
            <el-option
                v-for="option in attr.config?.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>

          <!-- 多选 -->
          <el-select
              v-else-if="attr.type === 'multiselect'"
              v-model="form.attributes[attr.key]"
              multiple
              :placeholder="`请选择${attr.label}`"
          >
            <el-option
                v-for="option in attr.config?.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>

          <!-- 默认文本输入 -->
          <el-input
              v-else
              v-model="form.attributes[attr.key]"
              :placeholder="`请输入${attr.label}`"
          />
        </el-form-item>
      </div>

      <!-- 时间信息（只读） -->
      <div class="form-section">
        <h4 class="section-title">时间信息</h4>

        <el-form-item label="创建时间">
          <div class="readonly-field">
            <span>{{ formatDate(task?.createdAt) }}</span>
          </div>
        </el-form-item>

        <el-form-item label="更新时间">
          <div class="readonly-field">
            <span>{{ formatDate(task?.updatedAt) }}</span>
          </div>
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :loading="submitting"
        >
          保存更改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  task: {
    type: Object,
    default: null
  },
  taskType: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm'])

// 响应式数据
const visible = ref(props.modelValue)
const submitting = ref(false)
const formRef = ref(null)
const originalForm = ref({})

// 表单数据
const form = ref({
  title: '',
  description: '',
  status: '',
  assignee: '',
  progress: 0,
  budget: 0,
  remainingBudget: 0,
  attributes: {}
})

// 验证规则
const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在 2-100 个字符之间', trigger: 'blur' }
  ],
  budget: [
    { type: 'number', min: 0, message: '预算不能为负数', trigger: 'blur' }
  ],
  remainingBudget: [
    { type: 'number', min: 0, message: '剩余预算不能为负数', trigger: 'blur' }
  ],
  progress: [
    { type: 'number', min: 0, max: 100, message: '进度应在 0-100% 之间', trigger: 'blur' }
  ]
}

// 示例智能体数据
const availableAgents = ref([
  { id: 'agent-001', name: '张三', avatar: null },
  { id: 'agent-002', name: '李四', avatar: null },
  { id: 'agent-003', name: '王五', avatar: null },
  { id: 'agent-004', name: '赵六', avatar: null },
  { id: 'agent-005', name: '钱七', avatar: null }
])

// 计算属性
const availableStatuses = computed(() => {
  return props.taskType?.statuses || []
})

const customAttributes = computed(() => {
  return props.taskType?.attributes || []
})

const taskPath = computed(() => {
  if (!props.task?.path) return []

  // 这里简化处理，实际应该从父组件传入完整的路径信息
  return [
    { id: 'root', title: '根任务' },
    { id: props.task.id, title: props.task.title }
  ]
})

const usedBudget = computed(() => {
  return (form.value.budget || 0) - (form.value.remainingBudget || 0)
})

const budgetUsagePercentage = computed(() => {
  if (!form.value.budget || form.value.budget === 0) return 0
  return Math.round((usedBudget.value / form.value.budget) * 100)
})

const budgetWarning = computed(() => {
  return budgetUsagePercentage.value > 80
})

const statusChangeWarning = computed(() => {
  if (!originalForm.value.status || form.value.status === originalForm.value.status) {
    return ''
  }

  const originalStatus = availableStatuses.value.find(s => s.key === originalForm.value.status)
  const newStatus = availableStatuses.value.find(s => s.key === form.value.status)

  if (originalStatus?.type === 'final' && newStatus?.type !== 'final') {
    return '警告：正在从最终状态回退，请确认此操作'
  }

  return ''
})

// 监听对话框显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.task) {
    initForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听任务变化
watch(() => props.task, (newTask) => {
  if (newTask && visible.value) {
    initForm()
  }
}, { deep: true })

// 方法
const initForm = () => {
  if (!props.task) return

  const taskData = {
    title: props.task.title || '',
    description: props.task.description || '',
    status: props.task.status || '',
    assignee: props.task.assignee || '',
    progress: props.task.progress || 0,
    budget: props.task.budget || 0,
    remainingBudget: props.task.remainingBudget || 0,
    attributes: { ...props.task.attributes } || {}
  }

  form.value = taskData
  originalForm.value = { ...taskData }

  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const getAttributeRules = (attr) => {
  const rules = []

  if (attr.required) {
    rules.push({
      required: true,
      message: `请输入${attr.label}`,
      trigger: attr.type === 'select' || attr.type === 'radio' ? 'change' : 'blur'
    })
  }

  if (attr.config?.min !== undefined || attr.config?.max !== undefined) {
    if (attr.type === 'number') {
      rules.push({
        type: 'number',
        min: attr.config.min,
        max: attr.config.max,
        message: `${attr.label}应在 ${attr.config.min}-${attr.config.max} 之间`,
        trigger: 'blur'
      })
    } else if (attr.type === 'text') {
      rules.push({
        min: attr.config.min,
        max: attr.config.max,
        message: `${attr.label}长度应在 ${attr.config.min}-${attr.config.max} 个字符之间`,
        trigger: 'blur'
      })
    }
  }

  return rules
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleCancel = () => {
  visible.value = false
}

const handleReset = () => {
  form.value = { ...originalForm.value }
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()

    // 检查剩余预算不能超过总预算
    if (form.value.remainingBudget > form.value.budget) {
      ElMessage.warning('剩余预算不能超过总预算')
      return
    }

    submitting.value = true

    // 构造更新数据
    const updatedTask = {
      ...props.task,
      ...form.value,
      updatedAt: new Date()
    }

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('confirm', updatedTask)
    visible.value = false

    ElMessage.success('任务更新成功')

  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.task-edit-dialog {
  --el-dialog-bg-color: #fff;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.readonly-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.type-icon {
  font-size: 16px;
}

.type-name {
  font-weight: 500;
  color: #303133;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 8px;
  background: #fdf6ec;
  border: 1px solid #f5dab1;
  border-radius: 4px;
  font-size: 12px;
  color: #e6a23c;
}

.agent-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-suffix {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.budget-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.budget-warning {
  color: #f56c6c !important;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 样式覆盖 */
:deep(.el-dialog__body) {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-select .el-input) {
  width: 100%;
}

:deep(.el-slider) {
  margin-right: 16px;
}

:deep(.el-slider__input) {
  width: 60px;
}

:deep(.el-breadcrumb) {
  font-size: 13px;
}

:deep(.el-breadcrumb__item) {
  color: #606266;
}

/* 滚动条样式 */
:deep(.el-dialog__body)::-webkit-scrollbar {
  width: 6px;
}

:deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-edit-dialog {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  :deep(.el-dialog__body) {
    padding: 16px 20px;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}
</style>