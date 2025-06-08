<template>
  <div class="state-machine">
    <div class="machine-header">
      <h5 class="section-title">状态机设计</h5>
      <p class="section-desc">设计任务的状态流转规则，定义状态节点和转换条件</p>
      <div class="machine-tools">
        <el-button size="small" :icon="Plus" @click="addStatus">添加状态</el-button>
        <el-button size="small" :icon="Connection" @click="toggleConnectMode">
          {{ connectMode ? '退出连接' : '连接模式' }}
        </el-button>
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
            :connecting="connectMode"
            :connect-source="connectSource"
            @select="handleSelectStatus"
            @move="handleMoveStatus"
            @connect="handleConnectStatus"
            @edit="editStatus"
            @delete="deleteStatus"
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
          </defs>

          <path
              v-for="transition in transitionPaths"
              :key="transition.id"
              :d="transition.path"
              :class="[
                'transition-path',
                { 'selected': selectedTransition?.id === transition.id }
              ]"
              :marker-end="selectedTransition?.id === transition.id ? 'url(#arrowhead-active)' : 'url(#arrowhead)'"
              @click="selectTransition(transition)"
          />

          <!-- 临时连接线 -->
          <path
              v-if="tempConnection"
              :d="tempConnection"
              class="temp-connection"
              stroke="#409eff"
              stroke-width="2"
              stroke-dasharray="5,5"
              fill="none"
          />
        </svg>
      </div>
    </div>

    <!-- 状态编辑面板 -->
    <div v-if="selectedStatus" class="status-panel">
      <div class="panel-header">
        <h6>状态配置</h6>
        <el-button type="text" :icon="Close" @click="clearSelection" />
      </div>
      <div class="panel-content">
        <el-form :model="selectedStatus" label-width="80px" size="small">
          <el-form-item label="状态名称" required>
            <el-input v-model="selectedStatus.label" @input="updateStatus" />
          </el-form-item>
          <el-form-item label="状态类型">
            <el-select v-model="selectedStatus.type" @change="updateStatus">
              <el-option label="初始状态" value="initial" />
              <el-option label="普通状态" value="normal" />
              <el-option label="最终状态" value="final" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态颜色">
            <el-color-picker v-model="selectedStatus.color" @change="updateStatus" />
          </el-form-item>
          <el-form-item label="状态描述">
            <el-input
                v-model="selectedStatus.description"
                type="textarea"
                :rows="2"
                @input="updateStatus"
            />
          </el-form-item>
        </el-form>
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
import { Plus, Connection, Refresh, Close } from '@element-plus/icons-vue'
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
const connectMode = ref(false)
const connectSource = ref(null)
const tempConnection = ref('')
const mousePos = ref({ x: 0, y: 0 })

// 状态编辑相关
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

// 监听外部数据变化
watch(() => props.statuses, (newStatuses) => {
  localStatuses.value = [...newStatuses]
}, { deep: true })

watch(() => props.transitions, (newTransitions) => {
  localTransitions.value = [...newTransitions]
}, { deep: true })

// 计算转换路径
const transitionPaths = computed(() => {
  return localTransitions.value.map(transition => {
    const fromStatus = localStatuses.value.find(s => s.key === transition.fromStatus)
    const toStatus = localStatuses.value.find(s => s.key === transition.toStatus)

    if (!fromStatus || !toStatus) return null

    const fromPos = fromStatus.position
    const toPos = toStatus.position

    // 计算节点中心点
    const fromCenter = { x: fromPos.x + 50, y: fromPos.y + 30 }
    const toCenter = { x: toPos.x + 50, y: toPos.y + 30 }

    // 计算连接点（节点边缘）
    const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x)
    const fromEdge = {
      x: fromCenter.x + Math.cos(angle) * 50,
      y: fromCenter.y + Math.sin(angle) * 30
    }
    const toEdge = {
      x: toCenter.x - Math.cos(angle) * 50,
      y: toCenter.y - Math.sin(angle) * 30
    }

    // 生成贝塞尔曲线路径
    const dx = toEdge.x - fromEdge.x
    const dy = toEdge.y - fromEdge.y
    const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5

    const path = `M ${fromEdge.x} ${fromEdge.y}
                  C ${fromEdge.x + controlOffset} ${fromEdge.y},
                    ${toEdge.x - controlOffset} ${toEdge.y},
                    ${toEdge.x} ${toEdge.y}`

    return {
      id: transition.id,
      path,
      transition
    }
  }).filter(Boolean)
})

// 方法
const handleCanvasClick = (event) => {
  if (connectMode.value) return

  clearSelection()
}

