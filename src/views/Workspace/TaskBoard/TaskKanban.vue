<!-- src/views/Workspace/TaskBoard/TaskKanban.vue -->
<template>
  <div class="task-kanban">
    <!-- 任务类型分组 -->
    <div v-for="group in taskGroups" :key="group.typeId" class="kanban-group">
      <div class="group-header">
        <div class="group-title">
          <span class="group-icon">{{ group.taskType?.icon || '📝' }}</span>
          <span class="group-name">{{ group.taskType?.name || '未知类型' }}</span>
          <span class="group-count">({{ group.tasks.length }})</span>
        </div>
        <el-button
            type="text"
            size="small"
            :icon="Plus"
            @click="handleCreateTask(group.taskType)"
        >
          添加
        </el-button>
      </div>

      <!-- 状态列 -->
      <div class="kanban-columns">
        <StatusColumn
            v-for="status in group.taskType?.statuses || []"
            :key="`${group.typeId}-${status.key}`"
            :status="status"
            :tasks="getTasksByStatus(group.tasks, status.key)"
            :task-type="group.taskType"
            @task-click="handleTaskClick"
            @task-drop="handleTaskDrop"
            @status-change="handleStatusChange"
        />
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="taskGroups.length === 0" class="empty-kanban">
      <el-icon size="64"><Grid /></el-icon>
      <h3>暂无子任务</h3>
      <p>创建子任务来分解当前任务的工作内容</p>
      <el-button type="primary" :icon="Plus" @click="handleCreate">
        创建子任务
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Plus, Grid } from '@element-plus/icons-vue'
import StatusColumn from './StatusColumn.vue'

// Props
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  taskTypes: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['task-click', 'status-change', 'create'])

// 计算属性
const taskGroups = computed(() => {
  // 按任务类型分组
  const groups = new Map()

  props.tasks.forEach(task => {
    const typeId = task.typeId
    if (!groups.has(typeId)) {
      groups.set(typeId, {
        typeId,
        taskType: props.taskTypes.find(type => type.id === typeId),
        tasks: []
      })
    }
    groups.get(typeId).tasks.push(task)
  })

  // 转换为数组并按任务类型名称排序
  return Array.from(groups.values()).sort((a, b) => {
    const nameA = a.taskType?.name || ''
    const nameB = b.taskType?.name || ''
    return nameA.localeCompare(nameB)
  })
})

// 方法
const getTasksByStatus = (tasks, statusKey) => {
  return tasks.filter(task => task.status === statusKey)
}

const handleTaskClick = (task) => {
  emit('task-click', task)
}

const handleTaskDrop = (task, newStatus) => {
  emit('status-change', task, newStatus)
}

const handleStatusChange = (task, newStatus) => {
  emit('status-change', task, newStatus)
}

const handleCreateTask = (taskType) => {
  emit('create', taskType)
}

const handleCreate = () => {
  emit('create')
}
</script>

<style scoped>
.task-kanban {
  width: 100%;
}

.kanban-group {
  margin-bottom: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: visible; /* 确保不阻止换行 */
}

.kanban-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.group-icon {
  font-size: 16px;
}

.group-name {
  font-size: 14px;
}

.group-count {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.kanban-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); /* 自动换行的关键 */
  gap: 1px;
  min-height: 200px;
  background: #e4e7ed; /* 间隙颜色 */
}

.empty-kanban {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  text-align: center;
  background: white;
  border: 1px dashed #e4e7ed;
  border-radius: 8px;
}

.empty-kanban .el-icon {
  color: #c0c4cc;
  margin-bottom: 16px;
}

.empty-kanban h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-kanban p {
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .kanban-columns {
    overflow-x: auto;
  }

  :deep(.status-column) {
    min-width: 200px;
    flex-shrink: 0;
  }
}
</style>