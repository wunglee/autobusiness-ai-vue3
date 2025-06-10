<!-- src/views/Workspace/TaskBoard/TaskCard.vue -->
<template>
  <div
      class="task-card"
      :class="{
      'is-dragging': isDragging,
      'is-selected': selected,
      'is-overdue': isOverdue,
      'is-urgent': isUrgent
    }"
      :draggable="draggable"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @click="handleClick"
  >
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="task-icon">
        <span class="icon-emoji">{{ taskType?.icon || '📝' }}</span>
      </div>
      <div class="task-priority" v-if="priority">
        <el-tag
            :type="getPriorityType(priority)"
            size="small"
            class="priority-tag"
        >
          {{ getPriorityLabel(priority) }}
        </el-tag>
      </div>
    </div>

    <!-- 任务标题 -->
    <div class="card-title">
      {{ task.title }}
    </div>

    <!-- 任务描述 -->
    <div v-if="task.description" class="card-description">
      {{ truncateText(task.description, 60) }}
    </div>

    <!-- 任务进度 -->
    <div v-if="task.progress > 0" class="card-progress">
      <div class="progress-info">
        <span class="progress-label">进度</span>
        <span class="progress-value">{{ task.progress }}%</span>
      </div>
      <el-progress
          :percentage="task.progress"
          :stroke-width="6"
          :show-text="false"
          :color="getProgressColor(task.progress)"
      />
    </div>

    <!-- 预算信息 -->
    <div v-if="task.budget > 0" class="card-budget">
      <div class="budget-info">
        <span class="budget-label">预算</span>
        <span class="budget-value" :class="{ 'budget-warning': budgetWarning }">
          剩余 {{ task.remainingBudget || 0 }}
        </span>
      </div>
      <div class="budget-bar">
        <div
            class="budget-used"
            :style="{
            width: budgetUsagePercentage + '%',
            backgroundColor: getBudgetColor(budgetUsagePercentage)
          }"
        ></div>
      </div>
    </div>

    <!-- 自定义属性标签 -->
    <div v-if="customAttributes.length > 0" class="card-attributes">
      <el-tag
          v-for="attr in customAttributes.slice(0, 2)"
          :key="attr.key"
          size="small"
          class="attr-tag"
      >
        {{ attr.label }}: {{ getAttributeDisplayValue(attr) }}
      </el-tag>
      <span v-if="customAttributes.length > 2" class="more-attrs">
        +{{ customAttributes.length - 2 }} 更多
      </span>
    </div>

    <!-- 卡片底部 -->
    <div class="card-footer">
      <!-- 负责人 -->
      <div class="assignee-info">
        <el-avatar
            :size="24"
            :src="getAvatarUrl(task.assignee)"
            class="assignee-avatar"
        >
          {{ getAssigneeInitial(task.assignee) }}
        </el-avatar>
        <span class="assignee-name">{{ task.assignee || '未分配' }}</span>
      </div>

      <!-- 时间信息 -->
      <div class="time-info">
        <el-tooltip :content="formatDate(task.updatedAt)" placement="top">
          <span class="update-time">{{ getRelativeTime(task.updatedAt) }}</span>
        </el-tooltip>
      </div>
    </div>

    <!-- 子任务数量指示器 -->
    <div v-if="task.hasChildren" class="children-indicator">
      <el-icon><Collection /></el-icon>
      <span>{{ childrenCount }}</span>
    </div>

    <!-- 拖拽指示器 -->
    <div v-if="isDragging" class="drag-indicator">
      <el-icon><Grid /></el-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Collection, Grid } from '@element-plus/icons-vue'

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
  selected: {
    type: Boolean,
    default: false
  },
  draggable: {
    type: Boolean,
    default: true
  },
  childrenCount: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['click', 'drag-start', 'drag-end'])

// 响应式数据
const isDragging = ref(false)

// 计算属性
const priority = computed(() => {
  return props.task.attributes?.priority
})

const customAttributes = computed(() => {
  if (!props.taskType?.attributes || !props.task.attributes) return []

  return props.taskType.attributes
      .filter(attr => props.task.attributes[attr.key])
      .map(attr => ({
        ...attr,
        value: props.task.attributes[attr.key]
      }))
})

const budgetUsagePercentage = computed(() => {
  if (!props.task.budget || props.task.budget === 0) return 0
  const used = props.task.budget - (props.task.remainingBudget || 0)
  return Math.round((used / props.task.budget) * 100)
})

const budgetWarning = computed(() => {
  return budgetUsagePercentage.value > 80
})

const isOverdue = computed(() => {
  const deadline = props.task.attributes?.deadline
  if (!deadline) return false
  return new Date(deadline) < new Date()
})

const isUrgent = computed(() => {
  return priority.value === 'high' || priority.value === 'urgent'
})

// 方法
const handleClick = () => {
  emit('click', props.task)
}

const handleDragStart = (event) => {
  isDragging.value = true
  emit('drag-start', props.task)

  // 设置拖拽数据
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.task.id)
}

