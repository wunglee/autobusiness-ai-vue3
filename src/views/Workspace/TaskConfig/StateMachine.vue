<template>
  <div class="state-machine">
    <div class="machine-header">
      <h5 class="section-title">状态机设计</h5>
      <p class="section-desc">设计任务的状态流转规则，定义状态节点和转换条件</p>
      <div class="machine-tools">
        <el-button size="small" :icon="Plus" @click="addStatus">添加状态</el-button>
        <el-button size="small" :icon="Refresh" @click="autoLayout">自动布局</el-button>
      </div>
    </div>

    <div class="machine-canvas-container">
      <div
          ref="canvasRef"
          class="machine-canvas"
          @click="handleCanvasClick"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
      >
        <!-- 状态节点 -->
        <StateNode
            v-for="status in localStatuses"
            :key="status.key"
            :status="status"
            :selected="selectedStatus?.key === status.key"
            :all-statuses="localStatuses"
            @select="handleSelectStatus"
            @move="handleMoveStatus"
            @edit="editStatus"
            @delete="deleteStatus"
            @start-connect="handleStartConnect"
            @resolve-conflicts="handleResolveConflicts"
        />

        <!-- 连接线 -->
        <svg class="connections-svg" :style="{ width: '100%', height: '100%' }">
          <defs>
            <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#909399" />
            </marker>
            <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
            </marker>
            <marker
                id="arrowhead-temp"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#67c23a" />
            </marker>
          </defs>

          <!-- 现有连接线 -->
          <g
              v-for="transition in transitionPaths"
              :key="transition.id"
              class="transition-group"
              @mouseenter="handleTransitionMouseEnter(transition, $event)"
              @mouseleave="handleTransitionMouseLeave"
          >
            <path
                :d="transition.path"
                :class="[
                  'transition-path',
                  { 'selected': selectedTransition?.id === transition.id }
                ]"
                :marker-end="selectedTransition?.id === transition.id ?
                  'url(#arrowhead-active)' : 'url(#arrowhead)'"
                @click="selectTransition(transition)"
            />

            <!-- 可拖拽的箭头 -->
            <circle
                :cx="transition.toPoint.x"
                :cy="transition.toPoint.y"
                r="8"
                fill="transparent"
                class="arrow-drag-area"
                @mousedown.stop="handleArrowDragStart(transition, $event)"
            />

            <!-- 连接线悬浮操作按钮 -->
            <g
                v-if="hoveredTransition?.id === transition.id"
                class="transition-actions"
                :transform="`translate(${transition.midPoint.x}, ${transition.midPoint.y})`"
            >
              <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="white"
                  stroke="#e4e7ed"
                  stroke-width="1"
                  class="action-background"
              />
              <g transform="translate(-12, -6)">
                <rect
                    x="0"
                    y="0"
                    width="12"
                    height="12"
                    fill="transparent"
                    class="action-button edit-btn"
                    @click.stop="editTransition(transition.transition)"
                />
                <path
                    d="M2 7 L6 3 L8 5 L4 9 L2 9 Z"
                    fill="#409eff"
                    pointer-events="none"
                />
              </g>
              <g transform="translate(2, -6)">
                <rect
                    x="0"
                    y="0"
                    width="12"
                    height="12"
                    fill="transparent"
                    class="action-button delete-btn"
                    @click.stop="deleteTransitionConfirm(transition.transition)"
                />
                <path
                    d="M3 3 L9 9 M9 3 L3 9"
                    stroke="#f56c6c"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    pointer-events="none"
                />
              </g>
            </g>
          </g>

          <!-- 临时连接线（拖拽时的连线） -->
          <path
              v-if="tempConnection"
              :d="tempConnection"
              class="temp-connection"
              stroke="#67c23a"
              stroke-width="3"
              fill="none"
              marker-end="url(#arrowhead-temp)"
          />
        </svg>

        <!-- 目标状态高亮框 -->
        <div
            v-if="highlightTarget"
            class="target-highlight"
            :style="{
              left: `${highlightTarget.x - 5}px`,
              top: `${highlightTarget.y - 5}px`,
              width: '110px',
              height: '70px'
            }"
        ></div>
      </div>
    </div>

    <!-- 转换规则编辑面板 -->
    <div v-if="selectedTransition" class="transition-panel">
      <div class="panel-header">
        <h6>转换规则</h6>
        <el-button type="text" :icon="Close" @click="clearSelection" />
      </div>
      <div class="panel-content">
        <TransitionEditor
            :transition="selectedTransition"
            :statuses="localStatuses"
            @update="updateTransition"
            @delete="deleteTransition"
        />
      </div>
    </div>

    <!-- 状态创建/编辑对话框 -->
    <el-dialog
        v-model="showStatusDialog"
        :title="editingStatus ? '编辑状态' : '创建状态'"
        width="500px"
    >
      <el-form :model="statusForm" label-width="80px">
        <el-form-item label="状态名称" required>
          <el-input v-model="statusForm.label" placeholder="请输入状态名称" />
        </el-form-item>
        <el-form-item label="状态键名" required>
          <el-input
              v-model="statusForm.key"
              placeholder="英文键名，如：in_progress"
              @input="handleStatusKeyInput"
          />
        </el-form-item>
        <el-form-item label="状态类型">
          <el-radio-group v-model="statusForm.type">
            <el-radio label="initial">初始状态</el-radio>
            <el-radio label="normal">普通状态</el-radio>
            <el-radio label="final">最终状态</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态颜色">
          <el-color-picker v-model="statusForm.color" />
        </el-form-item>
        <el-form-item label="状态描述">
          <el-input
              v-model="statusForm.description"
              type="textarea"
              :rows="3"
              placeholder="请描述此状态的含义"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStatusDialog = false">取消</el-button>
        <el-button type="primary" @click="saveStatus">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Close } from '@element-plus/icons-vue'
