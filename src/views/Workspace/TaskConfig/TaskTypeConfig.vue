<template>
  <el-dialog
      v-model="visible"
      title="任务类型配置"
      width="1200px"
      :close-on-click-modal="false"
      class="task-type-config-dialog"
      @close="onClose"
  >
    <div class="config-layout">
      <!-- 左侧任务类型列表 -->
      <div class="type-list-panel">
        <TypeList
            :types="taskTypes"
            :current-type-id="currentTypeId"
            @select="handleSelectType"
            @create="handleCreateType"
            @delete="handleDeleteType"
            @duplicate="handleDuplicateType"
        />
      </div>

      <!-- 右侧配置面板 -->
      <div class="config-panel">
        <TypeEditor
            v-if="currentType"
            :type="currentType"
            :all-types="taskTypes"
            @update="handleUpdateType"
            @save="handleSaveType"
        />
        <div v-else class="empty-state">
          <el-icon size="64"><Setting /></el-icon>
          <p>请选择或创建一个任务类型</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSaveAll" :loading="saving">
          保存所有配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import TypeList from './TypeList.vue'
import TypeEditor from './TypeEditor.vue'

// Props
const props = defineProps({
  modelValue: Boolean
})

// Emits
const emit = defineEmits(['update:modelValue', 'save'])

// 响应式数据
const visible = ref(props.modelValue)
const saving = ref(false)
const currentTypeId = ref(null)

// 监听弹窗显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadTaskTypes()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 任务类型数据
const taskTypes = ref([
  {
    id: '1',
    name: '需求任务',
    icon: '📋',
    description: '用于管理和跟踪产品需求的任务类型，包含需求分析、评估和验收等环节。',
    color: '#409eff',
    isSystemType: false,
    isActive: true,

    // 自定义属性
    attributes: [
      {
        key: 'priority',
        label: '优先级',
        type: 'select',
        required: true,
        order: 1,
        config: {
          options: [
            { label: '高', value: 'high', color: '#f56c6c' },
            { label: '中', value: 'medium', color: '#e6a23c' },
            { label: '低', value: 'low', color: '#67c23a' }
          ]
        },
        default: 'medium'
      },
      {
        key: 'source',
        label: '需求来源',
        type: 'text',
        required: false,
        order: 2,
        placeholder: '请输入需求来源',
        validation: { maxLength: 100 }
      },
      {
        key: 'acceptance',
        label: '验收标准',
        type: 'textarea',
        required: true,
        order: 3,
        placeholder: '请详细描述验收标准',
        validation: { maxLength: 500 }
      }
    ],

    // 状态定义
    statuses: [
      { key: 'pending', label: '待分析', color: '#909399', order: 1, type: 'initial', position: { x: 50, y: 50 } },
      { key: 'analyzing', label: '分析中', color: '#e6a23c', order: 2, type: 'normal', position: { x: 200, y: 50 } },
      { key: 'designing', label: '设计中', color: '#409eff', order: 3, type: 'normal', position: { x: 350, y: 50 } },
      { key: 'reviewing', label: '待评审', color: '#f56c6c', order: 4, type: 'normal', position: { x: 500, y: 50 } },
      { key: 'completed', label: '已完成', color: '#67c23a', order: 5, type: 'final', position: { x: 300, y: 150 } }
    ],

    // 状态转换规则
    transitions: [
      {
        id: 't1',
        name: '开始分析',
        fromStatus: 'pending',
        toStatus: 'analyzing',
        conditions: [],
        actions: []
      },
      {
        id: 't2',
        name: '进入设计',
        fromStatus: 'analyzing',
        toStatus: 'designing',
        conditions: [
          { field: 'acceptance', operator: 'not_empty', value: '', valueType: 'static' }
        ],
        actions: []
      },
      {
        id: 't3',
        name: '提交评审',
        fromStatus: 'designing',
        toStatus: 'reviewing',
        conditions: [],
        actions: []
      },
      {
        id: 't4',
        name: '评审通过',
        fromStatus: 'reviewing',
        toStatus: 'completed',
        conditions: [],
        actions: [
          { type: 'setAttribute', params: { field: 'progress', value: 100 } }
        ]
      }
    ],

    // 合法的子任务类型
    allowedChildTypes: ['design', 'development'],

    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: '设计任务',
    icon: '🎨',
    description: 'UI/UX设计任务，包含原型设计、视觉设计等环节。',
    color: '#67c23a',
    isSystemType: false,
    isActive: true,

    attributes: [
      {
        key: 'design_type',
        label: '设计类型',
        type: 'radio',
        required: true,
        order: 1,
        config: {
          options: [
            { label: 'UI设计', value: 'ui' },
            { label: 'UX设计', value: 'ux' },
            { label: '原型设计', value: 'prototype' }
          ]
        }
      },
      {
        key: 'tools',
        label: '设计工具',
        type: 'multiselect',
        required: false,
        order: 2,
        config: {
          options: [
            { label: 'Figma', value: 'figma' },
            { label: 'Sketch', value: 'sketch' },
            { label: 'Adobe XD', value: 'xd' },
            { label: 'Photoshop', value: 'ps' }
          ]
        }
      }
    ],

    statuses: [
      { key: 'draft', label: '草稿', color: '#909399', order: 1, type: 'initial', position: { x: 50, y: 50 } },
      { key: 'designing', label: '设计中', color: '#409eff', order: 2, type: 'normal', position: { x: 200, y: 50 } },
      { key: 'review', label: '待审核', color: '#e6a23c', order: 3, type: 'normal', position: { x: 350, y: 50 } },
      { key: 'approved', label: '已通过', color: '#67c23a', order: 4, type: 'final', position: { x: 200, y: 150 } }
    ],

    transitions: [
      {
        id: 't5',
        name: '开始设计',
        fromStatus: 'draft',
        toStatus: 'designing',
        conditions: [],
        actions: []
      },
      {
        id: 't6',
        name: '提交审核',
        fromStatus: 'designing',
        toStatus: 'review',
        conditions: [],
        actions: []
      },
      {
        id: 't7',
        name: '审核通过',
        fromStatus: 'review',
        toStatus: 'approved',
        conditions: [],
        actions: []
      }
    ],

    allowedChildTypes: [],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date()
  }
])

