<template>
  <div class="attribute-editor">
    <el-form :model="localAttribute" label-width="120px" class="attr-form">
      <!-- 基础信息 -->
      <div class="form-section">
        <h6 class="section-title">基础信息</h6>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="属性标签" required>
              <el-input
                  v-model="localAttribute.label"
                  placeholder="显示名称，如：优先级"
                  maxlength="20"
                  show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="属性键名" required>
              <el-input
                  v-model="localAttribute.key"
                  placeholder="英文字段名，如：priority"
                  @input="handleKeyInput"
              />
              <div class="field-hint">只能包含字母、数字和下划线</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="属性类型" required>
              <el-select
                  v-model="localAttribute.type"
                  placeholder="选择类型"
                  @change="handleTypeChange"
              >
                <el-option-group
                    v-for="group in attributeTypeGroups"
                    :key="group.label"
                    :label="group.label"
                >
                  <el-option
                      v-for="type in group.types"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                  >
                    <span>{{ type.icon }} {{ type.label }}</span>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示宽度">
              <el-radio-group v-model="localAttribute.display.width">
                <el-radio label="full">整行</el-radio>
                <el-radio label="half">半行</el-radio>
                <el-radio label="third">三分之一</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="localAttribute.required">必填字段</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="localAttribute.readonly">只读字段</el-checkbox>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item>
              <el-checkbox v-model="showAdvanced">高级设置</el-checkbox>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="帮助说明">
          <el-input
              v-model="localAttribute.helpText"
              placeholder="为用户提供填写说明"
              maxlength="100"
              show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 类型特定配置 -->
      <div class="form-section">
        <h6 class="section-title">类型配置</h6>

        <!-- 文本类型配置 -->
        <template v-if="['text', 'textarea'].includes(localAttribute.type)">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="占位符">
                <el-input v-model="localAttribute.placeholder" placeholder="请输入..." />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大长度">
                <el-input-number
                    v-model="localAttribute.validation.maxLength"
                    :min="1"
                    :max="1000"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item v-if="localAttribute.type === 'textarea'" label="行数">
            <el-input-number
                v-model="localAttribute.config.rows"
                :min="2"
                :max="10"
                style="width: 120px"
            />
          </el-form-item>
        </template>

        <!-- 数字类型配置 -->
        <template v-if="['number', 'currency', 'percentage'].includes(localAttribute.type)">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="最小值">
                <el-input-number
                    v-model="localAttribute.validation.min"
                    :precision="2"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大值">
                <el-input-number
                    v-model="localAttribute.validation.max"
                    :precision="2"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="步长">
                <el-input-number
                    v-model="localAttribute.validation.step"
                    :min="0.01"
                    :precision="2"
                    style="width: 100%"
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
        </template>

        <!-- 选择类型配置 -->
        <template v-if="['select', 'multiselect', 'radio', 'checkbox'].includes(localAttribute.type)">
          <div class="options-config">
            <div class="options-header">
              <el-form-item label="选项列表" style="margin-bottom: 12px;">
                <el-button type="primary" size="small" :icon="Plus" @click="addOption">
                  添加选项
                </el-button>
              </el-form-item>
            </div>

            <div v-if="localAttribute.config.options?.length > 0" class="options-list">
              <draggable
                  v-model="localAttribute.config.options"
                  item-key="value"
                  handle=".option-drag"
              >
                <template #item="{ element, index }">
                  <div class="option-item">
                    <div class="option-drag">
                      <el-icon><DCaret /></el-icon>
                    </div>
                    <div class="option-content">
                      <el-input
                          v-model="element.label"
                          placeholder="显示文本"
                          size="small"
                      />
                      <el-input
                          v-model="element.value"
                          placeholder="选项值"
                          size="small"
                      />
                      <el-color-picker
                          v-if="showAdvanced"
                          v-model="element.color"
                          size="small"
                      />
                    </div>
                    <el-button
                        type="text"
                        :icon="Delete"
                        @click="removeOption(index)"
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
            <el-col :span="12">
              <el-form-item label="最多选择">
                <el-input-number
                    v-model="localAttribute.config.maxSelect"
                    :min="1"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 日期类型配置 -->
        <template v-if="['date', 'datetime'].includes(localAttribute.type)">
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="日期格式">
                <el-select v-model="localAttribute.config.format">
                  <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                  <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                  <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最早日期">
                <el-date-picker
                    v-model="localAttribute.validation.minDate"
                    type="date"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最晚日期">
                <el-date-picker
                    v-model="localAttribute.validation.maxDate"
                    type="date"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 文件类型配置 -->
        <template v-if="localAttribute.type === 'file'">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="允许类型">
                <el-input
                    v-model="localAttribute.config.accept"
                    placeholder="如: .jpg,.png,.pdf"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大大小(MB)">
                <el-input-number
                    v-model="localAttribute.config.maxSize"
                    :min="1"
                    :max="100"
                    style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </div>

      <!-- 默认值设置 -->
      <div v-if="showAdvanced" class="form-section">
        <h6 class="section-title">默认值</h6>
        <el-form-item label="默认值">
          <component
              :is="getDefaultValueComponent()"
              v-model="localAttribute.default"
              v-bind="getDefaultValueProps()"
          />
        </el-form-item>
      </div>
    </el-form>

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
const localAttribute = ref(JSON.parse(JSON.stringify(props.attribute)))
const showAdvanced = ref(false)