import StateNode from './StateNode.vue'
import TransitionEditor from './TransitionEditor.vue'

// Props
const props = defineProps({
  statuses: {
    type: Array,
    default: () => []
  },
  transitions: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update-statuses', 'update-transitions'])

// 响应式数据
const localStatuses = ref([...props.statuses])
const localTransitions = ref([...props.transitions])
const canvasRef = ref(null)
const selectedStatus = ref(null)
const selectedTransition = ref(null)
const tempConnection = ref('')
const mousePos = ref({ x: 0, y: 0 })
const isConnecting = ref(false)
const connectSource = ref(null)
const highlightTarget = ref(null)
const hoveredTransition = ref(null)

// 拖拽连线相关
const isDraggingArrow = ref(false)
const draggingTransition = ref(null)

// 对话框相关
const showStatusDialog = ref(false)
const editingStatus = ref(null)
const statusForm = ref({
  key: '',
  label: '',
  type: 'normal',
  color: '#409eff',
  description: '',
  position: { x: 100, y: 100 }
})

// 计算连接线路径
const transitionPaths = computed(() => {
  return localTransitions.value.map(transition => {
    const fromStatus = localStatuses.value.find(s => s.key === transition.fromStatus)
    const toStatus = localStatuses.value.find(s => s.key === transition.toStatus)

    if (!fromStatus || !toStatus) return null

    const fromCenter = {
      x: fromStatus.position.x + 50,
      y: fromStatus.position.y + 30
    }
    const toCenter = {
      x: toStatus.position.x + 50,
      y: toStatus.position.y + 30
    }

    // 计算最佳连接点和路径
    const { fromPoint, toPoint, path } = calculateConnectionPath(fromStatus, toStatus)

    // 计算中点（用于显示操作按钮）
    const midPoint = {
      x: (fromPoint.x + toPoint.x) / 2,
      y: (fromPoint.y + toPoint.y) / 2
    }

    return {
      id: transition.id,
      path,
      transition,
      midPoint,
      fromPoint,
      toPoint
    }
  }).filter(Boolean)
})

// 计算连接路径
const calculateConnectionPath = (fromStatus, toStatus) => {
  const fromRect = {
    x: fromStatus.position.x,
    y: fromStatus.position.y,
    width: 100,
    height: 60
  }

  const toRect = {
    x: toStatus.position.x,
    y: toStatus.position.y,
    width: 100,
    height: 60
  }

  const fromCenter = {
    x: fromRect.x + fromRect.width / 2,
    y: fromRect.y + fromRect.height / 2
  }

  const toCenter = {
    x: toRect.x + toRect.width / 2,
    y: toRect.y + toRect.height / 2
  }

  // 计算最佳连接边
  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y

  let fromPoint, toPoint

  // 优先使用直线连接
  if (Math.abs(dx) > Math.abs(dy)) {
    // 水平连接
    if (dx > 0) {
      // 从右到左
      fromPoint = { x: fromRect.x + fromRect.width, y: fromCenter.y }
      toPoint = { x: toRect.x, y: toCenter.y }
    } else {
      // 从左到右
      fromPoint = { x: fromRect.x, y: fromCenter.y }
      toPoint = { x: toRect.x + toRect.width, y: toCenter.y }
    }
  } else {
    // 垂直连接
    if (dy > 0) {
      // 从下到上
      fromPoint = { x: fromCenter.x, y: fromRect.y + fromRect.height }
      toPoint = { x: toCenter.x, y: toRect.y }
    } else {
      // 从上到下
      fromPoint = { x: fromCenter.x, y: fromRect.y }
      toPoint = { x: toCenter.x, y: toRect.y + toRect.height }
    }
  }

  // 生成路径（优先直线）
  const path = `M ${fromPoint.x} ${fromPoint.y} L ${toPoint.x} ${toPoint.y}`

  return { fromPoint, toPoint, path }
}

// 监听props变化
watch(() => props.statuses, (newStatuses) => {
  localStatuses.value = [...newStatuses]
}, { deep: true })

watch(() => props.transitions, (newTransitions) => {
  localTransitions.value = [...newTransitions]
}, { deep: true })

// 方法
const handleCanvasClick = (event) => {
  if (event.target === canvasRef.value) {
    clearSelection()
    if (isConnecting.value) {
      // 取消连接
      isConnecting.value = false
      connectSource.value = null
      tempConnection.value = ''
      highlightTarget.value = null
    }
  }
}

const handleMouseMove = (event) => {
  if (!canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  // 更新临时连接线
  if (isConnecting.value && connectSource.value) {
    updateTempConnection()
    updateTargetHighlight()
  }

  // 更新拖拽连线
  if (isDraggingArrow.value && draggingTransition.value) {
    updateDragConnection()
    updateTargetHighlight()
  }
}

const updateTempConnection = () => {
  if (!connectSource.value) return

  const sourcePos = connectSource.value.position
  const sourceCenter = { x: sourcePos.x + 50, y: sourcePos.y + 30 }

  // 直线连接到鼠标位置
  tempConnection.value = `M ${sourceCenter.x} ${sourceCenter.y} L ${mousePos.value.x} ${mousePos.value.y}`
}

const updateDragConnection = () => {
  if (!draggingTransition.value) return

  const fromStatus = localStatuses.value.find(s => s.key === draggingTransition.value.transition.fromStatus)
  if (!fromStatus) return

  const sourcePos = fromStatus.position
  const sourceCenter = { x: sourcePos.x + 50, y: sourcePos.y + 30 }

  // 使用实线连接
  tempConnection.value = `M ${sourceCenter.x} ${sourceCenter.y} L ${mousePos.value.x} ${mousePos.value.y}`
}

const updateTargetHighlight = () => {
  // 检查鼠标是否悬停在目标状态上
  const targetStatus = localStatuses.value.find(status => {
    if (isConnecting.value && status.key === connectSource.value?.key) return false
    if (isDraggingArrow.value && status.key === draggingTransition.value?.transition.fromStatus) return false

    const statusBounds = {
      left: status.position.x,
      top: status.position.y,
      right: status.position.x + 100,
      bottom: status.position.y + 60
    }

    return mousePos.value.x >= statusBounds.left &&
        mousePos.value.x <= statusBounds.right &&
        mousePos.value.y >= statusBounds.top &&
        mousePos.value.y <= statusBounds.bottom
  })

  highlightTarget.value = targetStatus ? targetStatus.position : null
}

const handleMouseUp = () => {
  if (isConnecting.value) {
    // 检查是否释放在目标状态上
    const targetStatus = getTargetStatusAtMouse()

    if (targetStatus) {
      handleConnectStatus(targetStatus)
    }

    // 结束连接模式
    isConnecting.value = false
    connectSource.value = null
    tempConnection.value = ''
    highlightTarget.value = null
  }

  if (isDraggingArrow.value) {
    // 检查是否释放在目标状态上
    const targetStatus = getTargetStatusAtMouse()

    if (targetStatus && draggingTransition.value) {
      // 更新连接的目标
      const transition = draggingTransition.value.transition
      transition.toStatus = targetStatus.key
      transition.name = `${localStatuses.value.find(s => s.key === transition.fromStatus)?.label} → ${targetStatus.label}`

      updateTransition(transition)
      ElMessage.success('连接已更新')
    }

    // 结束拖拽
    isDraggingArrow.value = false
    draggingTransition.value = null
    tempConnection.value = ''
    highlightTarget.value = null
  }
}

const getTargetStatusAtMouse = () => {
  return localStatuses.value.find(status => {
    const statusBounds = {
      left: status.position.x,
      top: status.position.y,
      right: status.position.x + 100,
      bottom: status.position.y + 60
    }

    return mousePos.value.x >= statusBounds.left &&
        mousePos.value.x <= statusBounds.right &&
        mousePos.value.y >= statusBounds.top &&
        mousePos.value.y <= statusBounds.bottom
  })
}

const handleStartConnect = (status, event) => {
  connectSource.value = status
  isConnecting.value = true

  // 立即更新鼠标位置和临时连接线
  const rect = canvasRef.value.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  updateTempConnection()
}

const handleArrowDragStart = (transitionPath, event) => {
  event.preventDefault()
  event.stopPropagation()

  isDraggingArrow.value = true
  draggingTransition.value = transitionPath

  // 更新鼠标位置
  const rect = canvasRef.value.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  updateDragConnection()
}

const handleSelectStatus = (status) => {
  selectedStatus.value = status
  selectedTransition.value = null
}

const handleMoveStatus = (status, position) => {
  const index = localStatuses.value.findIndex(s => s.key === status.key)
  if (index > -1) {
    localStatuses.value[index].position = position
    emit('update-statuses', localStatuses.value)
  }
}

const handleResolveConflicts = (conflicts) => {
  // 更新冲突节点的位置
  emit('update-statuses', localStatuses.value)
}

const handleConnectStatus = (targetStatus) => {
  if (!connectSource.value || connectSource.value.key === targetStatus.key) return

  // 检查是否已存在相同的转换
  const existingTransition = localTransitions.value.find(t =>
      t.fromStatus === connectSource.value.key && t.toStatus === targetStatus.key
  )

  if (existingTransition) {
    ElMessage.warning('该转换已存在')
    return
  }

  // 创建新的转换
  const newTransition = {
    id: `t_${Date.now()}`,
    name: `${connectSource.value.label} → ${targetStatus.label}`,
    fromStatus: connectSource.value.key,
    toStatus: targetStatus.key,
    triggers: [],
    actions: []
  }

  localTransitions.value.push(newTransition)
  emit('update-transitions', localTransitions.value)

  ElMessage.success('转换规则已创建')
}

const handleTransitionMouseEnter = (transitionPath, event) => {
  hoveredTransition.value = transitionPath
}

const handleTransitionMouseLeave = () => {
  hoveredTransition.value = null
}

const editTransition = (transition) => {
  selectedTransition.value = transition
  selectedStatus.value = null
}

const deleteTransitionConfirm = async (transition) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除转换规则"${transition.name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )
    deleteTransition(transition.id)
  } catch {
    // 用户取消删除
  }
}

const addStatus = () => {
  editingStatus.value = null
  statusForm.value = {
    key: '',
    label: '',
    type: 'normal',
    color: '#409eff',
    description: '',
    position: { x: 100 + localStatuses.value.length * 50, y: 100 }
  }
  showStatusDialog.value = true
}

const editStatus = (status) => {
  editingStatus.value = status
  statusForm.value = { ...status }
  showStatusDialog.value = true
}

const deleteStatus = async (status) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除状态"${status.label}"吗？这将同时删除相关的所有转换规则。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    // 删除状态
    const statusIndex = localStatuses.value.findIndex(s => s.key === status.key)
    if (statusIndex > -1) {
      localStatuses.value.splice(statusIndex, 1)
    }

    // 删除相关的转换规则
    localTransitions.value = localTransitions.value.filter(t =>
        t.fromStatus !== status.key && t.toStatus !== status.key
    )

    emit('update-statuses', localStatuses.value)
    emit('update-transitions', localTransitions.value)

    if (selectedStatus.value?.key === status.key) {
      selectedStatus.value = null
    }

    ElMessage.success('状态已删除')
  } catch {
    // 用户取消删除
  }
}

