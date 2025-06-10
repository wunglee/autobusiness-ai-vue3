<!-- src/views/Workspace/TaskBoard.vue -->
<template>
  <div class="task-board">
    <!-- 顶部工具栏 -->
    <div class="task-board-header">
      <div class="header-left">
        <h2>任务看板</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="path in currentPath" :key="path.id">
            {{ path.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="header-right">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button :icon="Setting" @click="openTaskTypeConfig">配置</el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="task-board-content">
      <div class="workspace-layout">
        <!-- 左侧任务列表 -->
        <div class="workspace-sidebar">
          <TaskList
              :tasks="tasks"
              :task-types="taskTypes"
              :selected-task-id="selectedTaskId"
              :loading="loading"
              @select="handleSelectTask"
              @create="handleCreateTask"
              @edit="handleEditTask"
              @delete="handleDeleteTask"
              @refresh="loadTasks"
          />
        </div>

        <!-- 右侧任务详情 -->
        <div class="workspace-main">
          <TaskDetail
              v-if="selectedTask"
              :task="selectedTask"
              :task-type="selectedTaskType"
              :child-tasks="childTasks"
              :task-types="taskTypes"
              @update="handleUpdateTask"
              @status-change="handleStatusChange"
              @create-child="handleCreateChildTask"
              @select-child="handleSelectTask"
          />
          <div v-else class="empty-detail">
            <el-icon size="64"><Calendar /></el-icon>
            <h3>选择任务查看详情</h3>
            <p>从左侧任务列表中选择一个任务来查看其详细信息和子任务状态</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务类型配置对话框 -->
    <TaskTypeConfig
        v-model="showTaskTypeConfig"
        @save="handleTaskTypesSaved"
    />

    <!-- 创建任务对话框 -->
    <TaskCreateDialog
        v-model="showCreateDialog"
        :parent-task="createParentTask"
        :task-types="taskTypes"
        @confirm="handleTaskCreated"
    />

    <!-- 编辑任务对话框 -->
    <TaskEditDialog
        v-model="showEditDialog"
        :task="editingTask"
        :task-type="editingTaskType"
        @confirm="handleTaskUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  Setting,
  Refresh
} from '@element-plus/icons-vue'

// 组件导入
import TaskTypeConfig from './TaskConfig/TaskTypeConfig.vue'
import TaskList from './TaskBoard/TaskList.vue'
import TaskDetail from './TaskBoard/TaskDetail.vue'
import TaskCreateDialog from './TaskBoard/TaskCreateDialog.vue'
import TaskEditDialog from './TaskBoard/TaskEditDialog.vue'

// 响应式数据
const loading = ref(false)
const showTaskTypeConfig = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedTaskId = ref(null)
const createParentTask = ref(null)
const editingTask = ref(null)

// 任务类型数据
const taskTypes = ref([])

// 任务数据
const tasks = ref([])

// 计算属性
const selectedTask = computed(() => {
  return findTaskById(tasks.value, selectedTaskId.value)
})

const selectedTaskType = computed(() => {
  if (!selectedTask.value) return null
  return taskTypes.value.find(type => type.id === selectedTask.value.typeId)
})

const editingTaskType = computed(() => {
  if (!editingTask.value) return null
  return taskTypes.value.find(type => type.id === editingTask.value.typeId)
})

const childTasks = computed(() => {
  if (!selectedTask.value) return []
  return tasks.value.filter(task => task.parentId === selectedTask.value.id)
})

const currentPath = computed(() => {
  if (!selectedTask.value) return []
  const path = []
  let current = selectedTask.value

  while (current) {
    path.unshift({ id: current.id, title: current.title })
    current = findTaskById(tasks.value, current.parentId)
  }

  return path
})

// 辅助函数
const findTaskById = (taskList, id) => {
  if (!id) return null

  for (const task of taskList) {
    if (task.id === id) return task
  }
  return null
}

// 生成示例数据
const generateSampleData = () => {
  // 示例任务类型
  taskTypes.value = [
    {
      id: '1',
      name: '需求任务',
      icon: '📋',
      description: '产品需求管理',
      color: '#409eff',
      statuses: [
        { key: 'todo', label: '待办', color: '#909399' },
        { key: 'analysis', label: '需求分析', color: '#409eff' },
        { key: 'review', label: '评审中', color: '#e6a23c' },
        { key: 'approved', label: '已通过', color: '#67c23a' },
        { key: 'rejected', label: '已拒绝', color: '#f56c6c' }
      ],
      allowedChildTypes: ['2', '3']
    },
    {
      id: '2',
      name: '设计任务',
      icon: '🎨',
      description: 'UI/UX设计任务',
      color: '#67c23a',
      statuses: [
        { key: 'draft', label: '草稿', color: '#909399' },
        { key: 'designing', label: '设计中', color: '#409eff' },
        { key: 'review', label: '待审核', color: '#e6a23c' },
        { key: 'approved', label: '已通过', color: '#67c23a' }
      ],
      allowedChildTypes: []
    },
    {
      id: '3',
      name: '开发任务',
      icon: '💻',
      description: '软件开发任务',
      color: '#606266',
      statuses: [
        { key: 'todo', label: '待开发', color: '#909399' },
        { key: 'coding', label: '开发中', color: '#409eff' },
        { key: 'testing', label: '测试中', color: '#e6a23c' },
        { key: 'done', label: '已完成', color: '#67c23a' }
      ],
      allowedChildTypes: []
    }
  ]

  // 示例任务数据
  tasks.value = [
    {
      id: '1',
      title: '用户管理系统',
      typeId: '1',
      parentId: null,
      status: 'analysis',
      assignee: 'agent-001',
      progress: 25,
      budget: 50000,
      remainingBudget: 37500,
      description: '构建完整的用户管理系统，包含注册、登录、权限管理等功能',
      attributes: {
        priority: 'high',
        deadline: '2024-03-01'
      },
      level: 0,
      path: '1',
      hasChildren: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: '用户注册功能',
      typeId: '1',
      parentId: '1',
      status: 'approved',
      assignee: 'agent-002',
      progress: 80,
      budget: 15000,
      remainingBudget: 3000,
      description: '实现用户注册功能，包含邮箱验证、手机验证等',
      attributes: {},
      level: 1,
      path: '1.2',
      hasChildren: true,
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: '注册页面设计',
      typeId: '2',
      parentId: '2',
      status: 'approved',
      assignee: 'agent-003',
      progress: 100,
      budget: 5000,
      remainingBudget: 0,
      description: '设计用户注册页面的UI界面',
      attributes: {
        design_type: 'ui'
      },
      level: 2,
      path: '1.2.3',
      hasChildren: false,
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: '注册功能开发',
      typeId: '3',
      parentId: '2',
      status: 'coding',
      assignee: 'agent-004',
      progress: 60,
      budget: 8000,
      remainingBudget: 3200,
      description: '实现注册功能的后端API和前端交互',
      attributes: {},
      level: 2,
      path: '1.2.4',
      hasChildren: false,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date()
    },
    {
      id: '5',
      title: '用户登录功能',
      typeId: '1',
      parentId: '1',
      status: 'todo',
      assignee: 'agent-005',
      progress: 0,
      budget: 12000,
      remainingBudget: 12000,
      description: '实现用户登录功能，支持多种登录方式',
      attributes: {},
      level: 1,
      path: '1.5',
      hasChildren: false,
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date()
    }
  ]
}

// 方法
const loadTasks = async () => {
  loading.value = true
  try {
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 生成示例数据
    generateSampleData()

    // 默认选中第一个任务
    if (tasks.value.length > 0 && !selectedTaskId.value) {
      selectedTaskId.value = tasks.value[0].id
    }
  } catch (error) {
    ElMessage.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  loadTasks()
}

const handleSelectTask = (taskId) => {
  selectedTaskId.value = taskId
}

const handleCreateTask = (parentTask = null) => {
  createParentTask.value = parentTask
  showCreateDialog.value = true
}

const handleCreateChildTask = (parentTask) => {
  handleCreateTask(parentTask)
}

const handleEditTask = (task) => {
  editingTask.value = { ...task }
  showEditDialog.value = true
}

const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除任务"${task.title}"吗？此操作不可恢复。`,
        '确认删除',
        { type: 'warning' }
    )

    // 删除任务及其子任务
    const deleteTaskAndChildren = (taskId) => {
      const childTasks = tasks.value.filter(t => t.parentId === taskId)
      childTasks.forEach(child => deleteTaskAndChildren(child.id))

      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index > -1) {
        tasks.value.splice(index, 1)
      }
    }

    deleteTaskAndChildren(task.id)

    // 如果删除的是当前选中的任务，清空选中状态
    if (selectedTaskId.value === task.id) {
      selectedTaskId.value = null
    }

    ElMessage.success('任务已删除')
  } catch {
    // 用户取消删除
  }
}

const handleUpdateTask = (updatedTask) => {
  const index = tasks.value.findIndex(t => t.id === updatedTask.id)
  if (index > -1) {
    tasks.value[index] = { ...updatedTask, updatedAt: new Date() }
    ElMessage.success('任务已更新')
  }
}

const handleStatusChange = (task, newStatus) => {
  const updatedTask = {
    ...task,
    status: newStatus,
    updatedAt: new Date()
  }

  // 如果状态变为完成，设置进度为100%
  const taskType = taskTypes.value.find(type => type.id === task.typeId)
  const statusConfig = taskType?.statuses.find(s => s.key === newStatus)
  if (statusConfig && (statusConfig.label.includes('完成') || statusConfig.label.includes('通过'))) {
    updatedTask.progress = 100
  }

  handleUpdateTask(updatedTask)
}

const handleTaskCreated = (newTask) => {
  // 生成新ID
  newTask.id = Date.now().toString()
  newTask.createdAt = new Date()
  newTask.updatedAt = new Date()

  // 设置层级信息
  if (newTask.parentId) {
    const parent = findTaskById(tasks.value, newTask.parentId)
    if (parent) {
      newTask.level = parent.level + 1
      newTask.path = `${parent.path}.${newTask.id}`

      // 更新父任务的hasChildren状态
      parent.hasChildren = true
    }
  } else {
    newTask.level = 0
    newTask.path = newTask.id
  }

  newTask.hasChildren = false

  tasks.value.push(newTask)
  selectedTaskId.value = newTask.id

  ElMessage.success('任务创建成功')
}

const handleTaskUpdated = (updatedTask) => {
  handleUpdateTask(updatedTask)
  editingTask.value = null
}

const openTaskTypeConfig = () => {
  showTaskTypeConfig.value = true
}

const handleTaskTypesSaved = (types) => {
  taskTypes.value = types
  ElMessage.success(`已保存 ${types.length} 个任务类型配置`)
}

// 生命周期
onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.task-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.task-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  gap: 12px;
}

.task-board-content {
  flex: 1;
  overflow: hidden;
}

.workspace-layout {
  height: 100%;
  display: flex;
}

.workspace-sidebar {
  width: 320px;
  border-right: 1px solid #e4e7ed;
  background: white;
  overflow: hidden;
}

.workspace-main {
  flex: 1;
  background: #fafbfc;
  overflow: hidden;
}

.empty-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  padding: 40px;
}

.empty-detail h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  font-weight: 500;
}

.empty-detail p {
  margin: 0;
  text-align: center;
  line-height: 1.5;
}

:deep(.el-breadcrumb) {
  font-size: 13px;
}

:deep(.el-breadcrumb__item) {
  color: #606266;
}
</style>