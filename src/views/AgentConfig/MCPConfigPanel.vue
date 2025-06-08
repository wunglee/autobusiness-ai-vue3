<template>
  <div class="mcp-panel">
    <div class="mcp-row">
      <!-- 左侧可用MCP列表 -->
      <div class="mcp-table-wrap">
        <div class="mcp-table-header">可用MCP工具</div>
        <table class="mcp-table">
          <thead>
          <tr>
            <th width="40">
              <input
                  type="checkbox"
                  :checked="isAllLeftSelected"
                  @change="toggleAllLeft"
              />
            </th>
            <th>名称</th>
            <th>描述</th>
            <th>启用</th>
            <th>详情</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in leftList" :key="item.id">
            <td>
              <input
                  type="checkbox"
                  v-model="leftSelection"
                  :value="item.id"
              />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.desc }}</td>
            <td class="enable-cell">
              <el-icon v-if="item.enabled" class="check-icon" color="#67c23a">
                <Check />
              </el-icon>
            </td>
            <td>
              <el-button
                  text
                  :icon="MoreFilled"
                  @click="showDetail(item)"
                  class="more-btn"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- 中间操作按钮 -->
      <div class="mcp-table-op">
        <el-button
            type="primary"
            :icon="ArrowRight"
            icon-position="right"
            :disabled="leftSelection.length === 0"
            @click="moveToRight"
            class="transfer-btn"
        >
          添加
        </el-button>
        <el-button
            type="warning"
            :icon="ArrowLeft"
            :disabled="rightSelection.length === 0"
            @click="moveToLeft"
            class="transfer-btn"
        >
          移除
        </el-button>
      </div>

      <!-- 右侧MCP列表 -->
      <div class="mcp-table-wrap">
        <div class="mcp-table-header">智能体MCP工具</div>
        <table class="mcp-table">
          <thead>
          <tr>
            <th width="40">
              <input
                  type="checkbox"
                  :checked="isAllRightSelected"
                  @change="toggleAllRight"
              />
            </th>
            <th>名称</th>
            <th>描述</th>
            <th>启用</th>
            <th>详情</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in rightList" :key="item.id">
            <td>
              <input
                  type="checkbox"
                  v-model="rightSelection"
                  :value="item.id"
              />
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.desc }}</td>
            <td class="enable-cell">
              <el-icon
                  v-if="item.enabled"
                  class="check-icon"
                  color="#67c23a"
              >
                <Check />
              </el-icon>
            </td>
            <td>
              <el-button
                  text
                  :icon="MoreFilled"
                  @click="showDetail(item)"
                  class="more-btn"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MCP详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        :title="currentMcp?.name"
        width="600px"
    >
      <div v-if="currentMcp" class="mcp-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ currentMcp.name }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentMcp.desc }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ currentMcp.version || '1.0.0' }}</el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <el-tag :type="currentMcp.enabled ? 'success' : 'info'">
              {{ currentMcp.enabled ? '已启用' : '未启用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支持功能">{{ currentMcp.features || '数据处理、接口调用' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentMcp.createTime || '2024-01-01' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="editMcp">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Check,
  MoreFilled,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'

// 模拟左右表格数据
const leftList = ref([
  { id: 1, name: 'FileProcessor', desc: '文件处理工具', enabled: true, version: '1.2.0', features: '文件读取、格式转换' },
  { id: 2, name: 'DataAnalyzer', desc: '数据分析工具', enabled: false, version: '2.0.1', features: '统计分析、图表生成' },
  { id: 3, name: 'WebScraper', desc: '网页抓取工具', enabled: true, version: '1.5.3', features: '网页解析、数据抓取' },
  { id: 4, name: 'ImageProcessor', desc: '图像处理工具', enabled: false, version: '3.0.0', features: '图像压缩、格式转换' },
])

const rightList = ref([
  { id: 5, name: 'TextParser', desc: '文本解析工具', enabled: true, version: '1.1.0', features: '文本分析、关键词提取' },
  { id: 6, name: 'DatabaseConnector', desc: '数据库连接器', enabled: false, version: '2.2.0', features: '数据库操作、SQL执行' },
])

// 选择状态
const leftSelection = ref([])
const rightSelection = ref([])

// 详情对话框
const showDetailDialog = ref(false)
const currentMcp = ref(null)

// 计算属性
const isAllLeftSelected = computed(() =>
    leftList.value.length > 0 && leftSelection.value.length === leftList.value.length
)

const isAllRightSelected = computed(() =>
    rightList.value.length > 0 && rightSelection.value.length === rightList.value.length
)

// 方法
function toggleAllLeft() {
  if (isAllLeftSelected.value) {
    leftSelection.value = []
  } else {
    leftSelection.value = leftList.value.map(item => item.id)
  }
}


function moveToRight() {
  const selectedItems = leftList.value.filter(item => leftSelection.value.includes(item.id))
  selectedItems.forEach(item => {
    rightList.value.push(item)
  })
  leftList.value = leftList.value.filter(item => !leftSelection.value.includes(item.id))
  leftSelection.value = []
  ElMessage.success(`已添加 ${selectedItems.length} 个工具`)
}

function moveToLeft() {
  const selectedItems = rightList.value.filter(item => rightSelection.value.includes(item.id))
  selectedItems.forEach(item => {
    leftList.value.push(item)
  })
  rightList.value = rightList.value.filter(item => !rightSelection.value.includes(item.id))
  rightSelection.value = []
  ElMessage.success(`已移除 ${selectedItems.length} 个工具`)
}


function showDetail(item) {
  currentMcp.value = item
  showDetailDialog.value = true
}

function editMcp() {
  ElMessage.info('编辑功能开发中...')
  showDetailDialog.value = false
}

</script>

<style scoped>
.mcp-panel {
  padding: 18px 12px 0 12px;
  font-size: 14px; /* 与基础字体大小一致 */
}

.mcp-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24px
}

.mcp-table-wrap {
  border-radius: 10px;
  min-width: 320px;
  max-width: 400px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
}

.mcp-table-header {
  font-size: 14px; /* 与基础字体大小一致 */
  color: #444;
  margin-bottom: 12px;
  text-align: center;
  font-weight: 500;
}

.mcp-table {
  width: 100%;
  box-shadow: 0 0 6px #ececec;
  border-collapse: collapse;
  font-size: 12px; /* 表格内容稍小 */
  margin-bottom: 12px;
}

.mcp-table th, .mcp-table td {
  border-bottom: 1px solid #eee;
  padding: 8px 6px;
  text-align: center;
}

.mcp-table th {
  background: #f2f2f2;
  color: #888;
  font-weight: 500;
  font-size: 12px;
}

.mcp-table td {
  background: #fff;
  color: #222;
}

.enable-cell {
  cursor: pointer;
}

.check-icon{
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.check-icon:hover {
  transform: scale(1.1);
}

.more-btn {
  padding: 2px 4px;
  font-size: 14px;
}

.table-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.mcp-table-op {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  align-items: center;
  margin: 0 12px;
  min-width: 160px;
  padding: 20px 0;
}

.transfer-btn {
  width: 140px !important;
  height: 36px !important;
  font-size: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  white-space: nowrap !important;
  padding: 8px 12px !important;
  margin-left: 0 !important; /* 覆盖Element Plus的默认边距 */
}

/* 覆盖Element Plus的相邻按钮样式 */
.mcp-table-op .el-button + .el-button {
  margin-left: 0 !important;
}

.mcp-detail {
  padding: 16px 0;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .mcp-row {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .mcp-table-op {
    flex-direction: row;
    min-width: auto;
  }

  .mcp-table-wrap {
    width: 100%;
    max-width: 500px;
  }
}
</style>