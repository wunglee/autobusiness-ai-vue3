<template>
  <div class="agent-manager-dual">
    <div class="agent-list-section">
      <div class="section-header">
        <h4>备选智能体</h4>
        <el-input
            v-model="searchKeyword"
            placeholder="搜索智能体"
            :prefix-icon="Search"
            size="small"
            style="width: 200px"
        />
      </div>
      <div class="agent-list available-list">
        <div
            v-for="agent in filteredGlobalAgents"
            :key="agent.id"
            class="agent-row"
            @click="addToSelected(agent)"
        >
          <el-icon class="agent-avatar"><Avatar /></el-icon>
          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
            <div class="agent-desc">{{ agent.description }}</div>
          </div>
          <el-button
              text
              :icon="MoreFilled"
              circle
              size="small"
              @click.stop="showAgentDetail(agent)"
          />
        </div>
      </div>
    </div>

    <div class="agent-transfer-buttons">
      <el-button :icon="ArrowRight" circle @click="addAllToSelected" />
      <el-button :icon="ArrowLeft" circle @click="removeAllFromSelected" />
    </div>

    <div class="agent-list-section">
      <div class="section-header">
        <h4>已选智能体</h4>
        <span class="selected-count">{{ selectedAgentList.length }} 个</span>
      </div>
      <div class="agent-list selected-list">
        <div
            v-for="agent in selectedAgentList"
            :key="agent.id"
            class="agent-row"
            @click="removeFromSelected(agent)"
        >
          <el-icon class="agent-avatar"><Avatar /></el-icon>
          <div class="agent-info">
            <div class="agent-name">{{ agent.name }}</div>
            <div class="agent-desc">{{ agent.description }}</div>
          </div>
          <el-button
              text
              :icon="MoreFilled"
              circle
              size="small"
              @click.stop="showAgentDetail(agent)"
          />
        </div>
      </div>
    </div>

    <!-- 智能体详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        :title="detailAgent?.name"
        width="600px"
        :append-to-body="true"
    >
      <div v-if="detailAgent" class="agent-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ detailAgent.name }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detailAgent.description }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detailAgent.type || '通用助手' }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ detailAgent.version || '1.0.0' }}</el-descriptions-item>
          <el-descriptions-item label="MCP工具" v-if="detailAgent.tools">
            <el-tag v-for="tool in detailAgent.tools" :key="tool" size="small" style="margin-right: 8px">
              {{ tool }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailAgent.createTime || '2024-01-01' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
const { searchKeyword, createFilteredList } = useListFilter()

// 创建过滤后的全局智能体列表
const filteredGlobalAgents = createFilteredList(
    ref(props.globalAgents),
    ref(props.selectedAgentList),
    ['name', 'category', 'description']
)

// 智能体详情对话框
const showDetailDialog = ref(false)
const detailAgent = ref(null)

// 智能体管理功能
const addToSelected = (agent) => {
  if (!props.selectedAgentList.find(a => a.id === agent.id)) {
    const newList = [...props.selectedAgentList, agent]
    emit('update:selectedAgentList', newList)
  }
}

const removeFromSelected = (agent) => {
  const newList = props.selectedAgentList.filter(a => a.id !== agent.id)
  emit('update:selectedAgentList', newList)
}

const addAllToSelected = () => {
  filteredGlobalAgents.value.forEach(agent => {
    if (!props.selectedAgentList.find(a => a.id === agent.id)) {
      addToSelected(agent)
    }
  })
}

const removeAllFromSelected = () => {
  emit('update:selectedAgentList', [])
}

const showAgentDetail = (agent) => {
  detailAgent.value = agent
  showDetailDialog.value = true
}
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

.selected-count {
  font-size: 14px;
  color: #909399;
}

.agent-list {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow-y: auto;
  background: #fafbfc;
}

.agent-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background 0.2s;
}

.agent-row:hover {
  background: #f5f7fa;
}

.agent-row:last-child {
  border-bottom: none;
}

.agent-avatar {
  font-size: 28px;
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
}

.agent-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.agent-transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 8px;
}

.agent-detail {
  padding: 16px;
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
  }

  .agent-list {
    max-height: 250px;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .section-header .el-input {
    width: 100% !important;
  }

  .agent-transfer-buttons {
    gap: 8px;
  }
}
</style>