// 计算当前选中的任务类型
const currentType = computed(() => {
  return taskTypes.value.find(type => type.id === currentTypeId.value) || null
})

// 方法
const loadTaskTypes = () => {
  // 模拟加载数据
  if (taskTypes.value.length > 0 && !currentTypeId.value) {
    currentTypeId.value = taskTypes.value[0].id
  }
}

const handleSelectType = (typeId) => {
  currentTypeId.value = typeId
}

// 创建新任务类型
const handleCreateType = () => {
  const newType = {
    id: Date.now().toString(),
    name: '新任务类型',
    icon: '📝',
    description: '',
    color: '#409eff',
    isSystemType: false,
    isActive: true,
    attributes: [],
    statuses: [
      { key: 'todo', label: '待办', color: '#909399', order: 1, type: 'initial', position: { x: 50, y: 50 } },
      { key: 'done', label: '完成', color: '#67c23a', order: 2, type: 'final', position: { x: 200, y: 50 } }
    ],
    transitions: [
      {
        id: `t_${Date.now()}`,
        name: '完成任务',
        fromStatus: 'todo',
        toStatus: 'done',
        conditions: [],
        actions: []
      }
    ],
    allowedChildTypes: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  taskTypes.value.push(newType)
  currentTypeId.value = newType.id
  ElMessage.success('新任务类型已创建')
}

// 复制任务类型
const handleDuplicateType = (typeId) => {
  const originalType = taskTypes.value.find(type => type.id === typeId)
  if (originalType) {
    const duplicatedType = {
      ...JSON.parse(JSON.stringify(originalType)),
      id: Date.now().toString(),
      name: `${originalType.name} (副本)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    taskTypes.value.push(duplicatedType)
    currentTypeId.value = duplicatedType.id
    ElMessage.success('任务类型已复制')
  }
}
const handleDeleteType = async (typeId) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这个任务类型吗？删除后不可恢复。',
        '确认删除',
        { type: 'warning' }
    )

    const index = taskTypes.value.findIndex(type => type.id === typeId)
    if (index > -1) {
      taskTypes.value.splice(index, 1)

      // 如果删除的是当前选中的类型，选择下一个
      if (currentTypeId.value === typeId) {
        currentTypeId.value = taskTypes.value[0]?.id || null
      }

      ElMessage.success('任务类型已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const handleUpdateType = (updatedType) => {
  const index = taskTypes.value.findIndex(type => type.id === updatedType.id)
  if (index > -1) {
    taskTypes.value[index] = { ...updatedType, updatedAt: new Date() }
  }
}

const handleSaveType = () => {
  ElMessage.success('任务类型已保存')
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要重置所有配置吗？未保存的更改将丢失。',
        '确认重置',
        { type: 'warning' }
    )

    // 重新加载初始数据
    loadTaskTypes()
    ElMessage.success('配置已重置')
  } catch {
    // 用户取消重置
  }
}

const handleSaveAll = async () => {
  saving.value = true

  try {
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('save', taskTypes.value)
    ElMessage.success('所有配置已保存')
    onClose()
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

const onClose = () => {
  visible.value = false
}
</script>

<style scoped>
.task-type-config-dialog {
  --el-dialog-bg-color: #fff;
  border-radius: 8px;
}

.config-layout {
  display: flex;
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.type-list-panel {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  background: #fafbfc;
}

.config-panel {
  flex: 1;
  background: white;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.empty-state p {
  margin-top: 16px;
  font-size: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
}
</style>