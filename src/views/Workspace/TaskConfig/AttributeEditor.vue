<template>
  <div class="attribute-editor">
    <el-form ref="formRef" :model="localAttribute" label-width="120px" class="attr-form">

      <!-- 基础配置 -->
      <div class="form-section">
        <h6 class="section-title">基础配置</h6>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="属性标签" required>
              <el-input
                  v-model="localAttribute.label"
                  placeholder="显示给用户的标签名"
                  maxlength="50"
                  show-word-limit
              />
              <div class="field-hint">用户在界面上看到的名称</div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="属性键名" required>
              <el-input
                  v-model="localAttribute.key"
                  placeholder="用于存储的字段名"
                  @input="handleKeyInput"
                  maxlength="30"
              />
              <div class="field-hint">只能包含字母、数字和下划线，以字母开头</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="属性类型" required>
          <el-card class="type-selector">
            <div v-for="group in attributeTypeGroups" :key="group.label" class="type-group">
              <div class="group-label">{{ group.label }}</div>
              <div class="type-options">
                <div
                    v-for="type in group.types"
                    :key="type.value"
                    :class="['type-option', { selected: localAttribute.type === type.value }]"
                    @click="handleTypeChange(type.value)"
                >
                  <span class="type-icon">{{ type.icon }}</span>
                  <span class="type-name">{{ type.label }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="是否必填">
              <el-switch v-model="localAttribute.required" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="占位符">
              <el-input
                  v-model="localAttribute.placeholder"
                  placeholder="输入框的提示文字"
                  maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="帮助文本">
          <el-input
              v-model="localAttribute.helpText"
              type="textarea"
              :rows="2"
              placeholder="为用户提供使用说明"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 数值类型配置 -->
      <div v-if="['number', 'currency', 'percentage'].includes(localAttribute.type)" class="form-section">
        <h6 class="section-title">数值配置</h6>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="最小值">
              <el-input-number
                  v-model="localAttribute.validation.min"
                  :precision="2"
                  style="width: 100%"
                  placeholder="最小值"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="最大值">
              <el-input-number
                  v-model="localAttribute.validation.max"
                  :precision="2"
                  style="width: 100%"
                  placeholder="最大值"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="步长">
              <el-input-number
                  v-model="localAttribute.validation.step"
                  :min="0.01"
                  :precision="2"
                  style="width: 100%"
                  placeholder="0.01"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="localAttribute.type === 'currency'" label="货币类型">
          <el-select v-model="localAttribute.config.currency" placeholder="选择货币">
            <el-option label="人民币 (CNY)" value="CNY" />
            <el-option label="美元 (USD)" value="USD" />
            <el-option label="欧元 (EUR)" value="EUR" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 选择类型配置 -->
      <div v-if="['select', 'multiselect', 'radio', 'checkbox'].includes(localAttribute.type)" class="form-section">
        <h6 class="section-title">选项配置</h6>

        <div class="options-config">
          <div class="options-header">
            <el-form-item label="选项列表" style="margin-bottom: 12px;">
              <el-button type="primary" size="small" :icon="Plus" @click="addOption">
                添加选项
              </el-button>
              <el-button
                  v-if="localAttribute.config.options?.length > 0"
                  type="info"
                  size="small"
                  @click="showAdvanced = !showAdvanced"
              >
                {{ showAdvanced ? '隐藏' : '显示' }}高级选项
              </el-button>
            </el-form-item>
          </div>

          <div v-if="localAttribute.config.options?.length > 0" class="options-list">
            <draggable
                v-model="localAttribute.config.options"
                :item-key="(item) => item.value || item.id"
                handle=".option-drag"
                @change="onOptionDrag"
                tag="div"
                class="drag-container"
            >
              <template #item="{ element, index }">
                <div class="option-item" :key="element.value || element.id || `option-${index}`">
                  <div class="option-drag">
                    <el-icon><DCaret /></el-icon>
                  </div>
                  <div class="option-content">
                    <el-input
                        v-model="element.label"
                        placeholder="显示文本"
                        size="small"
                        style="flex: 1;"
                    />
                    <el-input
                        v-model="element.value"
                        placeholder="选项值"
                        size="small"
                        style="flex: 1;"
                        @input="(val) => handleOptionValueInput(element, val)"
                    />
                    <el-color-picker
                        v-if="showAdvanced"
                        v-model="element.color"
                        size="small"
                        show-alpha
                    />
                  </div>
                  <el-button
                      type="text"
                      :icon="Delete"
                      @click="removeOption(index)"
                      :disabled="localAttribute.config.options.length <= 1"
                  />
                </div>
              </template>
            </draggable>
          </div>

          <div v-else class="no-options">
            <p>暂无选项，点击"添加选项"创建</p>
          </div>
        </div>

        <el-row v-if="['multiselect', 'checkbox'].includes(localAttribute.type)" :gutter="16">
          <el-col :span="10">
            <el-form-item label="最多选择">
              <el-input-number
                  v-model="localAttribute.config.maxSelect"
                  :min="1"
                  :max="localAttribute.config.options?.length || 1"
                  style="width: 100%"
                  placeholder="不限制"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 日期类型配置 -->
      <div v-if="['date', 'datetime'].includes(localAttribute.type)" class="form-section">
        <h6 class="section-title">日期配置</h6>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="日期格式">
              <el-select v-model="localAttribute.config.format">
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                <el-option label="MM-DD-YYYY" value="MM-DD-YYYY" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="允许范围">
              <el-switch v-model="localAttribute.config.range" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 文件类型配置 -->
      <div v-if="localAttribute.type === 'file'" class="form-section">
        <h6 class="section-title">文件配置</h6>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="允许类型">
              <el-input
                  v-model="localAttribute.config.accept"
                  placeholder="如: .jpg,.png,.pdf"
              />
              <div class="field-hint">用逗号分隔多个类型，如: .jpg,.png,.pdf</div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="最大大小(MB)">
              <el-input-number
                  v-model="localAttribute.config.maxSize"
                  :min="1"
                  :max="100"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="最大数量">
              <el-input-number
                  v-model="localAttribute.config.maxCount"
                  :min="1"
                  :max="20"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 文本类型配置 -->
      <div v-if="['text', 'textarea', 'url'].includes(localAttribute.type)" class="form-section">
        <h6 class="section-title">文本配置</h6>

        <el-row :gutter="16">
          <el-col :span="10">
            <el-form-item label="最大长度">
              <el-input-number
                  v-model="localAttribute.validation.maxLength"
                  :min="1"
                  :max="5000"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="localAttribute.type === 'textarea'" :span="10">
            <el-form-item label="行数">
              <el-input-number
                  v-model="localAttribute.config.rows"
                  :min="2"
                  :max="10"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 默认值配置 -->
      <div class="form-section">
        <h6 class="section-title">默认值</h6>

        <el-form-item label="默认值">
          <!-- 文本输入 -->
          <el-input
              v-if="['text', 'url'].includes(localAttribute.type)"
              v-model="localAttribute.default"
              placeholder="输入默认值"
          />

          <!-- 多行文本 -->
          <el-input
              v-else-if="localAttribute.type === 'textarea'"
              v-model="localAttribute.default"
              type="textarea"
              :rows="2"
              placeholder="输入默认值"
          />

          <!-- 数字输入 -->
          <el-input-number
              v-else-if="['number', 'currency', 'percentage'].includes(localAttribute.type)"
              v-model="localAttribute.default"
              style="width: 100%"
              placeholder="输入默认值"
          />

          <!-- 单选下拉 -->
          <el-select
              v-else-if="['select', 'radio'].includes(localAttribute.type)"
              v-model="localAttribute.default"
              placeholder="选择默认值"
              style="width: 100%"
          >
            <el-option
                v-for="option in localAttribute.config.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>

          <!-- 多选下拉 -->
          <el-select
              v-else-if="['multiselect', 'checkbox'].includes(localAttribute.type)"
              v-model="localAttribute.default"
              multiple
              placeholder="选择默认值"
              style="width: 100%"
          >
            <el-option
                v-for="option in localAttribute.config.options || []"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>

          <!-- 日期选择 -->
          <el-date-picker
              v-else-if="localAttribute.type === 'date'"
              v-model="localAttribute.default"
              type="date"
              placeholder="选择默认日期"
              style="width: 100%"
          />

          <!-- 日期时间选择 -->
          <el-date-picker
              v-else-if="localAttribute.type === 'datetime'"
              v-model="localAttribute.default"
              type="datetime"
              placeholder="选择默认日期时间"
              style="width: 100%"
          />

          <!-- 其他类型 -->
          <el-input
              v-else
              v-model="localAttribute.default"
              placeholder="输入默认值"
          />
        </el-form-item>
      </div>

    </el-form>

    <!-- 操作按钮 -->
    <div class="editor-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">
        {{ isEditing ? '更新' : '添加' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, DCaret } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

// Props
const props = defineProps({
  attribute: {
    type: Object,
    required: true
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// 响应式数据
const formRef = ref(null)
const localAttribute = ref({})
const showAdvanced = ref(false)

// 计算属性
const needsOptions = computed(() => {
  return ['select', 'multiselect', 'radio', 'checkbox'].includes(localAttribute.value.type || '')
})

const hasValidationOptions = computed(() => {
  return !['user_select', 'agent_select', 'status_select'].includes(localAttribute.value.type || '')
})

// 获取默认配置
const getDefaultConfig = (type) => {
  const configs = {
    'select': { options: [] },
    'multiselect': { options: [] },
    'radio': { options: [] },
    'checkbox': { options: [] },
    'textarea': { rows: 3 },
    'currency': { currency: 'CNY' },
    'date': { format: 'YYYY-MM-DD' },
    'datetime': { format: 'YYYY-MM-DD HH:mm:ss' },
    'file': { accept: '', maxSize: 10, maxCount: 1 }
  }
  return configs[type] || {}
}

// 获取默认验证规则
const getDefaultValidation = (type) => {
  const validations = {
    'text': { maxLength: 255 },
    'textarea': { maxLength: 1000 },
    'url': { maxLength: 500, isUrl: true },
    'number': { min: null, max: null, precision: 0 },
    'currency': { min: 0, max: 999999999, precision: 2 },
    'percentage': { min: 0, max: 100, precision: 2 },
    'file': { fileTypes: '', maxFileSize: 10 }
  }
  return validations[type] || {}
}

// 初始化属性数据
const initializeAttribute = () => {
  console.log('AttributeEditor 初始化，接收到的属性：', props.attribute)

  if (!props.attribute) {
    console.error('AttributeEditor: 没有接收到属性数据')
    localAttribute.value = {
      id: `attr-${Date.now()}`,
      key: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      helpText: '',
      default: '',
      order: 1,
      validation: {},
      config: {},
      display: { width: 'full' }
    }
    return
  }

  // 深拷贝传入的属性
  localAttribute.value = JSON.parse(JSON.stringify(props.attribute))

  // 确保必要的属性存在
  if (!localAttribute.value.config) {
    localAttribute.value.config = getDefaultConfig(localAttribute.value.type)
  }
  if (!localAttribute.value.validation) {
    localAttribute.value.validation = getDefaultValidation(localAttribute.value.type)
  }
  if (!localAttribute.value.display) {
    localAttribute.value.display = { width: 'full' }
  }

  // 确保选项数组中每个选项都有唯一标识
  if (localAttribute.value.config.options && Array.isArray(localAttribute.value.config.options)) {
    localAttribute.value.config.options = localAttribute.value.config.options.map((option, index) => ({
      ...option,
      id: option.id || option.value || `option-${Date.now()}-${index}`,
      value: option.value || `option_${index + 1}`,
      label: option.label || `选项 ${index + 1}`,
      color: option.color || '#409eff'
    }))
  } else if (needsOptions.value && !localAttribute.value.config.options) {
    // 如果是需要选项的类型但没有选项，创建一个默认选项
    localAttribute.value.config.options = [{
      id: `option-${Date.now()}-1`,
      value: 'option_1',
      label: '选项 1',
      color: '#409eff'
    }]
  }

  console.log('AttributeEditor 初始化完成，localAttribute：', localAttribute.value)
}

// 监听外部属性变化
watch(() => props.attribute, (newAttribute, oldAttribute) => {
  console.log('AttributeEditor watch 触发，新属性：', newAttribute, '旧属性：', oldAttribute)
  if (newAttribute) {
    initializeAttribute()
  }
}, { immediate: true, deep: true })

// 属性类型分组
const attributeTypeGroups = ref([
  {
    label: '文本输入',
    types: [
      { label: '单行文本', value: 'text', icon: '📝' },
      { label: '多行文本', value: 'textarea', icon: '📄' },
      { label: '链接', value: 'url', icon: '🔗' }
    ]
  },
  {
    label: '数值输入',
    types: [
      { label: '数字', value: 'number', icon: '🔢' },
      { label: '货币', value: 'currency', icon: '💰' },
      { label: '百分比', value: 'percentage', icon: '📊' }
    ]
  },
  {
    label: '选择输入',
    types: [
      { label: '单选下拉', value: 'select', icon: '📋' },
      { label: '多选下拉', value: 'multiselect', icon: '☑️' },
      { label: '单选按钮', value: 'radio', icon: '🔘' },
      { label: '复选框', value: 'checkbox', icon: '✅' }
    ]
  },
  {
    label: '日期时间',
    types: [
      { label: '日期', value: 'date', icon: '📅' },
      { label: '日期时间', value: 'datetime', icon: '🕐' }
    ]
  },
  {
    label: '其他',
    types: [
      { label: '文件上传', value: 'file', icon: '📎' },
      { label: '用户选择', value: 'user_select', icon: '👤' },
      { label: '智能体选择', value: 'agent_select', icon: '🤖' }
    ]
  }
])

// 处理键名输入
const handleKeyInput = (value) => {
  // 自动清理键名，只保留字母、数字和下划线
  localAttribute.value.key = value
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase()
      .replace(/^[0-9]/, 'attr_$&') // 如果以数字开头，添加前缀
}

// 处理类型变化
const handleTypeChange = (newType) => {
  console.log('类型变化为：', newType)
  localAttribute.value.type = newType

  // 重置类型相关的配置
  localAttribute.value.config = getDefaultConfig(newType)
  localAttribute.value.validation = getDefaultValidation(newType)

  // 重置默认值
  switch (newType) {
    case 'number':
    case 'currency':
    case 'percentage':
      localAttribute.value.default = 0
      break
    case 'checkbox':
    case 'multiselect':
      localAttribute.value.default = []
      break
    default:
      localAttribute.value.default = ''
  }
}

// 添加选项
const addOption = () => {
  if (!localAttribute.value.config.options) {
    localAttribute.value.config.options = []
  }

  const optionCount = localAttribute.value.config.options.length
  const newOption = {
    id: `option-${Date.now()}-${Math.random()}`,
    label: `选项 ${optionCount + 1}`,
    value: `option_${optionCount + 1}`,
    color: '#409eff'
  }

  localAttribute.value.config.options.push(newOption)
}

// 移除选项
const removeOption = (index) => {
  if (localAttribute.value.config.options.length > 1) {
    localAttribute.value.config.options.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留一个选项')
  }
}

// 处理选项值输入
const handleOptionValueInput = (option, value) => {
  // 清理选项值，只保留字母、数字和下划线
  option.value = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
}

// 选项拖拽
const onOptionDrag = () => {
  console.log('选项重新排序')
}

// 保存
const handleSave = () => {
  console.log('准备保存属性：', localAttribute.value)

  // 验证必填字段
  if (!localAttribute.value.label?.trim()) {
    ElMessage.warning('请输入属性标签')
    return
  }

  if (!localAttribute.value.key?.trim()) {
    ElMessage.warning('请输入属性键名')
    return
  }

  // 验证键名格式
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(localAttribute.value.key)) {
    ElMessage.warning('属性键名必须以字母开头，只能包含字母、数字和下划线')
    return
  }

  // 验证选择类型的选项
  if (needsOptions.value) {
    if (!localAttribute.value.config.options || localAttribute.value.config.options.length === 0) {
      ElMessage.warning('请至少添加一个选项')
      return
    }

    // 验证选项值的唯一性
    const optionValues = localAttribute.value.config.options.map(opt => opt.value)
    const uniqueValues = [...new Set(optionValues)]
    if (optionValues.length !== uniqueValues.length) {
      ElMessage.warning('选项值不能重复')
      return
    }

    // 验证选项标签不为空
    const emptyLabels = localAttribute.value.config.options.filter(opt => !opt.label?.trim())
    if (emptyLabels.length > 0) {
      ElMessage.warning('选项标签不能为空')
      return
    }
  }

  console.log('验证通过，发送保存事件')
  emit('save', JSON.parse(JSON.stringify(localAttribute.value)))
}

// 取消
const handleCancel = () => {
  console.log('取消编辑')
  emit('cancel')
}
</script>

<style scoped>
.attribute-editor {
  padding: 24px;
}

.attr-form {
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.field-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}

.type-selector {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.type-group {
  margin-bottom: 16px;
}

.type-group:last-child {
  margin-bottom: 0;
}

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.type-option:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.type-option.selected {
  border-color: #409eff;
  background: #409eff;
  color: white;
}

.type-icon {
  font-size: 16px;
}

.type-name {
  font-size: 13px;
}

.options-config {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.options-header {
  padding: 12px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.options-list {
  max-height: 200px;
  overflow-y: auto;
}

.drag-container {
  min-height: 40px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.option-item:last-child {
  border-bottom: none;
}

.option-drag {
  cursor: move;
  color: #c0c4cc;
  display: flex;
  align-items: center;
}

.option-drag:hover {
  color: #909399;
}

.option-content {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
}

.no-options {
  padding: 40px 20px;
  text-align: center;
  color: #909399;
}

.no-options p {
  margin: 0;
  font-size: 14px;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 24px;
}

/* 滚动条样式 */
.attr-form::-webkit-scrollbar,
.options-list::-webkit-scrollbar {
  width: 6px;
}

.attr-form::-webkit-scrollbar-track,
.options-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.attr-form::-webkit-scrollbar-thumb,
.options-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.attr-form::-webkit-scrollbar-thumb:hover,
.options-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 拖拽样式 */
.sortable-ghost {
  opacity: 0.5;
  background: #e6f4ff;
}

.sortable-chosen {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>