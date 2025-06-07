<template>
  <div class="agent-config-page">
    <!-- 左侧：两列可调宽度 -->
    <div
        class="agent-category-list-wrap"
        :style="{ width: categoryWidth + 'px' }"
    >
      <AgentCategoryList
          :categories="categories"
          :selected="selectedCategory"
          @select="handleSelectCategory"
          @add="handleAddCategory"
          @rename="handleRenameCategory"
          @delete="handleDeleteCategory"
      />
    </div>
    <ResizableDivider @drag="onDragCategoryDivider" />
    <div
        class="agent-list-wrap"
        :style="{ width: listWidth + 'px' }"
    >
      <AgentList
          :agents="filteredAgents"
          :selected="selectedAgent"
          @select="handleSelectAgent"
          @add="handleAddAgent"
          @rename="handleRenameAgent"
          @delete="handleDeleteAgent"
      />
    </div>
    <!-- 名称/详情之间可拖动分隔线 -->
    <ResizableDivider @drag="onDragSiderDivider" />
    <!-- 右侧详情区域 -->
    <div class="agent-config-main">
      <div class="agent-config-header">
        <span class="agent-config-title">智能体配置</span>
      </div>
      <AgentConfigTabs
          v-if="selectedAgent"
          :agent="selectedAgent"
          :tab="currentTab"
          @tabChange="currentTab = $event"
          @save="handleSave"
      />
      <div v-else class="agent-config-empty">
        <span>请先选择一个智能体进行配置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import AgentCategoryList from '@/views/AgentConfig/AgentCategoryList.vue'
import AgentList from '@/views/AgentConfig/AgentList.vue'
import AgentConfigTabs from '@/views/AgentConfig/AgentConfigTabs.vue'
import ResizableDivider from '@/components/ResizableDivider.vue'

const categories = ref([
  { id: 1, name: '分类一' },
  { id: 2, name: '分类二' }
])
const agents = ref([
  { id: 1, name: '名称一', categoryId: 1 },
  { id: 2, name: '名称二', categoryId: 1 },
  { id: 3, name: '名称三', categoryId: 2 }
])
const selectedCategory = ref(categories.value[0]?.id ?? null)
const selectedAgent = ref(null)
const currentTab = ref('描述')

const categoryWidth = ref(140)
const listWidth = ref(200)
const minCategoryWidth = 80
const minListWidth = 80

function onDragCategoryDivider(deltaX) {
  const newCategoryWidth = categoryWidth.value + deltaX
  if (newCategoryWidth > minCategoryWidth) {
    categoryWidth.value = newCategoryWidth
  }
}

function onDragSiderDivider(deltaX) {
  const newListWidth = listWidth.value + deltaX
  if (newListWidth > minListWidth) {
    listWidth.value = newListWidth
  }
}

function handleSelectCategory(id) {
  selectedCategory.value = id
  selectedAgent.value = null // 切换分类时清空选中的智能体
}

function handleAddCategory() {
  const newCategory = {
    id: Date.now(),
    name: `新分类${categories.value.length + 1}`
  }
  categories.value.push(newCategory)
  ElMessage.success('分类已创建')
}

function handleRenameCategory({ newName, ...category }) {
  const index = categories.value.findIndex(c => c.id === category.id)
  if (index !== -1) {
    categories.value[index].name = newName
    ElMessage.success('分类重命名成功')
  }
}

function handleDeleteCategory(category) {
  const index = categories.value.findIndex(c => c.id === category.id)
  if (index !== -1) {
    // 删除分类下的所有智能体
    agents.value = agents.value.filter(a => a.categoryId !== category.id)
    categories.value.splice(index, 1)

    // 如果删除的是当前选中的分类，切换到第一个分类
    if (selectedCategory.value === category.id) {
      selectedCategory.value = categories.value[0]?.id || null
      selectedAgent.value = null
    }

    ElMessage.success('分类已删除')
  }
}

const filteredAgents = computed(() =>
    agents.value.filter(a => a.categoryId === selectedCategory.value)
)

function handleSelectAgent(agent) {
  selectedAgent.value = agent
}

function handleAddAgent() {
  if (!selectedCategory.value) {
    ElMessage.warning('请先选择一个分类')
    return
  }

  const newAgent = {
    id: Date.now(),
    name: `新智能体${agents.value.length + 1}`,
    categoryId: selectedCategory.value
  }
  agents.value.push(newAgent)
  ElMessage.success('智能体已创建')
}

function handleRenameAgent({ newName, ...agent }) {
  const index = agents.value.findIndex(a => a.id === agent.id)
  if (index !== -1) {
    agents.value[index].name = newName
    // 如果是当前选中的智能体，也要更新
    if (selectedAgent.value?.id === agent.id) {
      selectedAgent.value.name = newName
    }
    ElMessage.success('智能体重命名成功')
  }
}

function handleDeleteAgent(agent) {
  const index = agents.value.findIndex(a => a.id === agent.id)
  if (index !== -1) {
    agents.value.splice(index, 1)

    // 如果删除的是当前选中的智能体，清空选择
    if (selectedAgent.value?.id === agent.id) {
      selectedAgent.value = null
    }

    ElMessage.success('智能体已删除')
  }
}

function handleSave(data) {
  ElMessage.success('配置已保存')
}
</script>

<style scoped>
.agent-config-page {
  display: flex;
  height: 100%;
  background: #f5f7fa;
  overflow: hidden;
}

.agent-category-list-wrap,
.agent-list-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.agent-config-main {
  flex: 1 1 0;
  min-width: 0;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.agent-config-header {
  padding: 32px 0 16px 0;
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.agent-config-title {
  letter-spacing: 1px;
}

.agent-config-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 16px;
}
</style>