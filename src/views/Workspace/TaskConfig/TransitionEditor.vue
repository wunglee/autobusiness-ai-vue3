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

      <!-- 触发器实例配置 -->
      <div class="form-section">
        <div class="section-header">
          <h6 class="section-title">触发器实例</h6>
          <p class="section-desc">配置多个触发器实例，每个实例基于前一个状态的属性值进行条件判断</p>
          <el-button
              size="small"
              type="primary"
              :icon="Plus"
              @click="addTriggerInstance"
          >
            添加实例
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
                <span class="instance-name">{{ instance.name || `触发器实例 ${index + 1}` }}</span>
                <el-switch
                    v-model="instance.enabled"
                    size="small"
                    active-text="启用"
                    inactive-text="禁用"
                    @change="handleChange"
                />
              </div>
              <div class="instance-actions">
                <el-button
                    type="text"
                    size="small"
                    :icon="Edit"
                    @click="editTriggerInstance(index)"
                />
                <el-button
                    type="text"
                    size="small"
                    :icon="Delete"
                    @click="deleteTriggerInstance(index)"
                />
              </div>
            </div>

            <div class="instance-details">
              <div class="trigger-conditions">
                <h6>触发条件 (基于状态"{{ fromStatus?.label }}"的属性)</h6>
                <div v-if="instance.conditions && instance.conditions.length > 0" class="conditions-list">
                  <div
                      v-for="(condition, condIndex) in instance.conditions"
                      :key="condIndex"
                      class="condition-item"
                  >
                    <el-tag size="small" effect="plain">
                      {{ getAttributeLabel(condition.attribute) }}
                      {{ getOperatorSymbol(condition.operator) }}
                      "{{ condition.value }}"
                    </el-tag>
                    <el-tag
                        v-if="condIndex < instance.conditions.length - 1"
                        size="small"
                        type="info"
                        effect="plain"
                    >
                      {{ instance.logicOperator || 'AND' }}
                    </el-tag>
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
              description="暂无触发器实例"
              :image-size="60"
          >
            <el-button type="primary" :icon="Plus" @click="addTriggerInstance">
              添加第一个触发器实例
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

    <!-- 触发器实例编辑对话框 -->
    <el-dialog
        v-model="showInstanceDialog"
        :title="editingInstanceIndex !== null ? '编辑触发器实例' : '添加触发器实例'"
        width="700px"
    >
      <div class="instance-editor">
        <el-form :model="instanceForm" label-width="100px">
          <el-form-item label="实例名称" required>
            <el-input v-model="instanceForm.name" placeholder="请输入触发器实例名称" />
          </el-form-item>

          <el-form-item label="触发器类型" required>
            <el-select v-model="instanceForm.triggerType" placeholder="选择触发器类型">
              <el-option label="条件触发" value="condition" />
              <el-option label="时间触发" value="time" />
              <el-option label="事件触发" value="event" />
              <el-option label="手动触发" value="manual" />
            </el-select>
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
                    style="width: 140px"
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
                    placeholder="运算符"
                    style="width: 100px"
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
                    placeholder="预期值"
                    style="flex: 1"
                />

                <el-button
                    type="text"
                    :icon="Delete"
                    @click="removeCondition(index)"
                />
              </div>

              <el-button
                  type="text"
                  :icon="Plus"
                  @click="addCondition"
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

          <el-form-item label="实例描述">
            <el-input
                v-model="instanceForm.description"
                type="textarea"
                :rows="3"
                placeholder="请描述触发器实例的作用和条件"
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
  triggerType: 'condition',
  enabled: true,
  logicOperator: 'AND',
  conditions: [],
  executionTiming: 'immediate',
  delayMinutes: 5,
  description: ''
})

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
    triggerType: 'condition',
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
  showInstanceDialog.value = true
}

const deleteTriggerInstance = async (index) => {
  try {
    await ElMessageBox.confirm(
        '确定要删除这个触发器实例吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )

    localTransition.value.triggerInstances.splice(index, 1)
    handleChange()
    ElMessage.success('触发器实例已删除')
  } catch {
    // 用户取消删除
  }
}

const saveTriggerInstance = () => {
  if (!instanceForm.value.name.trim()) {
    ElMessage.error('请输入触发器实例名称')
    return
  }

  if (editingInstanceIndex.value !== null) {
    // 编辑现有实例
    localTransition.value.triggerInstances[editingInstanceIndex.value] = { ...instanceForm.value }
  } else {
    // 添加新实例
    localTransition.value.triggerInstances.push({ ...instanceForm.value })
  }

  handleChange()
  showInstanceDialog.value = false
  ElMessage.success(editingInstanceIndex.value !== null ? '触发器实例已更新' : '触发器实例已添加')
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
.editor-content::-webkit-scrollbar {
  width: 6px;
}

.editor-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.editor-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>