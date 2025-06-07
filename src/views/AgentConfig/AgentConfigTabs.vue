<template>
  <div class="agent-config-tabs">
    <div class="tabs-bar">
      <span
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', { active: tab === currentTab }]"
          @click="$emit('tabChange', tab)"
      >{{ tab }}</span>
    </div>
    <div class="tab-content">
      <DescriptionConfigPanel v-if="currentTab === '描述'" :agent="agent" />
      <MCPConfigPanel v-if="currentTab === 'MCP'" :agent="agent" />
    </div>
    <div class="tab-actions">
      <button class="cancel-btn" @click="$emit('cancel')">取消</button>
      <button class="submit-btn" @click="$emit('submit')">确认</button>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import DescriptionConfigPanel from './DescriptionConfigPanel.vue'
import MCPConfigPanel from './MCPConfigPanel.vue'
const props = defineProps(['agent', 'tab'])
const currentTab = ref(props.tab)
watch(() => props.tab, val => { currentTab.value = val })
const tabs = ['描述', 'MCP']
</script>
<style scoped>
.agent-config-tabs { padding: 0 8px; }
.tabs-bar { display: flex; border-bottom: 1.5px solid #eee; margin-bottom: 18px; }
.tab { padding: 10px 28px; cursor: pointer; font-size: 19px; color: #888; border-bottom: 2px solid transparent; }
.tab.active { color: #222; border-bottom: 2px solid #6f9ce6; font-weight: 500; }
.tab-content { min-height: 380px; }
.tab-actions { text-align: center; margin: 24px 0 0 0; }
.cancel-btn, .submit-btn {
  min-width: 100px; margin: 0 14px; font-size: 19px; padding: 10px 0;
  border-radius: 8px; border: none;
}
.cancel-btn { background: #f4f4f4; color: #333; border: 1.5px solid #bbb; }
.submit-btn { background: #222; color: #fff; }
.submit-btn:hover { background: #356cf3; }
</style>