const saveStatus = () => {
  if (!statusForm.value.label.trim()) {
    ElMessage.error('请输入状态名称')
    return
  }

  if (!statusForm.value.key.trim()) {
    ElMessage.error('请输入状态键名')
    return
  }

  // 检查键名是否重复
  const existingStatus = localStatuses.value.find(s =>
      s.key === statusForm.value.key && s.key !== editingStatus.value?.key
  )

  if (existingStatus) {
    ElMessage.error('状态键名已存在')
    return
  }

  if (editingStatus.value) {
    // 编辑现有状态
    const index = localStatuses.value.findIndex(s => s.key === editingStatus.value.key)
    if (index > -1) {
      localStatuses.value[index] = { ...statusForm.value }
    }
  } else {
    // 创建新状态
    localStatuses.value.push({ ...statusForm.value })
  }

  emit('update-statuses', localStatuses.value)
  showStatusDialog.value = false

  ElMessage.success(editingStatus.value ? '状态已更新' : '状态已创建')
}

const updateStatus = () => {
  if (selectedStatus.value) {
    emit('update-statuses', localStatuses.value)
  }
}

const selectTransition = (transitionPath) => {
  selectedTransition.value = transitionPath.transition
  selectedStatus.value = null
}

const updateTransition = (updatedTransition) => {
  const index = localTransitions.value.findIndex(t => t.id === updatedTransition.id)
  if (index > -1) {
    localTransitions.value[index] = updatedTransition
    emit('update-transitions', localTransitions.value)
  }
}

