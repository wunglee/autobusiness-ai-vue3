<!-- src/views/Workspace/TaskBoard/TaskNode.vue -->
<template>
  <div class="task-node">
    <!-- 当前任务节点 -->
    <div
        class="node-content"
        :class="{
        'is-selected': selected,
        'is-root': !task.parentId,
        'has-children': task.hasChildren
      }"
        @click="handleSelect"
        @contextmenu="handleContextMenu"
    >
      <!-- 展开/折叠按钮 -->
      <div class="expand-btn" @click.stop="handleToggle">
        <el-icon v-if="task.hasChildren" class="expand-icon" :class="{ 'is-expanded': expanded }">
          <ArrowRight />
        </el-icon>
        <span v-else class="expand-placeholder"></span>
      </div>

      <!-- 任务图标 -->
      <div class="task-icon">
        <span class="icon-emoji">{{ taskType?.icon || '📝' }}</span>
      </div>

      <!-- 任务信息 -->
      <div class="task-info">
        <div class="task-title">{{ task.title }}</div>
        <div class="task-meta">
          <span class="task-type">{{ taskType?.name || '未知类型' }}</span>
          <span class="task-status" :style="{ color: getStatusColor(task.status) }">
            {{ getStatusLabel(task.status) }}
          </span>
          <span v-if="task.progress > 0" class="task-progress">{{ task.progress }}%</span>
        </div>
      </div>

      <!-- 任务状态指示器 -->
      <div class="status-indicator" :style="{ backgroundColor: getStatusColor(task.status) }"></div>

      <!-- 快捷操作按钮 -->
      <div class="node-actions" @click.stop>
        <el-dropdown @command="handleActionCommand" trigger="click">
          <el-button type="text" :icon="MoreFilled" size="small" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="create" :icon="Plus">
                创建子任务
              </el-dropdown-item>
              <el-dropdown-item command="edit" :icon="Edit">
                编辑任务
              </el-dropdown-item>
              <el-dropdown-item command="copy" :icon="CopyDocument">
                复制任务
              </el-dropdown-item>
              <el-dropdown-item divided command="delete" :icon="Delete" class="danger-item">
                删除任务
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 子任务节点 -->
    <div v-if="expanded && task.hasChildren" class="child-nodes">
      <TaskNode
          v-for="child in children"
          :key="child.id"
          :task="child"
          :task-type="getChildTaskType(child.typeId)"
          :children="getGrandChildren(child.id)"
          :selected="child.id === selectedTaskId"
          :expanded="childExpandedStates[child.id]"
          @select="handleChildSelect"
          @toggle="handleChildToggle"
          @create="handleChildCreate"
          @edit="handleChildEdit"
          @delete="handleChildDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import {
  ArrowRight,
  MoreFilled,
  Plus,
  Edit,
  Delete,
  CopyDocument
} from '@element-plus/icons-vue'

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
  children: {
    type: Array,
    default: () => []
  },
  selected: {
    type: Boolean,
    default: false
  },
  expanded: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select', 'toggle', 'create', 'edit', 'delete'])

// 注入数据
const selectedTaskId = inject('selectedTaskId', ref(null))
const taskTypes = inject('taskTypes', ref([]))
const allTasks = inject('allTasks', ref([]))

// 响应式数据
const childExpandedStates = ref({})

// 计算属性
const getGrandChildren = computed(() => (parentId) => {
  return allTasks.value.filter(task => task.parentId === parentId)
})

// 方法
const getChildTaskType = (typeId) => {
  return taskTypes.value.find(type => type.id === typeId)
}

const getStatusColor = (status) => {
  if (!props.taskType?.statuses) return '#909399'
  const statusConfig = props.taskType.statuses.find(s => s.key === status)
  return statusConfig?.color || '#909399'
}

const getStatusLabel = (status) => {
  if (!props.taskType?.statuses) return status
  const statusConfig = props.taskType.statuses.find(s => s.key === status)
  return statusConfig?.label || status
}

const handleSelect = () => {
  emit('select', props.task)
}

const handleToggle = () => {
  if (props.task.hasChildren) {
    emit('toggle', props.task)
  }
}

const handleContextMenu = (event) => {
  event.preventDefault()
  event.stopPropagation()
  // 这里可以触发父组件的右键菜单
  // emit('contextmenu', event, props.task)
}

const handleActionCommand = (command) => {
  switch (command) {
    case 'create':
      emit('create', props.task)
      break
    case 'edit':
      emit('edit', props.task)
      break
    case 'copy':
      // TODO: 实现复制功能
      break
    case 'delete':
      emit('delete', props.task)
      break
  }
}

// 子任务事件处理
const handleChildSelect = (task) => {
  emit('select', task)
}

const handleChildToggle = (task) => {
  childExpandedStates.value[task.id] = !childExpandedStates.value[task.id]
}

const handleChildCreate = (task) => {
  emit('create', task)
}

const handleChildEdit = (task) => {
  emit('edit', task)
}

const handleChildDelete = (task) => {
  emit('delete', task)
}
</script>

<style scoped>
.task-node {
  position: relative;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 8px 12px 8px 0;
  margin: 0 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  user-select: none;
}

.node-content:hover {
  background: #f5f7fa;
}

.node-content.is-selected {
  background: #e1f3ff;
  border: 1px solid #409eff;
}

.node-content.is-root {
  font-weight: 500;
}

.expand-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.expand-btn:hover {
  background: #e1f3ff;
}

.expand-icon {
  font-size: 12px;
  color: #606266;
  transition: transform 0.2s;
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.expand-placeholder {
  width: 12px;
  height: 12px;
}

.task-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  border-radius: 4px;
  background: #f5f7fa;
}

.icon-emoji {
  font-size: 14px;
}

.task-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.task-title {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.task-type {
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
}

.task-status {
  font-weight: 500;
}

.task-progress {
  background: #e1f3ff;
  color: #409eff;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-left: 8px;
  margin-right: 4px;
}

.node-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.node-content:hover .node-actions {
  opacity: 1;
}

.child-nodes {
  margin-left: 20px;
  border-left: 1px dashed #e4e7ed;
  position: relative;
}

.child-nodes::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 50%;
  width: 1px;
  background: #e4e7ed;
}

/* 危险操作样式 */
:deep(.danger-item) {
  color: #f56c6c !important;
}

:deep(.danger-item:hover) {
  background: #fef0f0 !important;
  color: #f56c6c !important;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-dropdown-menu__item) {
  font-size: 13px;
  padding: 8px 12px;
}
</style>