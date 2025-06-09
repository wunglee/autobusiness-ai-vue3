<template>
  <div class="type-editor">
    <div class="editor-header">
      <div class="type-info">
        <span class="type-icon" :style="{ background: localType.color }">
          {{ localType.icon }}
        </span>
        <div>
          <h3 class="type-name">{{ localType.name }}</h3>
          <p class="type-status">
            <el-tag :type="localType.isActive ? 'success' : 'info'" size="small">
              {{ localType.isActive ? '已启用' : '已禁用' }}
            </el-tag>
            <span class="update-time">
              最后修改：{{ formatDate(localType.updatedAt) }}
            </span>
          </p>
        </div>
      </div>
      <div class="editor-actions">
        <el-button size="small" @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" size="small" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="config-tabs" type="border-card">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <div class="tab-content">
          <el-form :model="localType" label-width="100px" class="basic-form">
            <div class="form-section">
              <h5 class="section-title">基本信息</h5>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="类型名称" required>
                    <el-input
                        v-model="localType.name"
                        placeholder="请输入任务类型名称"
                        maxlength="50"
                        show-word-limit
                        @input="handleChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="类型图标">
                    <div class="icon-input">
                      <el-input
                          v-model="localType.icon"
                          placeholder="选择图标"
                          @input="handleChange"
                      />
                      <el-button @click="showIconPicker">选择</el-button>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="主题色">
                    <el-color-picker
                        v-model="localType.color"
                        @change="handleChange"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="状态">
                    <el-switch
                        v-model="localType.isActive"
                        active-text="启用"
                        inactive-text="禁用"
                        @change="handleChange"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="类型描述">
                <el-input
                    v-model="localType.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入任务类型的详细描述"
                    maxlength="200"
                    show-word-limit
                    @input="handleChange"
                />
              </el-form-item>
            </div>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 属性定义 -->
      <el-tab-pane label="属性定义" name="attributes">
        <div class="tab-content">
          <AttributeBuilder
              :attributes="localType.attributes"
              @update="handleAttributesUpdate"
          />
        </div>
      </el-tab-pane>

      <!-- 状态机 -->
      <el-tab-pane label="状态机" name="stateMachine">
        <div class="tab-content">
          <StateMachine
              :statuses="localType.statuses"
              :transitions="localType.transitions"
              @update-statuses="handleStatusesUpdate"
              @update-transitions="handleTransitionsUpdate"
          />
        </div>
      </el-tab-pane>

      <!-- 子任务限制 -->
      <el-tab-pane label="子任务限制" name="childTypes">
        <div class="tab-content">
          <div class="form-section">
            <h5 class="section-title">允许的子任务类型</h5>
            <p class="section-desc">设置此任务类型可以包含哪些子任务类型</p>

            <div class="child-types-config">
              <el-checkbox-group v-model="localType.allowedChildTypes" @change="handleChange">
                <div class="child-type-grid">
                  <el-checkbox
                      v-for="childType in availableChildTypes"
                      :key="childType.id"
                      :label="childType.id"
                      :disabled="childType.id === localType.id"
                  >
                    <div class="child-type-option">
                      <span class="child-icon">{{ childType.icon }}</span>
                      <span class="child-name">{{ childType.name }}</span>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>

              <div v-if="localType.allowedChildTypes.length === 0" class="no-child-types">
                <el-icon><InfoFilled /></el-icon>
                <span>此任务类型不允许创建子任务</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 图标选择器对话框 -->
    <el-dialog v-model="showIconDialog" title="选择图标" width="600px">
      <div class="icon-picker">
        <div class="icon-grid">
          <div
              v-for="icon in iconList"
              :key="icon"
              :class="['icon-item', { selected: icon === localType.icon }]"
              @click="selectIcon(icon)"
          >
            {{ icon }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showIconDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmIconSelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { View, Check, InfoFilled } from '@element-plus/icons-vue'
import AttributeBuilder from './AttributeBuilder.vue'
import StateMachine from './StateMachine.vue'

// Props
const props = defineProps({
  type: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update', 'save'])

// 响应式数据
const activeTab = ref('basic')
const localType = ref(JSON.parse(JSON.stringify(props.type)))
const showIconDialog = ref(false)
const selectedIcon = ref('')

// 监听外部类型变化
watch(() => props.type, (newType) => {
  localType.value = JSON.parse(JSON.stringify(newType))
}, { deep: true })

// 图标列表
const iconList = ref([
  '📋', '📝', '📄', '📊', '📈', '📉', '🎯', '🎨', '💡', '🔧',
  '⚙️', '🛠️', '🔨', '📐', '📏', '🖥️', '💻', '📱', '⌚', '🖱️',
  '⌨️', '🖨️', '💾', '💿', '📀', '💽', '💰', '💳', '💎', '🏆',
  '🎖️', '🏅', '🥇', '🥈', '🥉', '🎪', '🎭', '🎨', '🎬', '🎤',
  '🎧', '🎵', '🎶', '🎸', '🎹', '🎺', '🎻', '🎲', '🎯', '🎳'
])

// 可用的子任务类型（模拟数据）
const availableChildTypes = ref([
  { id: '1', name: '需求任务', icon: '📋' },
  { id: '2', name: '设计任务', icon: '🎨' },
  { id: '3', name: '开发任务', icon: '💻' },
  { id: '4', name: '测试任务', icon: '🧪' },
  { id: '5', name: '部署任务', icon: '🚀' }
])

// 方法
const handleChange = () => {
  emit('update', localType.value)
}

const handleAttributesUpdate = (attributes) => {
  localType.value.attributes = attributes
  handleChange()
}

const handleStatusesUpdate = (statuses) => {
  localType.value.statuses = statuses
  handleChange()
}

const handleTransitionsUpdate = (transitions) => {
  localType.value.transitions = transitions
  handleChange()
}

const handleSave = () => {
  // 验证必填字段
  if (!localType.value.name.trim()) {
    ElMessage.warning('请输入任务类型名称')
    return
  }

  if (!localType.value.statuses || localType.value.statuses.length === 0) {
    ElMessage.warning('请至少定义一个状态')
    return
  }

  // 检查是否有初始状态和最终状态
  const hasInitial = localType.value.statuses.some(s => s.type === 'initial')
  const hasFinal = localType.value.statuses.some(s => s.type === 'final')

  if (!hasInitial) {
    ElMessage.warning('请至少定义一个初始状态')
    return
  }

  if (!hasFinal) {
    ElMessage.warning('请至少定义一个最终状态')
    return
  }

  emit('save', localType.value)
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const showIconPicker = () => {
  selectedIcon.value = localType.value.icon
  showIconDialog.value = true
}

const selectIcon = (icon) => {
  selectedIcon.value = icon
}

const confirmIconSelection = () => {
  localType.value.icon = selectedIcon.value
  showIconDialog.value = false
  handleChange()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped>
.type-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.type-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.type-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.type-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.update-time {
  font-size: 12px;
  color: #909399;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.config-tabs {
  flex: 1;
  flex-direction: row-reverse;
  overflow: hidden;
}

.config-tabs :deep(.el-tabs__content) {
  height: calc(100% - 40px);
  overflow: hidden;
}

.config-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

.tab-content {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-desc {
  font-size: 14px;
  color: #909399;
  margin: 8px 0 16px 0;
  line-height: 1.5;
}

.basic-form {
  max-width: 800px;
}

.icon-input {
  display: flex;
  gap: 8px;
}

.icon-input .el-input {
  flex: 1;
}

.child-types-config {
  min-height: 200px;
}

.child-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.child-type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.child-icon {
  font-size: 16px;
}

.child-name {
  font-size: 14px;
}

.no-child-types {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
  color: #909399;
  font-size: 14px;
}

.icon-picker {
  padding: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.icon-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.icon-item.selected {
  background: #e6f4ff;
  border-color: #409eff;
}

/* 滚动条样式 */
.tab-content::-webkit-scrollbar,
.icon-grid::-webkit-scrollbar {
  width: 6px;
}

.tab-content::-webkit-scrollbar-track,
.icon-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb,
.icon-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.tab-content::-webkit-scrollbar-thumb:hover,
.icon-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>