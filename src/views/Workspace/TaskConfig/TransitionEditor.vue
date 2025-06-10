<template>
  <div class="transition-editor">
    <div class="editor-header">
      <h6>{{ transition.name }}</h6>
      <el-tag size="small" type="info">
        {{ fromStatus?.label }} → {{ toStatus?.label }}
      </el-tag>
    </div>

    <div class="editor-content">
      <!-- 基本信息 -->
      <div class="form-section">
        <h6 class="section-title">基本信息</h6>
        <el-form :model="localTransition" label-width="80px" size="small">
          <el-form-item label="转换名称">
            <el-input
                v-model="localTransition.name"
                placeholder="请输入转换名称"
                @input="handleChange"
            />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
                v-model="localTransition.description"
                type="textarea"
                :rows="2"
                placeholder="请描述此转换的用途"
                @input="handleChange"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 配置触发器 -->
      <div class="form-section">
        <div class="section-header">
          <h6 class="section-title">配置触发器</h6>
          <p class="section-desc">选择预设的触发器类型并配置具体参数</p>
          <el-button
              size="small"
              type="primary"
              :icon="Plus"
              @click="addTriggerInstance"
          >
            添加配置
          </el-button>
        </div>

        <div v-if="localTransition.triggerInstances && localTransition.triggerInstances.length > 0" class="trigger-instances">
          <div
              v-for="(instance, index) in localTransition.triggerInstances"
              :key="index"
              class="trigger-instance"
          >
            <div class="instance-header">
              <div class="instance-info">
                <el-tag :type="getTriggerTypeColor(instance.triggerType)" size="small">
                  {{ getTriggerTypeName(instance.triggerType) }}
                </el-tag>
                <span class="instance-name">{{ instance.name }}</span>
                <el-tag v-if="!instance.enabled" size="small" type="info">已禁用</el-tag>
              </div>
              <div class="instance-actions">
                <el-button
                    size="small"
                    :icon="Edit"
                    @click="editTriggerInstance(index)"
                    title="编辑配置"
                />
                <el-button
                    size="small"
                    type="danger"
                    :icon="Delete"
                    @click="deleteTriggerInstance(index)"
                    title="删除配置"
                />
              </div>
            </div>

            <div class="instance-details">
              <div class="trigger-conditions">
                <h6>触发条件</h6>
                <div v-if="instance.conditions && instance.conditions.length > 0" class="conditions-list">
                  <div
                      v-for="(condition, condIndex) in instance.conditions"
                      :key="condIndex"
                      class="condition-item"
                  >
                    <el-tag size="small" effect="plain">
                      {{ getAttributeLabel(condition.attribute) }}
                    </el-tag>
                    <span class="operator">{{ getOperatorSymbol(condition.operator) }}</span>
                    <el-tag size="small" type="success">{{ condition.value }}</el-tag>
                  </div>
                </div>
                <div v-else class="no-conditions">
                  <el-text type="info" size="small">无触发条件 - 自动触发</el-text>
                </div>
              </div>

              <div class="execution-config">
                <el-form label-width="80px" size="small">
                  <el-form-item label="执行时机">
                    <el-select v-model="instance.executionTiming" @change="handleChange">
                      <el-option label="立即执行" value="immediate" />
                      <el-option label="延迟执行" value="delayed" />
                      <el-option label="定时执行" value="scheduled" />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                      v-if="instance.executionTiming === 'delayed'"
                      label="延迟时间"
                  >
                    <el-input-number
                        v-model="instance.delayMinutes"
                        :min="1"
                        :max="1440"
                        @change="handleChange"
                    />
                    <span style="margin-left: 8px;">分钟</span>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-instances">
          <el-empty
              description="暂无触发器配置"
              :image-size="60"
          >
            <el-button type="primary" :icon="Plus" @click="addTriggerInstance">
              添加第一个触发器配置
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <el-button @click="$emit('delete', transition.id)" type="danger" plain>
        删除转换
      </el-button>
      <el-button type="primary" @click="saveTransition">
        保存更改
      </el-button>
    </div>

    <!-- 触发器配置对话框 -->
    <el-dialog
        v-model="showInstanceDialog"
        :title="editingInstanceIndex !== null ? '编辑触发器配置' : '配置触发器'"
        width="700px"
    >
      <div class="instance-editor">
        <el-form :model="instanceForm" label-width="120px">
          <el-form-item label="配置名称" required>
            <el-input v-model="instanceForm.name" placeholder="请输入触发器配置名称" />
          </el-form-item>

          <el-form-item label="候选触发器" required>
            <div class="trigger-selector">
              <el-checkbox-group v-model="instanceForm.selectedTriggers">
                <div class="trigger-options">
                  <div
                      v-for="trigger in availableTriggers"
                      :key="trigger.id"
                      class="trigger-option"
                  >
                    <el-checkbox :label="trigger.id">
                      <div class="trigger-card">
                        <div class="trigger-header">
                          <span class="trigger-icon">{{ trigger.icon }}</span>
                          <span class="trigger-name">{{ trigger.name }}</span>
                          <el-tag
                              :type="getTriggerCategoryColor(trigger.category)"
                              size="small"
                              effect="plain"
                          >
                            {{ getCategoryName(trigger.category) }}
                          </el-tag>
                        </div>
                        <div class="trigger-description">
                          {{ trigger.description }}
                        </div>
                      </div>
                    </el-checkbox>
                  </div>
                </div>
              </el-checkbox-group>
            </div>
          </el-form-item>

          <el-form-item label="是否启用">
            <el-switch v-model="instanceForm.enabled" />
          </el-form-item>

          <el-form-item label="条件逻辑">
            <el-radio-group v-model="instanceForm.logicOperator">
              <el-radio label="AND">所有条件都满足 (AND)</el-radio>
              <el-radio label="OR">任一条件满足 (OR)</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="触发条件">
            <div class="conditions-builder">
              <el-alert
                  title="提示"
                  description="条件基于前一个状态的属性值进行判断，可以添加多个条件进行组合"
                  type="info"
                  :closable="false"
                  style="margin-bottom: 16px;"
              />

              <div
                  v-for="(condition, index) in instanceForm.conditions"
                  :key="index"
                  class="condition-builder-item"
              >
                <el-select
                    v-model="condition.attribute"
                    placeholder="选择属性"
                    style="width: 140px;"
                >
                  <el-option
                      v-for="attr in fromStateAttributes"
                      :key="attr.key"
                      :label="attr.label"
                      :value="attr.key"
                  />
                </el-select>

                <el-select
                    v-model="condition.operator"
                    placeholder="操作符"
                    style="width: 100px;"
                >
                  <el-option label="等于" value="eq" />
                  <el-option label="不等于" value="ne" />
                  <el-option label="大于" value="gt" />
                  <el-option label="小于" value="lt" />
                  <el-option label="大于等于" value="gte" />
                  <el-option label="小于等于" value="lte" />
                  <el-option label="包含" value="contains" />
                  <el-option label="不包含" value="not_contains" />
                  <el-option label="为空" value="empty" />
                  <el-option label="不为空" value="not_empty" />
                </el-select>

                <el-input
                    v-model="condition.value"
                    placeholder="值"
                    style="width: 120px;"
                />

                <el-button
                    type="danger"
                    :icon="Delete"
                    @click="removeCondition(index)"
                    title="删除条件"
                />
              </div>

              <el-button
                  type="primary"
                  :icon="Plus"
                  @click="addCondition"
                  plain
                  size="small"
              >
                添加条件
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="执行时机">
            <el-select v-model="instanceForm.executionTiming">
              <el-option label="立即执行" value="immediate" />
              <el-option label="延迟执行" value="delayed" />
              <el-option label="定时执行" value="scheduled" />
            </el-select>
          </el-form-item>

          <el-form-item
              v-if="instanceForm.executionTiming === 'delayed'"
              label="延迟时间"
          >
            <el-input-number
                v-model="instanceForm.delayMinutes"
                :min="1"
                :max="1440"
            />
            <span style="margin-left: 8px;">分钟</span>
          </el-form-item>

          <el-form-item label="配置描述">
            <el-input
                v-model="instanceForm.description"
                type="textarea"
                :rows="3"
                placeholder="请描述触发器配置的作用和条件"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showInstanceDialog = false">取消</el-button>
        <el-button type="primary" @click="saveTriggerInstance">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  transition: {
    type: Object,
    required: true
  },
  statuses: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update', 'delete'])