const handleDragEnd = () => {
  isDragging.value = false
  emit('drag-end', props.task)
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getPriorityType = (priority) => {
  const map = {
    low: '',
    normal: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return map[priority] || 'info'
}

const getPriorityLabel = (priority) => {
  const map = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  }
  return map[priority] || priority
}

const getProgressColor = (progress) => {
  if (progress >= 100) return '#67c23a'
  if (progress >= 80) return '#409eff'
  if (progress >= 50) return '#e6a23c'
  return '#909399'
}

const getBudgetColor = (percentage) => {
  if (percentage > 90) return '#f56c6c'
  if (percentage > 70) return '#e6a23c'
  return '#67c23a'
}

const getAttributeDisplayValue = (attr) => {
  let value = attr.value
  if (attr.type === 'date' && value) {
    value = new Date(value).toLocaleDateString()
  }
  return value
}

const getAvatarUrl = (assignee) => {
  // 这里可以根据实际需求返回头像URL
  return null
}

const getAssigneeInitial = (assignee) => {
  if (!assignee) return '?'
  return assignee.charAt(0).toUpperCase()
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const getRelativeTime = (date) => {
  if (!date) return '-'

  const now = new Date()
  const target = new Date(date)
  const diff = now - target

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return target.toLocaleDateString()
  }
}
</script>

<style scoped>
.task-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  user-select: none;
}

.task-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

.task-card.is-selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.task-card.is-dragging {
  opacity: 0.8;
  transform: rotate(5deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.task-card.is-overdue {
  border-left: 4px solid #f56c6c;
}

.task-card.is-urgent {
  border-left: 4px solid #e6a23c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.task-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 6px;
}

.icon-emoji {
  font-size: 16px;
}

.priority-tag {
  font-size: 10px;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 9px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  margin-bottom: 6px;
  word-break: break-word;
}

.card-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
  margin-bottom: 8px;
  word-break: break-word;
}

.card-progress {
  margin-bottom: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.progress-label {
  font-size: 11px;
  color: #909399;
}

.progress-value {
  font-size: 11px;
  font-weight: 500;
  color: #303133;
}

.card-budget {
  margin-bottom: 8px;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.budget-label {
  font-size: 11px;
  color: #909399;
}

.budget-value {
  font-size: 11px;
  font-weight: 500;
  color: #303133;
}

.budget-value.budget-warning {
  color: #f56c6c;
}

.budget-bar {
  height: 4px;
  background: #f0f2f5;
  border-radius: 2px;
  overflow: hidden;
}

.budget-used {
  height: 100%;
  transition: width 0.3s;
  border-radius: 2px;
}

.card-attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.attr-tag {
  font-size: 10px;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 9px;
  background: #f0f2f5;
  color: #606266;
  border: none;
}

.more-attrs {
  font-size: 10px;
  color: #909399;
  font-style: italic;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.assignee-avatar {
  flex-shrink: 0;
}

.assignee-name {
  font-size: 11px;
  color: #606266;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-info {
  flex-shrink: 0;
}

.update-time {
  font-size: 10px;
  color: #c0c4cc;
}

.children-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  background: #e1f3ff;
  color: #409eff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.drag-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
:deep(.status-column .column-content) {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  max-height: 400px; /* 防止看板过高 */
}

/* 7. 任务卡片响应式样式 */
:deep(.task-card) {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.task-card:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}
/* ============ 响应式断点 ============ */

/* 超大屏幕 (>1600px) - 最多5列 */
@media (min-width: 1600px) {
  .kanban-columns {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }

  :deep(.status-column) {
    min-width: 280px;
    max-width: 350px;
  }
}

/* 大屏幕 (1200px-1600px) - 最多4列 */
@media (max-width: 1600px) and (min-width: 1200px) {
  .kanban-columns {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }

  :deep(.status-column) {
    min-width: 260px;
    max-width: 320px;
  }
}

/* 中等屏幕 (768px-1200px) - 最多3列 */
@media (max-width: 1200px) and (min-width: 768px) {
  .kanban-columns {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  :deep(.status-column) {
    min-width: 220px;
    max-width: 280px;
  }

  :deep(.status-column .column-header) {
    padding: 10px 12px;
  }

  :deep(.task-card) {
    padding: 10px;
  }
}

/* 小屏幕 (480px-768px) - 最多2列 */
@media (max-width: 768px) and (min-width: 480px) {
  .kanban-columns {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    padding: 8px;
  }

  :deep(.status-column) {
    min-width: 200px;
    max-width: none;
    border-radius: 6px;
  }

  :deep(.status-column .column-header) {
    padding: 8px 12px;
    font-size: 13px;
  }

  :deep(.task-card) {
    padding: 8px;
    margin-bottom: 6px;
  }

  :deep(.task-card .card-title) {
    font-size: 13px;
  }
}

/* 超小屏幕 (<480px) - 单列显示 */
@media (max-width: 480px) {
  .kanban-columns {
    grid-template-columns: 1fr; /* 强制单列 */
    gap: 8px;
    padding: 8px;
  }

  :deep(.status-column) {
    min-width: auto;
    width: 100%;
    max-width: none;
  }

  :deep(.status-column .status-label) {
    max-width: none; /* 移动端显示完整状态名 */
  }
}
</style>