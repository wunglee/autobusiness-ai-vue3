<template>
  <div class="agent-manager-dual">
    <div class="agent-list-section">
      <div class="section-header">
        <h4>备选智能体</h4>
        <div class="header-controls">
          <el-select
              v-model="selectedCategory"
              placeholder="选择分类"
              size="small"
              style="width: 120px; margin-right: 12px"
              @change="onCategoryChange"
          >
            <el-option label="全部分类" value="" />
            <el-option
                v-for="category in agentCategories"
                :key="category"
                :label="category"
                :value="category"
            />
          </el-select>
          <el-input
              v-model="searchKeyword"
              placeholder="搜索智能体"
              :prefix-icon="Search"
              size="small"
              style="width: 180px"
          />
        </div>
      </div>
      <div class="agent-list available-list">
        <div class="list-header">
          <el-checkbox
              v-model="selectAllLeft"
              :indeterminate="leftIndeterminate"
              @change="handleSelectAllLeft"
          >
            全选
          </el-checkbox>
          <span class="list-info">{{ filteredGlobalAgents.length }} 个智能体</span>
        </div>
        <div class="agent-items">
          <div
              v-for="agent in filteredGlobalAgents"
              :key="agent.id"
              class="agent-row"
          >
            <el-checkbox
                v-model="leftSelectedIds"
                :value="agent.id"
                @change="updateLeftSelection"
            />
            <el-icon class="agent-avatar"><Avatar /></el-icon>
            <div class="agent-info">
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-desc">{{ agent.description }}</div>
              <div class="agent-category">{{ agent.category }}</div>
            </div>
            <el-button
                text
                :icon="MoreFilled"
                circle
                size="small"
                @click="showAgentDetail(agent)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="agent-transfer-buttons">
      <el-button
          :icon="ArrowRight"
          :disabled="leftSelectedIds.length === 0"
          @click="moveToSelected"
      >
        添加
      </el-button>
      <el-button
          :icon="ArrowLeft"
          :disabled="rightSelectedIds.length === 0"
          @click="moveToAvailable"
      >
        移除
      </el-button>
    </div>

    <div class="agent-list-section">
      <div class="section-header">
        <h4>已选智能体</h4>
        <span class="selected-count">{{ selectedAgentList.length }} 个</span>
      </div>
      <div class="agent-list selected-list">
        <div class="list-header">
          <el-checkbox
              v-model="selectAllRight"
              :indeterminate="rightIndeterminate"
              @change="handleSelectAllRight"
          >
            全选
          </el-checkbox>
          <span class="list-info">{{ selectedAgentList.length }} 个智能体</span>
        </div>
        <div class="agent-items">
          <div
              v-for="agent in selectedAgentList"
              :key="agent.id"
              class="agent-row"
          >
            <el-checkbox
                v-model="rightSelectedIds"
                :value="agent.id"
                @change="updateRightSelection"
            />
            <el-icon class="agent-avatar"><Avatar /></el-icon>
            <div class="agent-info">
              <div class="agent-name">{{ agent.name }}</div>
              <div class="agent-desc">{{ agent.description }}</div>
              <div class="agent-category">{{ agent.category }}</div>
            </div>
            <el-button
                text
                :icon="MoreFilled"
                circle
                size="small"
                @click="showAgentDetail(agent)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 智能体详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        :title="detailAgent?.name + ' - 详情'"
        width="800px"
        :append-to-body="true"
    >
      <div v-if="detailAgent" class="agent-detail-content">
        <el-tabs v-model="detailActiveTab" type="card">
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="名称" span="2">{{ detailAgent.name }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ detailAgent.category }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ detailAgent.type || '通用助手' }}</el-descriptions-item>
              <el-descriptions-item label="版本" span="2">{{ detailAgent.version || '1.0.0' }}</el-descriptions-item>
              <el-descriptions-item label="描述" span="2">{{ detailAgent.description }}</el-descriptions-item>
              <el-descriptions-item label="创建时间" span="2">{{ detailAgent.createTime || '2024-01-01' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <!-- MCP工具 -->
          <el-tab-pane label="MCP工具" name="mcp">
            <div v-if="detailAgent.tools && detailAgent.tools.length > 0">
              <el-tag
                  v-for="tool in detailAgent.tools"
                  :key="tool"
                  size="large"
                  style="margin: 4px 8px 4px 0"
              >
                {{ tool }}
              </el-tag>
            </div>
            <el-empty v-else description="暂无MCP工具" :image-size="60" />
          </el-tab-pane>

          <!-- 配置信息 -->
          <el-tab-pane label="配置信息" name="config">
            <el-form label-width="100px">
              <el-form-item label="系统提示词">
                <el-input
                    :value="detailAgent.systemPrompt || '暂无配置'"
                    type="textarea"
                    :rows="4"
                    readonly
                />
              </el-form-item>
              <el-form-item label="最大令牌数">
                <el-input :value="detailAgent.maxTokens || '4096'" readonly />
              </el-form-item>
              <el-form-item label="温度参数">
                <el-input :value="detailAgent.temperature || '0.7'" readonly />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="editAgent">编辑配置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Avatar,
  MoreFilled,
  ArrowRight,
  ArrowLeft,
  Search
} from '@element-plus/icons-vue'
import { useListFilter } from '@/components/useListFilter'

const props = defineProps({
  // 已选智能体列表（双向绑定）
  selectedAgentList: {
    type: Array,
    default: () => []
  },
  // 全局智能体列表
  globalAgents: {
    type: Array,
    default: () => []
  },
  // 是否显示传输按钮
  showTransferButtons: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:selectedAgentList', 'save'])

// 使用列表过滤 hook
const { searchKeyword } = useListFilter()

// 分类相关
const selectedCategory = ref('')
const agentCategories = computed(() => {
  const categories = new Set(props.globalAgents.map(agent => agent.category))
  return Array.from(categories)
})

// 过滤逻辑
const filteredGlobalAgents = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return props.globalAgents.filter(agent => {
    // 排除已选中的
    if (props.selectedAgentList.find(a => a.id === agent.id)) return false

    // 分类过滤
    if (selectedCategory.value && agent.category !== selectedCategory.value) return false

    // 关键词搜索
    if (keyword) {
      const searchFields = [agent.name, agent.category, agent.description].join(' ').toLowerCase()
      if (!searchFields.includes(keyword)) return false
    }

    return true
  })
})

// 选择状态
const leftSelectedIds = ref([])
const rightSelectedIds = ref([])

// 全选相关
const selectAllLeft = ref(false)
const selectAllRight = ref(false)

const leftIndeterminate = computed(() => {
  return leftSelectedIds.value.length > 0 && leftSelectedIds.value.length < filteredGlobalAgents.value.length
})

const rightIndeterminate = computed(() => {
  return rightSelectedIds.value.length > 0 && rightSelectedIds.value.length < props.selectedAgentList.length
})

// 智能体详情对话框
const showDetailDialog = ref(false)
const detailAgent = ref(null)
const detailActiveTab = ref('basic')

// 方法
const onCategoryChange = () => {
  leftSelectedIds.value = []
  selectAllLeft.value = false
}

const updateLeftSelection = () => {
  selectAllLeft.value = leftSelectedIds.value.length === filteredGlobalAgents.value.length
}

const updateRightSelection = () => {
  selectAllRight.value = rightSelectedIds.value.length === props.selectedAgentList.length
}

const handleSelectAllLeft = (checked) => {
  if (checked) {
    leftSelectedIds.value = filteredGlobalAgents.value.map(agent => agent.id)
  } else {
    leftSelectedIds.value = []
  }
}

const handleSelectAllRight = (checked) => {
  if (checked) {
    rightSelectedIds.value = props.selectedAgentList.map(agent => agent.id)
  } else {
    rightSelectedIds.value = []
  }
}

const moveToSelected = () => {
  const agentsToMove = filteredGlobalAgents.value.filter(agent => leftSelectedIds.value.includes(agent.id))
  const newList = [...props.selectedAgentList, ...agentsToMove]
  emit('update:selectedAgentList', newList)
  leftSelectedIds.value = []
  selectAllLeft.value = false
  ElMessage.success(`已添加 ${agentsToMove.length} 个智能体`)
}

const moveToAvailable = () => {
  const newList = props.selectedAgentList.filter(agent => !rightSelectedIds.value.includes(agent.id))
  emit('update:selectedAgentList', newList)
  rightSelectedIds.value = []
  selectAllRight.value = false
  ElMessage.success(`已移除 ${props.selectedAgentList.length - newList.length} 个智能体`)
}

const showAgentDetail = (agent) => {
  detailAgent.value = agent
  detailActiveTab.value = 'basic'
  showDetailDialog.value = true
}

const editAgent = () => {
  ElMessage.info('跳转到智能体配置页面...')
  showDetailDialog.value = false
}

// 监听数据变化，清空选择状态
watch(() => props.selectedAgentList, () => {
  leftSelectedIds.value = []
  rightSelectedIds.value = []
  selectAllLeft.value = false
  selectAllRight.value = false
}, { deep: true })

watch(filteredGlobalAgents, () => {
  leftSelectedIds.value = []
  selectAllLeft.value = false
})
</script>

<style scoped>
.agent-manager-dual {
  display: flex;
  gap: 20px;
  align-items: stretch;
  height: 500px;
  padding: 18px 16px 0 16px;
}

.agent-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
  background: none;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.header-controls {
  display: flex;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #909399;
}

.agent-list {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
}

.list-info {
  color: #909399;
  font-size: 12px;
}

.agent-items {
  flex: 1;
  overflow-y: auto;
}

.agent-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  transition: background 0.2s;
}

