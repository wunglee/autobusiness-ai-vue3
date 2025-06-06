<template>
  <div class="mcp-panel">
    <div class="mcp-row">
      <div class="mcp-table-wrap">
        <div class="mcp-table-header">名称</div>
        <table class="mcp-table">
          <thead>
          <tr>
            <th>名称</th>
            <th>描述</th>
            <th>启用</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in leftList" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.desc }}</td>
            <td><input type="checkbox" v-model="item.enabled" /></td>
            <td>
              <button class="mcp-row-btn" @click="moveToRight(item)">→</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="mcp-table-op">
        <button class="mcp-big-btn" @click="addLeft">➔ 新增</button>
        <button class="mcp-big-btn" @click="delLeft">← 删除</button>
      </div>

      <div class="mcp-table-wrap">
        <div class="mcp-table-header">名称</div>
        <table class="mcp-table">
          <thead>
          <tr>
            <th>名称</th>
            <th>描述</th>
            <th>启用</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in rightList" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.desc }}</td>
            <td><input type="checkbox" v-model="item.enabled" /></td>
            <td>
              <button class="mcp-row-btn" @click="moveToLeft(item)">←</button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 模拟左右表格数据
const leftList = ref([
  { id: 1, name: 'Text', desc: 'Text', enabled: false },
  { id: 2, name: 'Text', desc: 'Text', enabled: false },
  { id: 3, name: 'Text', desc: 'Text', enabled: false },
  { id: 4, name: 'Text', desc: 'Text', enabled: false },
])
const rightList = ref([
  { id: 5, name: 'Text', desc: 'Text', enabled: false },
  { id: 6, name: 'Text', desc: 'Text', enabled: false },
])

function moveToRight(item) {
  leftList.value = leftList.value.filter(i => i.id !== item.id)
  rightList.value.push(item)
}
function moveToLeft(item) {
  rightList.value = rightList.value.filter(i => i.id !== item.id)
  leftList.value.push(item)
}
function addLeft() {
  // 简化处理，仅演示
  leftList.value.push({
    id: Date.now(),
    name: 'Text',
    desc: 'Text',
    enabled: false,
  })
}
function delLeft() {
  if (leftList.value.length > 0) leftList.value.pop()
}
</script>

<style scoped>
.mcp-panel {
  padding: 18px 12px 0 12px;
}
.mcp-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 54px;
}
.mcp-table-wrap {
  background: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 0 6px #ececec;
  min-width: 340px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.mcp-table-header {
  font-size: 18px;
  color: #444;
  margin-bottom: 6px;
  text-align: left;
  width: 100%;
  font-weight: 500;
}
.mcp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}
.mcp-table th, .mcp-table td {
  border-bottom: 1px solid #eee;
  padding: 6px 6px;
  text-align: center;
}
.mcp-table th {
  background: #f2f2f2;
  color: #888;
  font-weight: 500;
}
.mcp-table td {
  background: #fff;
  color: #222;
}
.mcp-row-btn {
  padding: 2px 10px;
  border-radius: 6px;
  border: none;
  background: #e7eaf5;
  color: #444;
  cursor: pointer;
  font-size: 18px;
}
.mcp-row-btn:hover {
  background: #c0d6fa;
  color: #2451a6;
}
.mcp-table-op {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  align-items: center;
  margin: 0 12px;
}
.mcp-big-btn {
  background: #222;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 9px;
  font-size: 19px;
  cursor: pointer;
  margin: 4px 0;
  letter-spacing: 2px;
  transition: background 0.15s;
}
.mcp-big-btn:hover {
  background: #3574ec;
}
</style>