// 响应式数据
const localTransition = ref({
  ...props.transition,
  triggerInstances: props.transition.triggerInstances || []
})

const showInstanceDialog = ref(false)
const editingInstanceIndex = ref(null)
const instanceForm = ref({
  name: '',
  selectedTriggers: [],
  enabled: true,
  logicOperator: 'AND',
  conditions: [],
  executionTiming: 'immediate',
  delayMinutes: 5,
  description: ''
})

// 可选择的触发器类型（从TriggerManagement.vue中预设的触发器）
const availableTriggers = ref([
  {
    id: 1,
    name: '定时触发器',
    description: '基于时间间隔或特定时间点触发状态迁移',
    category: 'time',
    icon: '⏰',
    enabled: true
  },
  {
    id: 2,
    name: '事件触发器',
    description: '响应特定事件触发状态迁移',
    category: 'event',
    icon: '⚡',
    enabled: true
  },
  {
    id: 3,
    name: '条件触发器',
    description: '基于状态属性条件判断触发状态迁移',
    category: 'condition',
    icon: '🎯',
    enabled: true
  }
])

// 计算属性
const fromStatus = computed(() =>
    props.statuses.find(s => s.key === props.transition.fromStatus)
)

const toStatus = computed(() =>
    props.statuses.find(s => s.key === props.transition.toStatus)
)