// 监听外部属性变化
watch(() => props.attribute, (newAttr) => {
  localAttribute.value = JSON.parse(JSON.stringify(newAttr))
}, { deep: true })

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

// 方法
const handleKeyInput = (value) => {
  // 自动清理键名，只保留字母、数字和下划线
  localAttribute.value.key = value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
}

const handleTypeChange = (newType) => {
  // 重置类型特定配置
  localAttribute.value.config = getDefaultConfig(newType)
  localAttribute.value.validation = getDefaultValidation(newType)
  localAttribute.value.default = getDefaultValue(newType)
}

const getDefaultConfig = (type) => {
  switch (type) {
    case 'textarea':
      return { rows: 3 }
    case 'select':
    case 'multiselect':
    case 'radio':
    case 'checkbox':
      return { options: [] }
    case 'currency':
      return { currency: 'CNY' }
    case 'date':
    case 'datetime':
      return { format: 'YYYY-MM-DD' }
    case 'file':
      return { accept: '', maxSize: 10, maxCount: 1 }
    default:
      return {}
  }
}

const getDefaultValidation = (type) => {
  switch (type) {
    case 'text':
    case 'textarea':
      return { maxLength: 100 }
    case 'number':
    case 'currency':
    case 'percentage':
      return { min: 0, max: 1000, step: 1 }
    default:
      return {}
  }
}

const getDefaultValue = (type) => {
  switch (type) {
    case 'number':
    case 'currency':
    case 'percentage':
      return 0
    case 'checkbox':
    case 'multiselect':
      return []
    default:
      return ''
  }
}

const addOption = () => {
  if (!localAttribute.value.config.options) {
    localAttribute.value.config.options = []
  }

  const optionCount = localAttribute.value.config.options.length
  localAttribute.value.config.options.push({
    label: `选项 ${optionCount + 1}`,
    value: `option_${optionCount + 1}`,
    color: '#409eff'
  })
}

const removeOption = (index) => {
  localAttribute.value.config.options.splice(index, 1)
}

const getDefaultValueComponent = () => {
  switch (localAttribute.value.type) {
    case 'textarea':
      return 'el-input'
    case 'number':
    case 'currency':
    case 'percentage':
      return 'el-input-number'
    case 'select':
    case 'radio':
      return 'el-select'
    case 'multiselect':
    case 'checkbox':
      return 'el-select'
    case 'date':
    case 'datetime':
      return 'el-date-picker'
    default:
      return 'el-input'
  }
}

const getDefaultValueProps = () => {
  switch (localAttribute.value.type) {
    case 'textarea':
      return { type: 'textarea', rows: 2 }
    case 'multiselect':
    case 'checkbox':
      return { multiple: true }
    case 'date':
      return { type: 'date' }
    case 'datetime':
      return { type: 'datetime' }
    default:
      return {}
  }
}

const handleSave = () => {
  // 验证必填字段
  if (!localAttribute.value.label.trim()) {
    ElMessage.warning('请输入属性标签')
    return
  }

  if (!localAttribute.value.key.trim()) {
    ElMessage.warning('请输入属性键名')
    return
  }

  // 验证键名格式
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(localAttribute.value.key)) {
    ElMessage.warning('属性键名必须以字母开头，只能包含字母、数字和下划线')
    return
  }

  // 验证选择类型的选项
  if (['select', 'multiselect', 'radio', 'checkbox'].includes(localAttribute.value.type)) {
    if (!localAttribute.value.config.options || localAttribute.value.config.options.length === 0) {
      ElMessage.warning('请至少添加一个选项')
      return
    }
  }

  emit('save', localAttribute.value)
}

const handleCancel = () => {
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
</style>