<!-- src/views/Workspace/TaskBoard/StatusColumn.vue -->
<template>
  <div
      class="status-column"
      @dragover.prevent
      @drop="handleDrop"
  >
    <!-- 列头 -->
    <div class="column-header" :style="{ borderTopColor: status.color }">
      <div class="status-info">
        <span class="status-dot" :style="{ backgroundColor: status.color }"></span>
        <span class="status-label">{{ status.label }}</span>
        <span class="task-count">({{ tasks.length }})</span>
      </div>
      <el-button
          type="text"
          size="small"
          :icon="Plus"
          @click="handleAddTask"
          title="在此状态下添加任务"
      />
    </div>

    <!-- 任务卡片列表 -->
    <div class="column-content">
      <div class="task-cards">
        <TaskCard
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :task-type="taskType"
            :draggable="true"
            @click="handleTaskClick"
            @drag-start="handleDragStart"
            @drag-end="handleDragEnd"
        />
      </div>

      <!-- 拖拽占位符 -->
      <div
          v-show="isDragOver && tasks.length === 0"
          class="drop-placeholder"
      >
        <el-icon><Document /></el-icon>
        <span>拖拽任务到此处</span>
      </div>
    </div>

    <!-- 快速添加任务 -->
    <div v-if="showQuickAdd" class="quick-add">
      <el-input
          v-model="quickAddTitle"
          placeholder="输入任务标题..."
          size="small"
          @keyup.enter="handleQuickAdd"
          @blur="handleQuickAddBlur"
          ref="quickAddInput"
      />
      <div class="quick-add-actions">
        <el-button size="small" @click="handleQuickAdd">添加</el-button>
        <el-button size="small" @click="handleCancelQuickAdd">取消</el-button>
      </div>
    </div>

    <!-- 添加按钮 -->
    <div v-else class="add-task-btn">
      <el-button
          type="text"
          size="small"
          :icon="Plus"
          @click="handleShowQuickAdd"
          class="add-btn"
      >
        添加任务
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Document } from '@element-plus/icons-vue'
import TaskCard from './TaskCard.vue'

// Props
const props = defineProps({
  status: {
    type: Object,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  },
  taskType: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['task-click', 'task-drop', 'status-change', 'add-task'])

// 响应式数据
const isDragOver = ref(false)
const showQuickAdd = ref(false)
const quickAddTitle = ref('')
const quickAddInput = ref(null)

// 方法
const handleTaskClick = (task) => {
  emit('task-click', task)
}

const handleDragStart = (task) => {
  // 存储拖拽的任务信息
  const dragData = {
    task,
    sourceStatus: props.status.key
  }
  // 使用 dataTransfer 存储数据在现实环境中更合适
  // 这里简化处理
  window.__dragTask = dragData
}

const handleDragEnd = () => {
  isDragOver.value = false
  delete window.__dragTask
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const dragData = window.__dragTask
  if (!dragData) return

  const { task, sourceStatus } = dragData

  // 如果状态没有变化，不做处理
  if (sourceStatus === props.status.key) return

  // 触发状态变更
  emit('task-drop', task, props.status.key)
  emit('status-change', task, props.status.key)

  delete window.__dragTask
}

const handleAddTask = () => {
  emit('add-task', props.status.key)
}

const handleShowQuickAdd = () => {
  showQuickAdd.value = true
  nextTick(() => {
    quickAddInput.value?.focus()
  })
}

const handleQuickAdd = () => {
  if (!quickAddTitle.value.trim()) {
    ElMessage.warning('请输入任务标题')
    return
  }

  // 创建新任务的基本数据
  const newTask = {
    title: quickAddTitle.value.trim(),
    typeId: props.taskType?.id,
    status: props.status.key,
    assignee: '',
    progress: 0,
    budget: 0,
    remainingBudget: 0,
    description: '',
    attributes: {}
  }

  emit('add-task', newTask)

  // 重置状态
  quickAddTitle.value = ''
  showQuickAdd.value = false
}

const handleCancelQuickAdd = () => {
  quickAddTitle.value = ''
  showQuickAdd.value = false
}

const handleQuickAddBlur = () => {
  // 延迟隐藏，以便点击按钮事件能够正常触发
  setTimeout(() => {
    if (!quickAddTitle.value.trim()) {
      showQuickAdd.value = false
    }
  }, 150)
}

// 拖拽事件处理
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}
</script>

<style scoped>
.status-column {
  flex: 1;
  min-width: 250px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.status-column:last-child {
  border-right: none;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  border-top: 3px solid;
  position: sticky;
  top: 0;
  z-index: 10;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-label {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.task-count {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.column-content {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
  min-height: 200px;
  position: relative;
}

.task-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drop-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed #409eff;
  border-radius: 6px;
  background: rgba(64, 158, 255, 0.05);
  color: #409eff;
  font-size: 14px;
  text-align: center;
  margin: 20px 0;
}

.drop-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.quick-add {
  padding: 8px;
  background: white;
  border-top: 1px solid #e4e7ed;
}

.quick-add-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

.add-task-btn {
  padding: 8px;
  background: white;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.add-btn {
  width: 100%;
  color: #909399;
  border: 1px dashed #d3d4d6;
  border-radius: 4px;
  padding: 8px;
  transition: all 0.2s;
}

.add-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

/* 拖拽状态样式 */
.status-column.drag-over {
  background: rgba(64, 158, 255, 0.05);
  border-color: #409eff;
}

.status-column.drag-over .column-header {
  background: rgba(64, 158, 255, 0.1);
}

/* 滚动条样式 */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .status-column {
    min-width: 200px;
  }

  .column-header {
    padding: 8px 12px;
  }

  .status-label {
    font-size: 13px;
  }
}
</style>