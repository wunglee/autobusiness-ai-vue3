<!-- src/views/Workspace/TaskBoard/TaskDetail.vue -->
<template>
  <div class="task-detail">
    <!-- 任务基本信息 -->
    <div class="detail-header">
      <div class="task-header">
        <div class="task-icon">
          <span class="icon-emoji">{{ taskType?.icon || '📝' }}</span>
        </div>
        <div class="task-info">
          <h3 class="task-title">{{ task.title }}</h3>
          <div class="task-breadcrumb">
            <span class="task-type">{{ taskType?.name || '未知类型' }}</span>
            <el-divider direction="vertical" />
            <span class="task-id">ID: {{ task.id }}</span>
            <el-divider direction="vertical" />
            <span class="create-time">创建于 {{ formatDate(task.createdAt) }}</span>
          </div>
        </div>
        <div class="task-actions">
          <el-button :icon="Edit" @click="handleEdit" size="small">编辑</el-button>
          <el-dropdown @command="handleCommand">
            <el-button :icon="MoreFilled" size="small"></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="copy" :icon="CopyDocument">复制任务</el-dropdown-item>
                <el-dropdown-item command="export" :icon="Download">导出数据</el-dropdown-item>
                <el-dropdown-item divided command="delete" :icon="Delete" class="danger-item">
                  删除任务
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 任务属性详情 -->
    <div class="detail-content">
      <div class="attributes-section">
        <div class="section-header">
          <h4>任务属性</h4>
        </div>

        <div class="attributes-grid">
          <!-- 状态 -->
          <div class="attribute-item">
            <label>状态</label>
            <el-select
                :model-value="task.status"
                @change="handleStatusChange"
                size="small"
                style="width: 120px;"
            >
              <el-option
                  v-for="status in taskType?.statuses || []"
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
          </div>

          <!-- 负责人 -->
          <div class="attribute-item">
            <label>负责人</label>
            <el-input v-model="localTask.assignee" size="small" style="width: 120px;" />
          </div>

          <!-- 进度 -->
          <div class="attribute-item">
            <label>进度</label>
            <div class="progress-input">
              <el-input-number
                  v-model="localTask.progress"
                  :min="0"
                  :max="100"
                  size="small"
                  style="width: 80px;"
                  @change="handleProgressChange"
              />
              <span class="progress-unit">%</span>
            </div>
          </div>

          <!-- 预算 -->
          <div class="attribute-item">
            <label>预算</label>
            <el-input-number
                v-model="localTask.budget"
                :min="0"
                :precision="0"
                size="small"
                style="width: 120px;"
                @change="handleBudgetChange"
            />
          </div>

          <!-- 剩余预算 -->
          <div class="attribute-item">
            <label>剩余预算</label>
            <div class="budget-display">
              <span :class="{ 'budget-warning': budgetWarning }">
                {{ localTask.remainingBudget || 0 }}
              </span>
              <el-progress
                  :percentage="budgetUsagePercentage"
                  :color="budgetProgressColor"
                  :stroke-width="4"
                  :show-text="false"
                  style="margin-top: 4px;"
              />
            </div>
          </div>

          <!-- 创建时间 -->
          <div class="attribute-item">
            <label>创建时间</label>
            <span class="readonly-value">{{ formatDate(task.createdAt) }}</span>
          </div>

          <!-- 更新时间 -->
          <div class="attribute-item">
            <label>更新时间</label>
            <span class="readonly-value">{{ formatDate(task.updatedAt) }}</span>
          </div>

          <!-- 层级深度 -->
          <div class="attribute-item">
            <label>层级</label>
            <span class="readonly-value">第 {{ task.level + 1 }} 层</span>
          </div>
        </div>

        <!-- 描述 -->
        <div class="description-section">
          <label>描述</label>
          <el-input
              v-model="localTask.description"
              type="textarea"
              :rows="3"
              placeholder="请输入任务描述..."
              @blur="handleDescriptionChange"
          />
        </div>

        <!-- 自定义属性 -->
        <div v-if="customAttributes.length > 0" class="custom-attributes">
          <h5>自定义属性</h5>
          <div class="custom-attrs-grid">
            <div
                v-for="attr in customAttributes"
                :key="attr.key"
                class="custom-attr-item"
            >
              <label>{{ attr.label }}</label>
              <!-- 这里可以根据attr.type渲染不同的输入组件 -->
              <el-input
                  v-model="localTask.attributes[attr.key]"
                  size="small"
                  :placeholder="`请输入${attr.label}`"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 子任务看板 -->
      <div v-if="childTasks.length > 0" class="kanban-section">
        <div class="section-header">
          <h4>子任务状态看板</h4>
          <el-button
              type="primary"
              size="small"
              :icon="Plus"
              @click="handleCreateChild"
          >
            添加子任务
          </el-button>
        </div>

        <TaskKanban
            :tasks="childTasks"
            :task-types="taskTypes"
            @task-click="handleChildTaskClick"
            @status-change="handleChildStatusChange"
            @create="handleCreateChild"
        />
      </div>

      <!-- 空状态：无子任务 -->
      <div v-else class="empty-children">
        <div class="empty-content">
          <el-icon size="48"><FolderOpened /></el-icon>
          <h4>暂无子任务</h4>
          <p>为这个任务创建子任务来细化工作内容</p>
          <el-button type="primary" :icon="Plus" @click="handleCreateChild">
            创建子任务
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Edit,
  MoreFilled,
  CopyDocument,
  Download,
  Delete,
  Plus,
  FolderOpened
} from '@element-plus/icons-vue'
import TaskKanban from './TaskKanban.vue'

