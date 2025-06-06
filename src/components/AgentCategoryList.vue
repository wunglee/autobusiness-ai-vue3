<template>
  <div class="agent-category-list">
    <div class="list-header">分类</div>
    <div class="list-items">
      <div
          v-for="cat in categories"
          :key="cat.id"
          :class="['list-item', { selected: cat.id === selected }]"
          @click="$emit('select', cat.id)"
      >{{ cat.name }}</div>
    </div>
    <div class="list-add-btn-wrap">
      <button class="list-add-btn" @click="$emit('add')">新增</button>
    </div>
  </div>
</template>
<script setup>
defineProps(['categories', 'selected'])
</script>
<style scoped>
.agent-category-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #eee;
  border-right: 1px solid #bdbdbd;
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
  padding: 12px 16px;
  cursor: pointer;
  font-size: 21px;
  border-bottom: 1px solid #dadada;
  transition: background 0.2s;
  word-break: break-all;
}
.list-item.selected {
  background: #fff;
  font-weight: bold;
  color: #1a72e5;
}
.list-add-btn-wrap {
  flex-shrink: 0;
  width: 100%;
  background: #eee;
  border-top: 1px solid #d2d2d2;
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