const deleteTransition = (transitionId) => {
  const index = localTransitions.value.findIndex(t => t.id === transitionId)
  if (index > -1) {
    localTransitions.value.splice(index, 1)
    emit('update-transitions', localTransitions.value)
    selectedTransition.value = null
    ElMessage.success('转换规则已删除')
  }
}

const autoLayout = () => {
  // 改进的自动布局算法
  const cols = Math.ceil(Math.sqrt(localStatuses.value.length))
  const spacing = { x: 150, y: 120 }
  const startPos = { x: 50, y: 50 }

  localStatuses.value.forEach((status, index) => {
    const row = Math.floor(index / cols)
    const col = index % cols

    status.position = {
      x: startPos.x + col * spacing.x,
      y: startPos.y + row * spacing.y
    }
  })

  emit('update-statuses', localStatuses.value)
  ElMessage.success('布局已更新')
}

const clearSelection = () => {
  selectedStatus.value = null
  selectedTransition.value = null
}

const handleStatusKeyInput = (value) => {
  statusForm.value.key = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
}
</script>

<style scoped>
.state-machine {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
}

.machine-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.section-desc {
  font-size: 14px;
  color: #909399;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.machine-tools {
  display: flex;
  gap: 8px;
}

.machine-canvas-container {
  flex: 1;
  position: relative;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  min-height: 400px;
}

