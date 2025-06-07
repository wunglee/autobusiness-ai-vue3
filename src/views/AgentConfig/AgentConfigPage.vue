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
          @submit="handleSubmit"
          @cancel="handleCancel"
      />
      <div v-else class="agent-config-empty">
        <span>请先选择一个智能体进行配置</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
function handleSelectCategory(id) { selectedCategory.value = id }
function handleAddCategory() { }
const filteredAgents = computed(() =>
    agents.value.filter(a => a.categoryId === selectedCategory.value)
)
function handleSelectAgent(agent) { selectedAgent.value = agent }
function handleAddAgent() { }
function handleSubmit(data) { }
function handleCancel() { }
</script>

<style scoped>
.agent-config-page {
  display: flex;
  height: 100%;
  background: #f7f7f7;
  overflow: hidden;
}
.agent-config-sider {
  display: flex;
  flex-direction: row;
  background: #f0f0f0;
  border-right: 1.5px solid #d4d4d4;
  min-width: 220px;
  position: relative;
  z-index: 2;
  height: 100vh;
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
  font-size: 28px;
  font-weight: 500;
  color: #212121;
  text-align: center;
}
.agent-config-title {
  letter-spacing: 2px;
}
.agent-config-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
}
</style>