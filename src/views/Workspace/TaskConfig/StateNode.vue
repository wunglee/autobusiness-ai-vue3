<template>
  <div
      :class="[
        'state-node',
        `type-${status.type}`,
        {
          selected: selected,
          connecting: connecting,
          'connect-source': connectSource?.key === status.key
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

    <!-- 连接点 -->
    <div
        v-if="connecting"
        class="connection-points"
    >
      <div class="connect-point left" @click.stop="handleConnect"></div>
      <div class="connect-point right" @click.stop="handleConnect"></div>
      <div class="connect-point top" @click.stop="handleConnect"></div>
      <div class="connect-point bottom" @click.stop="handleConnect"></div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="selected && !connecting" class="node-actions">
      <el-button type="text" size="small" :icon="Edit" @click.stop="handleEdit" />
      <el-button
          type="text"
          size="small"
          :icon="Delete"
          @click.stop="handleDelete"
          :disabled="status.type === 'initial' && isOnlyInitial"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPause, VideoPlay, Operation, Edit, Delete } from '@element-plus/icons-vue'

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
  connecting: {
    type: Boolean,
    default: false
  },
  connectSource: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['select', 'move', 'connect', 'edit', 'delete'])

// 响应式数据
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 计算样式
const nodeStyle = computed(() => ({
  left: `${props.status.position.x}px`,
  top: `${props.status.position.y}px`,
  backgroundColor: props.status.color || '#409eff',
  borderColor: props.selected ? '#409eff' : 'transparent'
}))

// 检查是否是唯一的初始状态
const isOnlyInitial = computed(() => {
  // 这里应该从父组件传入所有状态来判断
  return props.status.type === 'initial'
})

// 方法
const handleMouseDown = (event) => {
  if (props.connecting) return

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true

  const nodeRect = event.currentTarget.getBoundingClientRect()
  const parentRect = event.currentTarget.parentElement.getBoundingClientRect()

  dragOffset.value = {
    x: event.clientX - nodeRect.left,
    y: event.clientY - nodeRect.top
  }

  const handleMouseMove = (e) => {
    if (!isDragging.value) return

    const parentRect = event.currentTarget.parentElement.getBoundingClientRect()
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

    emit('move', props.status, newPosition)
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleClick = (event) => {
  event.stopPropagation()

  if (props.connecting) {
    handleConnect()
  } else {
    emit('select', props.status)
  }
}

const handleConnect = () => {
  if (props.connecting) {
    emit('connect', props.status)
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
</script>

<style scoped>
.state-node {
  position: absolute;
  width: 100px;
  height: 60px;
  border-radius: 8px;
  border: 2px solid transparent;
  color: white;
  cursor: pointer;
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

.state-node.connecting {
  cursor: crosshair;
}

.state-node.connect-source {
  border-color: #67c23a;
  box-shadow: 0 0 0 2px #67c23a, 0 4px 12px rgba(0, 0, 0, 0.2);
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

.connection-points {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.connect-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #409eff;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.connecting .connect-point {
  opacity: 1;
}

.connect-point.left {
  left: 0;
  top: 50%;
}

.connect-point.right {
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
}

.connect-point.top {
  left: 50%;
  top: 0;
}

.connect-point.bottom {
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
}

.connect-point:hover {
  background: #67c23a;
  transform: translate(-50%, -50%) scale(1.2);
}

.node-actions {
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
  gap: 4px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.state-node.selected .node-actions {
  opacity: 1;
}

.node-actions .el-button {
  padding: 4px;
  color: #606266;
}

.node-actions .el-button:hover {
  color: #409eff;
}

/* 不同类型状态的样式变化 */
.type-initial {
  border-style: dashed;
}

.type-final {
  border-width: 3px;
}

/* 拖拽时的样式 */
.state-node:active {
  cursor: grabbing;
  z-index: 10;
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