.machine-canvas {
  width: 100%;
  height: 100%;
  position: relative;
  background:
      radial-gradient(circle, #e0e0e0 1px, transparent 1px),
      linear-gradient(0deg, transparent 24px, #f0f0f0 25px, #f0f0f0 26px, transparent 27px),
      linear-gradient(90deg, transparent 24px, #f0f0f0 25px, #f0f0f0 26px, transparent 27px);
  background-size: 25px 25px;
  background-position: 0 0, 0 0, 0 0;
  cursor: default;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.transition-group {
  pointer-events: all;
}

.transition-path {
  fill: none;
  stroke: #909399;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s;
}

.transition-path:hover {
  stroke: #409eff;
  stroke-width: 3;
}

.transition-path.selected {
  stroke: #409eff;
  stroke-width: 3;
}

.arrow-drag-area {
  cursor: grab;
  transition: all 0.2s;
}

.arrow-drag-area:hover {
  fill: rgba(64, 158, 255, 0.3);
}

.temp-connection {
  pointer-events: none;
  opacity: 0.8;
}

.target-highlight {
  position: absolute;
  border: 3px solid #67c23a;
  border-radius: 10px;
  background: rgba(103, 194, 58, 0.1);
  pointer-events: none;
  z-index: 5;
  animation: highlight-pulse 0.8s ease-in-out infinite;
}

@keyframes highlight-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

.transition-actions {
  pointer-events: all;
}

.action-background {
  transition: all 0.2s;
}

.action-background:hover {
  fill: #f5f7fa;
}

.action-button {
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  transform: scale(1.1);
}

.edit-btn:hover + path {
  fill: #66b1ff;
}

.delete-btn:hover + path {
  stroke: #f78989;
}

.status-panel,
.transition-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafbfc;
}

.panel-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}
</style>