const handleMouseMove = (event) => {
  const rect = canvasRef.value.getBoundingClientRect()
  mousePos.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }

  if (connectMode.value && connectSource.value) {
    const sourcePos = connectSource.value.position
    const sourceCenter = { x: sourcePos.x + 50, y: sourcePos.y + 30 }

    tempConnection.value = `M ${sourceCenter.x} ${sourceCenter.y} L ${mousePos.value.x} ${mousePos.value.y}`
  }
}

const handleMouseUp = () => {
  // 处理连接完成
}

const handleSelectStatus = (status) => {
  if (connectMode.value) {
    if (!connectSource.value) {
      connectSource.value = status
    } else {
      handleConnectStatus(status)
    }
  } else {
    selectedStatus.value = status
    selectedTransition.value = null
  }
}

const handleMoveStatus = (status, position) => {
  const index = localStatuses.value.findIndex(s => s.key === status.key)
  if (index > -1) {
    localStatuses.value[index].position = position
    emit('update-statuses', localStatuses.value)
  }
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
    conditions: [],
    actions: [],
    trigger: { type: 'manual' }
  }

  localTransitions.value.push(newTransition)
  emit('update-transitions', localTransitions.value)

  // 重置连接状态
  connectSource.value = null
  tempConnection.value = ''
  connectMode.value = false

  ElMessage.success('转换规则已创建')
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
        `确定要删除状态"${status.label}"吗？相关的转换规则也会被删除。`,
        '确认删除',
        { type: 'warning' }
    )

    // 删除状态
    const statusIndex = localStatuses.value.findIndex(s => s.key === status.key)
    if (statusIndex > -1) {
      localStatuses.value.splice(statusIndex, 1)
    }

    // 删除相关转换
    localTransitions.value = localTransitions.value.filter(t =>
        t.fromStatus !== status.key && t.toStatus !== status.key
    )

    // 清除选择
    if (selectedStatus.value?.key === status.key) {
      selectedStatus.value = null
    }

    emit('update-statuses', localStatuses.value)
    emit('update-transitions', localTransitions.value)

    ElMessage.success('状态已删除')
  } catch {
    // 用户取消删除
  }
}

const saveStatus = () => {
  // 验证
  if (!statusForm.value.label.trim()) {
    ElMessage.warning('请输入状态名称')
    return
  }

  if (!statusForm.value.key.trim()) {
    ElMessage.warning('请输入状态键名')
    return
  }

  // 检查键名唯一性
  const existingKeys = localStatuses.value
      .filter(s => s.key !== editingStatus.value?.key)
      .map(s => s.key)

  if (existingKeys.includes(statusForm.value.key)) {
    ElMessage.error('状态键名已存在')
    return
  }

  if (editingStatus.value) {
    // 编辑现有状态
    const index = localStatuses.value.findIndex(s => s.key === editingStatus.value.key)
    if (index > -1) {
      localStatuses.value[index] = { ...statusForm.value }

      // 更新相关转换的名称
      localTransitions.value.forEach(t => {
        if (t.fromStatus === statusForm.value.key || t.toStatus === statusForm.value.key) {
          const fromStatus = localStatuses.value.find(s => s.key === t.fromStatus)
          const toStatus = localStatuses.value.find(s => s.key === t.toStatus)
          if (fromStatus && toStatus) {
            t.name = `${fromStatus.label} → ${toStatus.label}`
          }
        }
      })
    }
  } else {
    // 添加新状态
    localStatuses.value.push({ ...statusForm.value, order: localStatuses.value.length + 1 })
  }

  emit('update-statuses', localStatuses.value)
  if (localTransitions.value.length > 0) {
    emit('update-transitions', localTransitions.value)
  }

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

const toggleConnectMode = () => {
  connectMode.value = !connectMode.value
  connectSource.value = null
  tempConnection.value = ''
  clearSelection()
}

const autoLayout = () => {
  // 简单的自动布局算法
  const cols = Math.ceil(Math.sqrt(localStatuses.value.length))
  const spacing = { x: 150, y: 100 }
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
  cursor: crosshair;
  overflow: hidden;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.transition-path {
  stroke: #909399;
  stroke-width: 2;
  fill: none;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s;
}

.transition-path:hover,
.transition-path.selected {
  stroke: #409eff;
  stroke-width: 3;
}

.temp-connection {
  pointer-events: none;
}

.status-panel,
.transition-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 280px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.panel-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-content {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

/* 连接模式下的样式 */
.machine-canvas.connecting {
  cursor: crosshair;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .status-panel,
  .transition-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 400px;
    z-index: 1000;
  }
}
</style>