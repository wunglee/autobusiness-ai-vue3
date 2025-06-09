<template>
  <div class="attribute-builder">
    <div class="builder-header">
      <h5 class="section-title">自定义属性定义</h5>
      <p class="section-desc">为任务类型定义自定义属性，系统会自动包含基础属性（标题、描述、负责人等）</p>
    </div>

    <div class="system-attributes">
      <h6 class="subsection-title">系统属性（自动包含）</h6>
      <div class="sys-attr-grid">
        <div v-for="attr in systemAttributes" :key="attr.key" class="sys-attr-item">
          <span class="attr-icon">{{ attr.icon }}</span>
          <span class="attr-name">{{ attr.label }}</span>
          <el-tag size="small" :type="attr.required ? 'danger' : 'info'">
            {{ attr.required ? '必填' : '可选' }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="custom-attributes">
      <div class="custom-header">
        <h6 class="subsection-title">自定义属性</h6>
        <el-button type="primary" size="small" :icon="Plus" @click="showAddDialog">
          添加属性
        </el-button>
      </div>

      <div v-if="localAttributes.length > 0" class="attributes-list">
        <draggable
            v-model="localAttributes"
            :item-key="(item) => item.key || item.id"
            handle=".drag-handle"
            @change="handleOrderChange"
            tag="div"
            class="drag-container"
        >
          <template #item="{ element, index }">
            <div class="attr-item" :key="element.key || element.id || `attr-${index}`">
              <div class="drag-handle">
                <el-icon><DCaret /></el-icon>
              </div>

              <div class="attr-info">
                <div class="attr-header">
                  <span class="attr-name">{{ element.label }}</span>
                  <div class="attr-tags">
                    <el-tag size="small" :type="getTypeColor(element.type)">
                      {{ getTypeName(element.type) }}
                    </el-tag>
                    <el-tag v-if="element.required" size="small" type="danger">必填</el-tag>
                  </div>
                </div>
                <div class="attr-details">
                  <span class="attr-key">字段名: {{ element.key }}</span>
                  <span v-if="element.placeholder" class="attr-placeholder">
                    占位符: {{ element.placeholder }}
                  </span>
                  <span v-if="element.default" class="attr-default">
                    默认值: {{ element.default }}
                  </span>
                </div>
                <div v-if="element.config?.options" class="attr-options">
                  <span class="options-label">选项:</span>
                  <el-tag
                      v-for="option in element.config.options.slice(0, 3)"
                      :key="option.value || option.label"
                      size="small"
                      effect="plain"
                  >
                    {{ option.label }}
                  </el-tag>
                  <span v-if="element.config.options.length > 3" class="more-options">
                    ...等{{ element.config.options.length }}个选项
                  </span>
                </div>
              </div>

              <div class="attr-actions">
                <el-button type="text" :icon="Edit" @click="editAttribute(index)" />
                <el-button type="text" :icon="Delete" @click="deleteAttribute(index)" />
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <div v-else class="empty-attributes">
        <el-icon size="48"><DocumentAdd /></el-icon>
        <p>暂无自定义属性</p>
        <p class="empty-desc">点击"添加属性"按钮创建第一个自定义属性</p>
      </div>
    </div>

    <!-- 属性编辑对话框 -->
    <el-dialog
        v-model="showDialog"
        :title="isEditing ? '编辑属性' : '添加属性'"
        width="700px"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @close="resetForm"
    >
      <AttributeEditor
          v-if="showDialog && currentAttribute"
          :key="`attr-editor-${dialogKey}`"
          :attribute="currentAttribute"
          :is-editing="isEditing"
          @save="handleSaveAttribute"
          @cancel="handleCancelEdit"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, DCaret, DocumentAdd } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import AttributeEditor from './AttributeEditor.vue'

