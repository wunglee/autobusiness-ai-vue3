<template>
  <div class="agent-list">
    <div class="list-header">名称</div>
    <div class="list-items">
      <div
          v-for="agent in agents"
          :key="agent.id"
          :class="['list-item', { selected: agent.id === selected?.id }]"
          @click="$emit('select', agent)"
      >{{ agent.name }}</div>
    </div>
    <div class="list-add-btn-wrap">
      <button class="list-add-btn" @click="$emit('add')">新增</button>
    </div>
  </div>
</template>
<script setup>
defineProps(['agents', 'selected'])
</script>
<style scoped>
.agent-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fafafa;
  min-width: 0;
  overflow: hidden;
}
.list-header {
  background: #b0b0b0;
  font-weight: bold;
  padding: 6px 14px;
  font-size: 22px;
  flex-shrink: 0;
}
.list-items {
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
}
.list-item {
  padding: 12px 18px;
  cursor: pointer;
  font-size: 21px;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
  word-break: break-all;
}
.list-item.selected {
  background: #f7faff;
  font-weight: bold;
  color: #e67300;
}
.list-add-btn-wrap {
  flex-shrink: 0;
  width: 100%;
  background: #fafafa;
  border-top: 1px solid #e0e0e0;
  box-sizing: border-box;
  display: flex;
}
.list-add-btn {
  background: #ddd;
  border: none;
  padding: 14px 0;
  font-size: 19px;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
  outline: none;
}
.list-add-btn:hover {
  background: #ccc;
}
</style>