.agent-row:hover {
  background: #f5f7fa;
}

.agent-row:last-child {
  border-bottom: none;
}

.agent-row .el-checkbox {
  margin-right: 8px;
}

.agent-avatar {
  font-size: 24px;
  color: #667eea;
  margin-right: 12px;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.agent-desc {
  font-size: 12px;
  color: #909399;
  margin-bottom: 2px;
}

.agent-category {
  font-size: 11px;
  color: #b0b3bb;
}

.agent-transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 8px;
  min-width: 80px;
}

.agent-transfer-buttons .el-button {
  min-width: 60px;
}

.agent-detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.agent-detail-content .el-descriptions {
  margin-bottom: 16px;
}

.agent-detail-content .el-tag {
  margin: 2px 4px 2px 0;
}

@media (max-width: 1200px) {
  .agent-manager-dual {
    flex-direction: column;
    gap: 24px;
    height: auto;
  }

  .agent-transfer-buttons {
    flex-direction: row;
    justify-content: center;
    gap: 14px;
    padding: 16px 0;
    min-width: auto;
  }

  .agent-list {
    max-height: 250px;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .header-controls {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .header-controls .el-select,
  .header-controls .el-input {
    width: 100% !important;
    margin-right: 0 !important;
  }

  .agent-transfer-buttons {
    gap: 8px;
  }
}
</style>