// 前一个状态的属性（这里模拟常见的任务属性）
const fromStateAttributes = computed(() => {
  return [
    { key: 'priority', label: '优先级' },
    { key: 'assignee', label: '负责人' },
    { key: 'progress', label: '进度百分比' },
    { key: 'created_at', label: '创建时间' },
    { key: 'updated_at', label: '更新时间' },
    { key: 'due_date', label: '截止日期' },
    { key: 'tags', label: '标签' },
    { key: 'category', label: '分类' },
    { key: 'estimated_hours', label: '预估工时' },
    { key: 'actual_hours', label: '实际工时' },
    { key: 'completion_rate', label: '完成率' },
    { key: 'quality_score', label: '质量评分' }
  ]
})

// 监听props变化
watch(() => props.transition, (newTransition) => {
  localTransition.value = {
    ...newTransition,
    triggerInstances: newTransition.triggerInstances || []
  }
}, { deep: true })

// 方法
const handleChange = () => {
  emit('update', localTransition.value)
}

const getTriggerTypeName = (type) => {
  const typeNames = {
    condition: '条件触发',
    time: '时间触发',
    event: '事件触发',
    manual: '手动触发'
  }
  return typeNames[type] || type
}

const getTriggerTypeColor = (type) => {
  const typeColors = {
    condition: 'warning',
    time: 'success',
    event: 'primary',
    manual: 'info'
  }
  return typeColors[type] || 'info'
}

const getCategoryName = (category) => {
  const names = {
    'time': '时间类',
    'event': '事件类',
    'condition': '条件类',
    'custom': '自定义'
  }
  return names[category] || category
}

const getTriggerCategoryColor = (category) => {
  const colors = {
    'time': 'success',
    'event': 'primary',
    'condition': 'warning',
    'custom': 'info'
  }
  return colors[category] || 'info'
}

const getAttributeLabel = (attributeKey) => {
  const attribute = fromStateAttributes.value.find(attr => attr.key === attributeKey)
  return attribute ? attribute.label : attributeKey
}