// Props
const props = defineProps({
  attributes: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update'])

// 响应式数据
const localAttributes = ref([])
const showDialog = ref(false)
const isEditing = ref(false)
const editingIndex = ref(-1)
const currentAttribute = ref(null)
const dialogKey = ref(0)

// 初始化数据并确保每个属性都有唯一标识
const initializeAttributes = () => {
  localAttributes.value = props.attributes.map((attr, index) => ({
    ...attr,
    id: attr.id || attr.key || `attr-${Date.now()}-${index}`,
    key: attr.key || `attr-${Date.now()}-${index}`
  }))
}

// 监听外部属性变化
watch(() => props.attributes, () => {
  initializeAttributes()
}, { deep: true, immediate: true })

// 系统属性定义
const systemAttributes = ref([
  { key: 'title', label: '任务标题', type: 'text', required: true, icon: '📝' },
  { key: 'description', label: '任务描述', type: 'textarea', required: true, icon: '📄' },
  { key: 'assignee', label: '负责智能体', type: 'agent_select', required: true, icon: '🤖' },
  { key: 'status', label: '任务状态', type: 'status_select', required: true, icon: '🔄' },
  { key: 'budget', label: '预算', type: 'currency', required: false, icon: '💰' },
  { key: 'remainingBudget', label: '剩余预算', type: 'currency', required: false, icon: '💳' },
  { key: 'progress', label: '完成进度', type: 'percentage', required: false, icon: '📊' },
  { key: 'logs', label: '历史日志', type: 'logs', required: true, icon: '📋' }
])

// 属性类型映射
const attributeTypes = {
  text: { name: '单行文本', color: '' },
  textarea: { name: '多行文本', color: 'info' },
  number: { name: '数字', color: 'warning' },
  currency: { name: '货币', color: 'success' },
  percentage: { name: '百分比', color: 'primary' },
  date: { name: '日期', color: 'info' },
  datetime: { name: '日期时间', color: 'info' },
  select: { name: '单选下拉', color: 'warning' },
  multiselect: { name: '多选下拉', color: 'warning' },
  radio: { name: '单选按钮', color: 'primary' },
  checkbox: { name: '复选框', color: 'primary' },
  file: { name: '文件上传', color: 'danger' },
  url: { name: '链接', color: 'info' },
  user_select: { name: '用户选择', color: 'success' },
  agent_select: { name: '智能体选择', color: 'success' }
}

// 方法
const getTypeName = (type) => {
  return attributeTypes[type]?.name || type
}

const getTypeColor = (type) => {
  return attributeTypes[type]?.color || ''
}

// 创建完整的默认属性结构
const createCompleteAttribute = (baseAttr = {}) => {
  const newId = `attr-${Date.now()}-${Math.random()}`

  // 确保所有必要的属性都存在
  const attribute = {
    id: baseAttr.id || newId,
    key: baseAttr.key || '',
    label: baseAttr.label || '',
    type: baseAttr.type || 'text',
    required: baseAttr.required || false,
    placeholder: baseAttr.placeholder || '',
    helpText: baseAttr.helpText || '',
    default: baseAttr.default || '',
    order: baseAttr.order || localAttributes.value.length + 1,
    validation: baseAttr.validation || {},
    config: baseAttr.config || {},
    display: baseAttr.display || { width: 'full' }
  }

  // 根据类型设置默认配置
  if (['select', 'multiselect', 'radio', 'checkbox'].includes(attribute.type)) {
    if (!attribute.config.options) {
      attribute.config.options = []
    }
  }

  return attribute
}

// 重置所有状态
const resetAllState = () => {
  console.log('重置所有状态')
  currentAttribute.value = null
  isEditing.value = false
  editingIndex.value = -1
  showDialog.value = false
}

const showAddDialog = () => {
  console.log('显示添加对话框')

  // 完全重置状态
  resetAllState()

  // 设置添加状态
  isEditing.value = false
  editingIndex.value = -1
  currentAttribute.value = createCompleteAttribute()

  console.log('创建的新属性：', currentAttribute.value)

  // 使用 nextTick 确保状态完全更新
  nextTick(() => {
    dialogKey.value++
    showDialog.value = true
    console.log('添加对话框已打开，dialogKey:', dialogKey.value)
  })
}

const editAttribute = (index) => {
  console.log('编辑属性，索引：', index, '数据：', localAttributes.value[index])

  // 完全重置状态
  resetAllState()

  // 确保索引有效
  if (index < 0 || index >= localAttributes.value.length) {
    console.error('编辑索引无效：', index)
    ElMessage.error('无法编辑：属性索引无效')
    return
  }

  const originalAttr = localAttributes.value[index]
  if (!originalAttr) {
    console.error('原始属性不存在')
    ElMessage.error('无法编辑：属性数据不存在')
    return
  }

  // 设置编辑状态
  isEditing.value = true
  editingIndex.value = index

  // 深拷贝并确保完整结构
  currentAttribute.value = createCompleteAttribute(originalAttr)

  console.log('编辑的属性：', currentAttribute.value)

  // 使用 nextTick 确保状态完全更新
  nextTick(() => {
    dialogKey.value++
    showDialog.value = true
    console.log('编辑对话框已打开，dialogKey:', dialogKey.value)
  })
}

const deleteAttribute = async (index) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除属性"${localAttributes.value[index].label}"吗？`,
        '确认删除',
        { type: 'warning' }
    )

    localAttributes.value.splice(index, 1)
    updateOrder()
    emit('update', localAttributes.value)
    ElMessage.success('属性已删除')
  } catch {
    // 用户取消删除
  }
}

const handleSaveAttribute = (attribute) => {
  console.log('保存属性：', attribute)

  if (!attribute) {
    ElMessage.error('保存失败：属性数据为空')
    return
  }

  // 验证属性键名唯一性
  const existingKeys = localAttributes.value
      .filter((_, index) => index !== editingIndex.value)
      .map(attr => attr.key)

  if (existingKeys.includes(attribute.key)) {
    ElMessage.error('属性键名已存在，请使用其他名称')
    return
  }

  // 检查系统属性冲突
  const systemKeys = systemAttributes.value.map(attr => attr.key)
  if (systemKeys.includes(attribute.key)) {
    ElMessage.error('不能使用系统保留的属性键名')
    return
  }

  // 确保属性有唯一标识
  if (!attribute.id) {
    attribute.id = attribute.key || `attr-${Date.now()}-${Math.random()}`
  }

  // 保存属性
  if (isEditing.value && editingIndex.value >= 0) {
    console.log('更新属性，索引：', editingIndex.value)
    localAttributes.value[editingIndex.value] = attribute
  } else {
    console.log('添加新属性')
    localAttributes.value.push(attribute)
  }

  updateOrder()
  emit('update', localAttributes.value)

  // 关闭对话框并重置状态
  const message = isEditing.value ? '属性已更新' : '属性已添加'
  resetAllState()
  ElMessage.success(message)
}

const handleCancelEdit = () => {
  console.log('取消编辑')
  resetAllState()
}

const handleOrderChange = () => {
  updateOrder()
  emit('update', localAttributes.value)
}

const updateOrder = () => {
  localAttributes.value.forEach((attr, index) => {
    attr.order = index + 1
  })
}

// 对话框关闭时的处理
const resetForm = () => {
  console.log('对话框关闭，重置表单')
  // 延迟重置，确保对话框完全关闭
  nextTick(() => {
    resetAllState()
  })
}

// 组件挂载时初始化
onMounted(() => {
  initializeAttributes()
})
</script>

<style scoped>
.attribute-builder {
  max-width: 1000px;
}

.builder-header {
  margin-bottom: 24px;
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
  margin: 0;
  line-height: 1.5;
}

.system-attributes {
  margin-bottom: 32px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin: 0 0 12px 0;
}

.sys-attr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.sys-attr-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.attr-icon {
  font-size: 16px;
}

.attr-name {
  flex: 1;
  font-size: 14px;
  color: #495057;
}

.custom-attributes {
  margin-bottom: 24px;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.attributes-list {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.drag-container {
  min-height: 50px;
}

.attr-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
  transition: all 0.2s;
}

.attr-item:last-child {
  border-bottom: none;
}

.attr-item:hover {
  background: #fafbfc;
}

.drag-handle {
  cursor: move;
  color: #c0c4cc;
  display: flex;
  align-items: center;
  padding: 4px;
}

.drag-handle:hover {
  color: #909399;
}

.attr-info {
  flex: 1;
  min-width: 0;
}

.attr-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.attr-header .attr-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.attr-tags {
  display: flex;
  gap: 6px;
}

.attr-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #909399;
}

.attr-key {
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.attr-options {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.options-label {
  font-size: 13px;
  color: #909399;
}

.more-options {
  font-size: 12px;
  color: #c0c4cc;
}

.attr-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.attr-item:hover .attr-actions {
  opacity: 1;
}

.empty-attributes {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
  text-align: center;
}

.empty-attributes p {
  margin: 12px 0 4px 0;
  font-size: 16px;
}

.empty-desc {
  margin: 0;
  font-size: 14px;
  color: #c0c4cc;
}

/* 拖拽排序样式 */
.sortable-ghost {
  opacity: 0.5;
  background: #e6f4ff;
}

.sortable-chosen {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 对话框样式调整 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-dialog__body) {
  padding: 0;
}
</style>