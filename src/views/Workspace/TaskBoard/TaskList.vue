<!-- src/views/Workspace/TaskBoard/TaskList.vue -->
<template>
  <div class="task-list">
    <!-- 列表头部 -->
    <div class="list-header">
      <h3>任务列表</h3>
      <div class="header-actions">
        <el-button
            type="text"
            :icon="Plus"
            @click="handleCreate(null)"
            title="创建根任务"
            size="small"
        >
          创建
        </el-button>
        <el-button
            type="text"
            :icon="Setting"
            @click="openSettings"
            title="配置任务类型"
            size="small"
        />
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索任务..."
          :prefix-icon="Search"
          clearable
          size="small"
      />
    </div>

    <!-- 任务树 -->
    <div class="task-tree" v-loading="loading">
      <div v-if="filteredTasks.length === 0" class="empty-tasks">
        <el-icon><DocumentAdd /></el-icon>
        <p>暂无任务</p>
        <el-button
            type="primary"
            size="small"
            :icon="Plus"
            @click="handleCreate(null)"
        >
          创建第一个任务
        </el-button>
      </div>

      <div v-else class="tree-nodes">
        <TaskNode
            v-for="task in rootTasks"
            :key="task.id"
            :task="task"
            :task-type="getTaskType(task.typeId)"
            :children="getChildTasks(task.id)"
            :selected="selectedTaskId === task.id"
            :expanded="expandedNodes[task.id]"
            @select="handleSelect"
            @toggle="handleToggle"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 右键菜单 -->
    <el-menu
        v-show="contextMenu.visible"
        :style="contextMenu.style"
        class="context-menu"
        @select="handleContextMenuSelect"
    >
      <el-menu-item index="create">
        <el-icon><Plus /></el-icon>
        <span>创建子任务</span>
      </el-menu-item>
      <el-menu-item index="edit">
        <el-icon><Edit /></el-icon>
        <span>编辑任务</span>
      </el-menu-item>
      <el-menu-item index="copy">
        <el-icon><CopyDocument /></el-icon>
        <span>复制任务</span>
      </el-menu-item>
      <el-divider style="margin: 4px 0;" />
      <el-menu-item index="delete" class="danger-item">
        <el-icon><Delete /></el-icon>
        <span>删除任务</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Plus,
  Setting,
  Search,
  DocumentAdd,
  Edit,
  Delete,
  CopyDocument
} from '@element-plus/icons-vue'
import TaskNode from './TaskNode.vue'

// Props
const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  },
  taskTypes: {
    type: Array,
    default: () => []
  },
  selectedTaskId: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['select', 'create', 'edit', 'delete', 'refresh'])

// 响应式数据
const searchKeyword = ref('')
const expandedNodes = ref({})
const contextMenu = ref({
  visible: false,
  task: null,
  style: {
    position: 'fixed',
    left: '0px',
    top: '0px',
    zIndex: 1000
  }
})

// 计算属性
const filteredTasks = computed(() => {
  if (!searchKeyword.value.trim()) return props.tasks

  const keyword = searchKeyword.value.toLowerCase()
  return props.tasks.filter(task =>
      task.title.toLowerCase().includes(keyword) ||
      task.description?.toLowerCase().includes(keyword)
  )
})

const rootTasks = computed(() => {
  return filteredTasks.value
      .filter(task => !task.parentId)
      .sort((a, b) => a.createdAt - b.createdAt)
})

// 方法
const getTaskType = (typeId) => {
  return props.taskTypes.find(type => type.id === typeId)
}

const getChildTasks = (parentId) => {
  return filteredTasks.value
      .filter(task => task.parentId === parentId)
      .sort((a, b) => a.createdAt - b.createdAt)
}

const handleSelect = (task) => {
  emit('select', task.id)
}

const handleToggle = (task) => {
  expandedNodes.value[task.id] = !expandedNodes.value[task.id]
}

const handleCreate = (parentTask) => {
  emit('create', parentTask)
}

const handleEdit = (task) => {
  emit('edit', task)
}

const handleDelete = (task) => {
  emit('delete', task)
}

const openSettings = () => {
  // 这里可以通过事件向父组件传递打开设置的请求
  // 或者通过 provide/inject 等方式
}

// 右键菜单处理
const showContextMenu = (event, task) => {
  event.preventDefault()
  event.stopPropagation()

  contextMenu.value.task = task
  contextMenu.value.style.left = event.clientX + 'px'
  contextMenu.value.style.top = event.clientY + 'px'
  contextMenu.value.visible = true
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.task = null
}

const handleContextMenuSelect = (index) => {
  const task = contextMenu.value.task
  if (!task) return

  switch (index) {
    case 'create':
      handleCreate(task)
      break
    case 'edit':
      handleEdit(task)
      break
    case 'copy':
      // TODO: 实现复制功能
      break
    case 'delete':
      handleDelete(task)
      break
  }

  hideContextMenu()
}

// 监听点击事件以隐藏右键菜单
const handleDocumentClick = (event) => {
  if (contextMenu.value.visible) {
    hideContextMenu()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)

  // 初始化展开状态
  props.tasks.forEach(task => {
    if (task.hasChildren) {
      expandedNodes.value[task.id] = true
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})

// 监听任务变化，自动展开有子任务的节点
watch(() => props.tasks, (newTasks) => {
  newTasks.forEach(task => {
    if (task.hasChildren && !(task.id in expandedNodes.value)) {
      expandedNodes.value[task.id] = true
    }
  })
}, { immediate: true })

// 暴露方法给父组件
defineExpose({
  showContextMenu
})
</script>

<style scoped>
.task-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.search-box {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.task-tree {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  text-align: center;
}

.empty-tasks .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.empty-tasks p {
  margin: 0 0 16px 0;
  font-size: 14px;
}

.tree-nodes {
  padding: 8px 0;
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 1000;
}

:deep(.context-menu .el-menu-item) {
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  padding: 0 16px;
}

:deep(.context-menu .danger-item) {
  color: #f56c6c;
}

:deep(.context-menu .danger-item:hover) {
  background: #fef0f0;
  color: #f56c6c;
}

/* 滚动条样式 */
.task-tree::-webkit-scrollbar {
  width: 6px;
}

.task-tree::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-tree::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.task-tree::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>