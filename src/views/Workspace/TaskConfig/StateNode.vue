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
      ref="nodeRef"
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
        v-show="isDragging"
        class="drag-ghost"
        :style="dragGhostStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
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
const emit = defineEmits(['select', 'move', 'edit', 'delete', 'start-connect', 'resolve-conflicts'])

// 响应式数据
const isDragging = ref(false)
const nodeRef = ref(null)
const dragGhostStyle = ref({
  left: '0px',
  top: '0px',
  display: 'none'
})

// 存储拖拽相关数据
let dragData = null

// 计算样式
const nodeStyle = computed(() => ({
  left: `${props.status.position.x}px`,
  top: `${props.status.position.y}px`,
  backgroundColor: props.status.color || '#409eff',
  borderColor: props.selected ? '#409eff' : 'transparent',
  cursor: isDragging.value ? 'grabbing' : 'grab',
  zIndex: isDragging.value ? 100 : 10
}))

// 检查是否是唯一的初始状态
const isOnlyInitial = computed(() => {
  if (props.status.type !== 'initial') return false
  return props.allStatuses.filter(s => s.type === 'initial').length === 1
})

// 清理事件监听
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})

// 冲突检测方法（在释放时调用）
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

      // 确保不超出边界（使用实际画布尺寸）
      const canvasWidth = dragData?.canvasRect?.width || 800
      const canvasHeight = dragData?.canvasRect?.height || 600

      conflict.position.x = Math.max(0, Math.min(conflict.position.x, canvasWidth - 100))
      conflict.position.y = Math.max(0, Math.min(conflict.position.y, canvasHeight - 60))
    })

    // 通知父组件更新冲突节点
    emit('resolve-conflicts', conflicts)

    ElMessage.success('已自动调整重叠节点位置')
  }
}

// 拖拽事件处理
const handleMouseMove = (e) => {
  if (!isDragging.value || !dragData) return

  // 计算鼠标移动距离（相对于起始点）
  const deltaX = e.clientX - dragData.startMouseX
  const deltaY = e.clientY - dragData.startMouseY

  // 计算虚框的新位置：初始位置 + 位移
  const ghostX = dragData.startGhostX + deltaX
  const ghostY = dragData.startGhostY + deltaY

  // 确保位置在画布范围内
  const clampedX = Math.max(0, Math.min(ghostX, dragData.canvasRect.width - 100))
  const clampedY = Math.max(0, Math.min(ghostY, dragData.canvasRect.height - 60))

  // 更新虚框位置
  dragGhostStyle.value = {
    left: `${clampedX}px`,
    top: `${clampedY}px`,
    backgroundColor: props.status.color + '80' || '#409eff80',
    border: `2px dashed ${props.status.color || '#409eff'}`,
    display: 'block'
  }
}

const handleMouseUp = (e) => {
  if (!isDragging.value || !dragData) return

  // 结束拖拽
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 计算最终位置
  const deltaX = e.clientX - dragData.startMouseX
  const deltaY = e.clientY - dragData.startMouseY
  const ghostX = dragData.startGhostX + deltaX
  const ghostY = dragData.startGhostY + deltaY

  const finalPosition = {
    x: Math.max(0, Math.min(ghostX, dragData.canvasRect.width - 100)),
    y: Math.max(0, Math.min(ghostY, dragData.canvasRect.height - 60))
  }

  // 更新实际位置
  emit('move', props.status, finalPosition)

  // 在释放时进行冲突处理
  checkAndResolveConflicts(finalPosition)

  // 隐藏虚框
  dragGhostStyle.value.display = 'none'

  // 清除拖拽数据
  dragData = null
}

const handleMouseDown = (event) => {
  // 如果点击的是操作按钮，不处理拖拽
  if (event.target.closest('.floating-actions')) return

  event.preventDefault()
  event.stopPropagation()

  // 开始拖拽
  isDragging.value = true

  // 获取画布容器的位置
  const canvas = nodeRef.value.parentElement
  const canvasRect = canvas.getBoundingClientRect()

  // 获取节点的实际位置（通过DOM）
  const nodeRect = nodeRef.value.getBoundingClientRect()
  const ghostX = nodeRect.left - canvasRect.left
  const ghostY = nodeRect.top - canvasRect.top

  // 记录拖拽数据
  dragData = {
    canvasRect: {
      left: canvasRect.left,
      top: canvasRect.top,
      width: canvasRect.width,
      height: canvasRect.height
    },
    startMouseX: event.clientX,
    startMouseY: event.clientY,
    startGhostX: ghostX,
    startGhostY: ghostY
  }

  // 设置虚框初始位置（使用节点在画布中的实际位置）
  dragGhostStyle.value = {
    left: `${ghostX}px`,
    top: `${ghostY}px`,
    backgroundColor: props.status.color + '80' || '#409eff80',
    border: `2px dashed ${props.status.color || '#409eff'}`,
    display: 'block'
  }

  // 添加全局事件监听
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 10;
  transition: border-color 0.2s, z-index 0.2s;
}

.state-node.type-initial {
  background-color: #e6f7ff !important;
}

.state-node.type-final {
  background-color: #f6ffed !important;
}

.state-node.selected {
  border-color: #409eff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
}

.state-node.dragging {
  opacity: 0.7;
  z-index: 100;
}

.state-icon {
  margin-bottom: 4px;
  font-size: 20px;
}

.state-label {
  font-size: 14px;
  font-weight: bold;
  text-align: center;
}

.state-type-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #f56c6c;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.floating-actions {
  position: absolute;
  top: -40px;
  display: flex;
  gap: 5px;
  background: white;
  padding: 4px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.drag-ghost {
  position: absolute;
  width: 100px;
  height: 60px;
  border-radius: 8px;
  z-index: 1000;
  pointer-events: none;
  opacity: 0.8;
}
</style>