// Props
const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  taskType: {
    type: Object,
    default: null
  },
  childTasks: {
    type: Array,
    default: () => []
  },
  taskTypes: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'update',
  'status-change',
  'create-child',
  'select-child'
])

// 响应式数据
const localTask = ref({ ...props.task })

// 计算属性
const customAttributes = computed(() => {
  return props.taskType?.attributes || []
})

const budgetUsagePercentage = computed(() => {
  if (!localTask.value.budget || localTask.value.budget === 0) return 0
  const used = localTask.value.budget - (localTask.value.remainingBudget || 0)
  return Math.round((used / localTask.value.budget) * 100)
})

const budgetWarning = computed(() => {
  return budgetUsagePercentage.value > 80
})

const budgetProgressColor = computed(() => {
  const percentage = budgetUsagePercentage.value
  if (percentage > 90) return '#f56c6c'
  if (percentage > 70) return '#e6a23c'
  return '#67c23a'
})

// 监听任务变化
watch(() => props.task, (newTask) => {
  localTask.value = { ...newTask }
}, { immediate: true })

// 方法
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

const handleEdit = () => {
  // 通过父组件触发编辑对话框
  // emit('edit', props.task)
}

const handleCommand = (command) => {
  switch (command) {
    case 'copy':
      // TODO: 实现复制功能
      ElMessage.info('复制功能开发中...')
      break
    case 'export':
      // TODO: 实现导出功能
      ElMessage.info('导出功能开发中...')
      break
    case 'delete':
      // 通过父组件触发删除
      // emit('delete', props.task)
      break
  }
}

const handleStatusChange = (newStatus) => {
  emit('status-change', props.task, newStatus)
}

const handleProgressChange = (value) => {
  const updatedTask = { ...localTask.value, progress: value }
  emit('update', updatedTask)
}

const handleBudgetChange = (value) => {
  const updatedTask = {
    ...localTask.value,
    budget: value,
    // 如果剩余预算大于总预算，自动调整
    remainingBudget: Math.min(localTask.value.remainingBudget || 0, value || 0)
  }
  emit('update', updatedTask)
}

const handleDescriptionChange = () => {
  const updatedTask = { ...localTask.value, description: localTask.value.description }
  emit('update', updatedTask)
}

const handleCreateChild = () => {
  emit('create-child', props.task)
}

const handleChildTaskClick = (childTask) => {
  emit('select-child', childTask.id)
}

const handleChildStatusChange = (task, newStatus) => {
  emit('status-change', task, newStatus)
}
</script>

<style scoped>
.task-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
}

.detail-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.icon-emoji {
  font-size: 24px;
}

.task-info {
  flex: 1;
  min-width: 0;
}

.task-title {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
}

.task-type {
  background: #e1f3ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}

.attributes-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
  margin-bottom: 20px;
}

.attribute-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.attribute-item label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
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

.progress-input {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-unit {
  font-size: 12px;
  color: #909399;
}

.budget-display {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.budget-warning {
  color: #f56c6c !important;
}

.readonly-value {
  font-size: 14px;
  color: #606266;
}

.description-section {
  margin-bottom: 20px;
}

.description-section label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.custom-attributes h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.custom-attrs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
}

.custom-attr-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.custom-attr-item label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.kanban-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

.empty-children {
  margin-top: 32px;
  padding: 40px 20px;
  text-align: center;
}

.empty-content {
  color: #909399;
}

.empty-content .el-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-content p {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 危险操作样式 */
:deep(.danger-item) {
  color: #f56c6c !important;
}

:deep(.danger-item:hover) {
  background: #fef0f0 !important;
  color: #f56c6c !important;
}

/* 滚动条样式 */
.detail-content::-webkit-scrollbar {
  width: 6px;
}

.detail-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.detail-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>