const getOperatorSymbol = (operator) => {
  const symbols = {
    eq: '等于',
    ne: '不等于',
    gt: '大于',
    lt: '小于',
    gte: '大于等于',
    lte: '小于等于',
    contains: '包含',
    not_contains: '不包含',
    empty: '为空',
    not_empty: '不为空'
  }
  return symbols[operator] || operator
}

const addTriggerInstance = () => {
  editingInstanceIndex.value = null
  instanceForm.value = {
    name: '',
    selectedTriggers: [],
    enabled: true,
    logicOperator: 'AND',
    conditions: [],
    executionTiming: 'immediate',
    delayMinutes: 5,
    description: ''
  }
  showInstanceDialog.value = true
}

const editTriggerInstance = (index) => {
  editingInstanceIndex.value = index
  instanceForm.value = { ...localTransition.value.triggerInstances[index] }
  // 确保条件数组存在
  if (!instanceForm.value.conditions) {
    instanceForm.value.conditions = []
  }
  // 确保选中的触发器数组存在
  if (!instanceForm.value.selectedTriggers) {
    instanceForm.value.selectedTriggers = []
  }
  showInstanceDialog.value = true
}

const deleteTriggerInstance = async (index) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这个触发器配置吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    localTransition.value.triggerInstances.splice(index, 1)
    handleChange()
    ElMessage.success('触发器配置已删除')
  } catch {
    // 用户取消删除
  }
}

const saveTriggerInstance = () => {
  if (!instanceForm.value.name.trim()) {
    ElMessage.error('请输入触发器配置名称')
    return
  }

  if (instanceForm.value.selectedTriggers.length === 0) {
    ElMessage.error('请至少选择一个候选触发器')
    return
  }

  if (editingInstanceIndex.value !== null) {
    // 编辑现有配置
    localTransition.value.triggerInstances[editingInstanceIndex.value] = { ...instanceForm.value }
  } else {
    // 添加新配置
    localTransition.value.triggerInstances.push({ ...instanceForm.value })
  }

  handleChange()
  showInstanceDialog.value = false
  ElMessage.success(editingInstanceIndex.value !== null ? '触发器配置已更新' : '触发器配置已添加')
}

const addCondition = () => {
  instanceForm.value.conditions.push({
    attribute: '',
    operator: 'eq',
    value: ''
  })
}

const removeCondition = (index) => {
  instanceForm.value.conditions.splice(index, 1)
}

const saveTransition = () => {
  emit('update', localTransition.value)
  ElMessage.success('转换规则已保存')
}
</script>

<style scoped>
.transition-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.editor-header h6 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 12px;
}

.section-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-desc {
  margin: 0 0 12px 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.trigger-instances {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.trigger-instance {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.trigger-instance:last-child {
  border-bottom: none;
}

.instance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.instance-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.instance-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.instance-actions {
  display: flex;
  gap: 4px;
}

.instance-details {
  background: #fafbfc;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
}

.trigger-conditions h6 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.conditions-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.operator {
  font-size: 12px;
  color: #909399;
}

.no-conditions {
  color: #909399;
  font-size: 12px;
  font-style: italic;
  margin-bottom: 12px;
}

.execution-config {
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
}

.empty-instances {
  padding: 40px;
  text-align: center;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 20px;
}

.instance-editor {
  padding: 0 4px;
}

.trigger-selector {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background: #fafbfc;
  max-height: 300px;
  overflow-y: auto;
}

.trigger-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trigger-option {
  width: 100%;
}

.trigger-card {
  padding: 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-left: 8px;
  transition: all 0.2s;
}

.trigger-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.trigger-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.trigger-icon {
  font-size: 16px;
}

.trigger-name {
  font-weight: 500;
  color: #303133;
}

.trigger-description {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.conditions-builder {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  background: #fafbfc;
}

.condition-builder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.condition-builder-item:last-child {
  margin-bottom: 0;
}

/* 滚动条样式 */
.editor-content::-webkit-scrollbar,
.trigger-selector::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track,
.trigger-selector::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb,
.trigger-selector::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover,
.trigger-selector::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>