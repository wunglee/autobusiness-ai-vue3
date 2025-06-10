<!-- src/views/Workspace/TaskBoard/TaskCreateDialog.vue -->
<template>
  <el-dialog
      v-model="visible"
      title="创建任务"
      width="600px"
      :close-on-click-modal="false"
      class="task-create-dialog"
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

        <!-- 任务类型 -->
        <el-form-item label="任务类型" prop="typeId" required>
          <el-select
              v-model="form.typeId"
              placeholder="请选择任务类型"
              style="width: 100%;"
              @change="handleTypeChange"
          >
            <el-option
                v-for="type in availableTypes"
                :key="type.id"
                :label="type.name"
                :value="type.id"
                :disabled="!isTypeAllowed(type.id)"
            >
              <div class="type-option">
                <span class="type-icon">{{ type.icon }}</span>
                <span class="type-name">{{ type.name }}</span>
                <span class="type-desc">{{ type.description }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="parentTask" class="parent-info">
            <el-icon><Share /></el-icon>
            <span>父任务：{{ parentTask.title }}</span>
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
      </div>

      <!-- 任务属性 -->
      <div class="form-section">
        <h4 class="section-title">任务属性</h4>

        <!-- 初始状态 -->
        <el-form-item label="初始状态" prop="status">
          <el-select
              v-model="form.status"
              placeholder="请选择初始状态"
              style="width: 200px;"
          >
            <el-option
                v-for="status in initialStatuses"
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

        <!-- 预算 -->
        <el-form-item label="预算" prop="budget">
          <el-input-number
              v-model="form.budget"
              :min="0"
              :precision="0"
              style="width: 200px;"
              placeholder="请输入预算金额"
          />
          <span class="input-suffix">元</span>
        </el-form-item>

        <!-- 初始进度 -->
        <el-form-item label="初始进度" prop="progress">
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
          创建任务
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Share } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: Boolean,
  parentTask: {
    type: Object,
    default: null
  },
  taskTypes: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'confirm'])

// 响应式数据
const visible = ref(props.modelValue)
const submitting = ref(false)
const formRef = ref(null)

// 表单数据
const form = ref({
  typeId: '',
  title: '',
  description: '',
  status: '',
  assignee: '',
  budget: 0,
  progress: 0,
  attributes: {}
})

// 验证规则
const rules = {
  typeId: [
    { required: true, message: '请选择任务类型', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度应在 2-100 个字符之间', trigger: 'blur' }
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
const availableTypes = computed(() => {
  return props.taskTypes.filter(type => type.isActive !== false)
})

const selectedTaskType = computed(() => {
  return props.taskTypes.find(type => type.id === form.value.typeId)
})

const initialStatuses = computed(() => {
  if (!selectedTaskType.value) return []
  return selectedTaskType.value.statuses?.filter(status =>
      status.type === 'initial' || status.isInitial
  ) || []
})

const customAttributes = computed(() => {
  return selectedTaskType.value?.attributes || []
})

// 监听对话框显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 方法
const isTypeAllowed = (typeId) => {
  if (!props.parentTask) return true

  const parentType = props.taskTypes.find(type => type.id === props.parentTask.typeId)
  if (!parentType) return true

  return !parentType.allowedChildTypes?.length ||
      parentType.allowedChildTypes.includes(typeId)
}

const handleTypeChange = () => {
  // 重置状态和自定义属性
  form.value.status = ''
  form.value.attributes = {}

  // 设置默认状态
  nextTick(() => {
    if (initialStatuses.value.length > 0) {
      form.value.status = initialStatuses.value[0].key
    }

    // 设置自定义属性默认值
    customAttributes.value.forEach(attr => {
      if (attr.defaultValue !== undefined) {
        form.value.attributes[attr.key] = attr.defaultValue
      }
    })
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

const resetForm = () => {
  form.value = {
    typeId: '',
    title: '',
    description: '',
    status: '',
    assignee: '',
    budget: 0,
    progress: 0,
    attributes: {}
  }

  // 清除验证状态
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleCancel = () => {
  visible.value = false
}

const handleReset = () => {
  resetForm()
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()

    submitting.value = true

    // 构造任务数据
    const taskData = {
      ...form.value,
      parentId: props.parentTask?.id || null,
      remainingBudget: form.value.budget
    }

    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('confirm', taskData)
    visible.value = false

    ElMessage.success('任务创建成功')

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
.task-create-dialog {
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

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.type-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.type-name {
  font-weight: 500;
  color: #303133;
  flex-shrink: 0;
}

.type-desc {
  font-size: 12px;
  color: #909399;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.parent-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 6px 8px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Element Plus 样式覆盖 */
:deep(.el-dialog__body) {
  padding: 20px 24px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .task-create-dialog {
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