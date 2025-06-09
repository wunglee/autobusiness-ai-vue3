<template>
  <div
      :class="[
        'state-node',
        `type-${status.type}`,
        {
          selected: selected,
          'dragging': isDragging
        }
      ]"
      :style="nodeStyle"
      @mousedown="handleMouseDown"
      @click="handleClick"
  >
    <!-- 状态图标 -->
    <div class="state-icon">
      <el-icon v-if="status.type === 'initial'"><VideoPause /></el-icon>
      <el-icon v-else-if="status.type === 'final'"><VideoPlay /></el-icon>
      <el-icon v-else><Operation /></el-icon>
    </div>

    <!-- 状态标签 -->
    <div class="state-label">{{ status.label }}</div>

    <!-- 状态类型标识 -->
    <div v-if="status.type !== 'normal'" class="state-type-badge">
      {{ status.type === 'initial' ? '初始' : '最终' }}
    </div>

    <!-- 点击后显示的悬浮操作按钮 -->
    <div v-if="selected" class="floating-actions">
      <el-button
          type="primary"
          size="small"
          :icon="Edit"
          circle
          @click.stop="handleEdit"
          title="编辑状态"
      />
      <el-button
          type="danger"
          size="small"
          :icon="Delete"
          circle
          @click.stop="handleDelete"
          :disabled="status.type === 'initial' && isOnlyInitial"
          title="删除状态"
      />
      <el-button
          type="success"
          size="small"
          :icon="Connection"
          circle
          @mousedown.stop="handleStartConnect"
          title="连接到其他状态"
      />
    </div>

    <!-- 拖拽时的虚框 -->
    <div
        v-if="isDragging"
        class="drag-ghost"
        :style="dragGhostStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPause, VideoPlay, Operation, Edit, Delete, Connection } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  status: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  allStatuses: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['select', 'move', 'edit', 'delete', 'start-connect'])

// 响应式数据
const isDragging = ref(false)
const dragStartPos = ref({ x: 0, y: 0 })
const dragCurrentPos = ref({ x: 0, y: 0 })
const dragOffset = ref({ x: 0, y: 0 })

// 计算样式
const nodeStyle = computed(() => ({
  left: `${props.status.position.x}px`,
  top: `${props.status.position.y}px`,
  backgroundColor: props.status.color || '#409eff',
  borderColor: props.selected ? '#409eff' : 'transparent',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const dragGhostStyle = computed(() => ({
  left: `${dragCurrentPos.value.x}px`,
  top: `${dragCurrentPos.value.y}px`,
  backgroundColor: props.status.color || '#409eff'
}))

// 检查是否是唯一的初始状态
const isOnlyInitial = computed(() => {
  if (props.status.type !== 'initial') return false
  return props.allStatuses.filter(s => s.type === 'initial').length === 1
})

// 方法
const handleMouseDown = (event) => {
  // 如果点击的是操作按钮，不处理拖拽
  if (event.target.closest('.floating-actions')) return

  event.preventDefault()
  event.stopPropagation()

  // 开始拖拽
  isDragging.value = true

  // 记录拖拽开始位置
  dragStartPos.value = { ...props.status.position }
  dragCurrentPos.value = { ...props.status.position }

  const nodeRect = event.currentTarget.getBoundingClientRect()
  const parentRect = event.currentTarget.parentElement.getBoundingClientRect()

  // 计算鼠标在节点内的偏移
  dragOffset.value = {
    x: event.clientX - nodeRect.left,
    y: event.clientY - nodeRect.top
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return

    const parentRect = event.currentTarget.parentElement.getBoundingClientRect()

    // 计算新的位置
    const newPosition = {
      x: Math.max(0, Math.min(
          e.clientX - parentRect.left - dragOffset.value.x,
          parentRect.width - 100
      )),
      y: Math.max(0, Math.min(
          e.clientY - parentRect.top - dragOffset.value.y,
          parentRect.height - 60
      ))
    }

    // 更新虚框位置
    dragCurrentPos.value = newPosition
  }

  const handleMouseUp = () => {
    if (!isDragging.value) return

    // 检查并处理位置冲突
    const finalPosition = checkAndResolveConflicts(dragCurrentPos.value)

    // 更新实际位置
    emit('move', props.status, finalPosition)

    // 结束拖拽
    isDragging.value = false

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const checkAndResolveConflicts = (newPosition) => {
  // 检查与其他状态节点的冲突
  const conflicts = props.allStatuses.filter(s => {
    if (s.key === props.status.key) return false

    const distance = Math.sqrt(
        Math.pow(s.position.x - newPosition.x, 2) +
        Math.pow(s.position.y - newPosition.y, 2)
    )

    return distance < 120 // 如果距离小于120像素则认为冲突
  })

  if (conflicts.length > 0) {
    // 自动调整冲突节点的位置
    conflicts.forEach((conflict, index) => {
      const angle = (index * 90) * (Math.PI / 180) // 每个冲突节点偏移不同角度
      const offsetDistance = 150

      conflict.position.x = newPosition.x + Math.cos(angle) * offsetDistance
      conflict.position.y = newPosition.y + Math.sin(angle) * offsetDistance

      // 确保不超出边界
      conflict.position.x = Math.max(0, Math.min(conflict.position.x, 800))
      conflict.position.y = Math.max(0, Math.min(conflict.position.y, 600))
    })

    // 通知父组件更新冲突节点
    emit('resolve-conflicts', conflicts)

    ElMessage.success('已自动调整重叠节点位置')
  }

  return newPosition
}

const handleClick = (event) => {
  event.stopPropagation()

  // 如果不是在拖拽，则选中状态
  if (!isDragging.value) {
    emit('select', props.status)
  }
}

const handleEdit = () => {
  emit('edit', props.status)
}

const handleDelete = () => {
  if (props.status.type === 'initial' && isOnlyInitial.value) {
    ElMessage.warning('至少需要保留一个初始状态')
    return
  }

  emit('delete', props.status)
}

const handleStartConnect = (event) => {
  event.preventDefault()
  event.stopPropagation()

  // 开始连接模式
  emit('start-connect', props.status, event)
}
</script>

<style scoped>
.state-node {
  position: absolute;
  width: 100px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid transparent;
  color: white;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 2;
}

.state-node:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.state-node.selected {
  border-color: #fff;
  box-shadow: 0 0 0 2px #409eff, 0 4px 12px rgba(0, 0, 0, 0.2);
}

.state-node.dragging {
  z-index: 10;
  opacity: 0.7;
}

.state-icon {
  font-size: 16px;
  opacity: 0.9;
}

.state-label {
  font-weight: 500;
  text-align: center;
  line-height: 1;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.state-type-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f56c6c;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.type-initial .state-type-badge {
  background: #67c23a;
}

.floating-actions {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  z-index: 10;
  animation: fadeInUp 0.3s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.floating-actions .el-button {
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  font-size: 14px;
  transition: all 0.2s;
}

.floating-actions .el-button:hover {
  transform: scale(1.1);
}

.drag-ghost {
  position: absolute;
  width: 100px;
  height: 60px;
  border: 2px dashed #409eff;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.2);
  pointer-events: none;
  z-index: 1;
  animation: ghostPulse 1s ease-in-out infinite;
}

@keyframes ghostPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
}

/* 不同类型状态的样式变化 */
.type-initial {
  border-style: dashed;
}

.type-final {
  border-width: 3px;
}

/* 禁用状态的样式 */
.state-node.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.state-node.disabled:hover {
  transform: none;
}
</style>