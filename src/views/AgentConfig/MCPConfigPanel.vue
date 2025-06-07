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
            <th width="60">启用</th>
            <th width="50">详情</th>
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
        <div class="table-actions">
          <el-button size="small" @click="addNewMcp">新增</el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="leftSelection.length === 0"
              @click="deleteSelectedLeft"
          >
            删除选中
          </el-button>
        </div>
      </div>

      <!-- 中间操作按钮 -->
      <div class="mcp-table-op">
        <el-button
            type="primary"
            :icon="ArrowRight"
            :disabled="leftSelection.length === 0"
            @click="moveToRight"
            class="transfer-btn"
        >
          添加到工作区
        </el-button>
        <el-button
            type="warning"
            :icon="ArrowLeft"
            :disabled="rightSelection.length === 0"
            @click="moveToLeft"
            class="transfer-btn"
        >
          从工作区移除
        </el-button>
      </div>

      <!-- 右侧工作区MCP列表 -->
      <div class="mcp-table-wrap">
        <div class="mcp-table-header">工作区MCP工具</div>
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
            <th width="60">启用</th>
            <th width="50">详情</th>
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
                  @click="toggleEnable(item)"
              >
                <Check />
              </el-icon>
              <el-icon
                  v-else
                  class="uncheck-icon"
                  color="#c0c4cc"
                  @click="toggleEnable(item)"
              >
                <Close />
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
        <div class="table-actions">
          <el-button
              size="small"
              :disabled="rightSelection.length === 0"
              @click="enableSelected"
          >
            启用选中
          </el-button>
          <el-button
              size="small"
              :disabled="rightSelection.length === 0"
              @click="disableSelected"
          >
            禁用选中
          </el-button>
        </div>
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
  Close,
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

function toggleAllRight() {
  if (isAllRightSelected.value) {
    rightSelection.value = []
  } else {
    rightSelection.value = rightList.value.map(item => item.id)
  }
}

function moveToRight() {
  const selectedItems = leftList.value.filter(item => leftSelection.value.includes(item.id))
  selectedItems.forEach(item => {
    rightList.value.push(item)
  })
  leftList.value = leftList.value.filter(item => !leftSelection.value.includes(item.id))
  leftSelection.value = []
  ElMessage.success(`已添加 ${selectedItems.length} 个工具到工作区`)
}

function moveToLeft() {
  const selectedItems = rightList.value.filter(item => rightSelection.value.includes(item.id))
  selectedItems.forEach(item => {
    leftList.value.push(item)
  })
  rightList.value = rightList.value.filter(item => !rightSelection.value.includes(item.id))
  rightSelection.value = []
  ElMessage.success(`已从工作区移除 ${selectedItems.length} 个工具`)
}

function toggleEnable(item) {
  item.enabled = !item.enabled
  ElMessage.success(`${item.name} 已${item.enabled ? '启用' : '禁用'}`)
}

function enableSelected() {
  rightList.value.forEach(item => {
    if (rightSelection.value.includes(item.id)) {
      item.enabled = true
    }
  })
  ElMessage.success('已启用选中的工具')
}

function disableSelected() {
  rightList.value.forEach(item => {
    if (rightSelection.value.includes(item.id)) {
      item.enabled = false
    }
  })
  ElMessage.success('已禁用选中的工具')
}

function showDetail(item) {
  currentMcp.value = item
  showDetailDialog.value = true
}

function editMcp() {
  ElMessage.info('编辑功能开发中...')
  showDetailDialog.value = false
}

function addNewMcp() {
  const newMcp = {
    id: Date.now(),
    name: `NewTool${leftList.value.length + 1}`,
    desc: '新建MCP工具',
    enabled: false,
    version: '1.0.0',
    features: '待配置'
  }
  leftList.value.push(newMcp)
  ElMessage.success('新MCP工具已创建')
}

function deleteSelectedLeft() {
  leftList.value = leftList.value.filter(item => !leftSelection.value.includes(item.id))
  const count = leftSelection.value.length
  leftSelection.value = []
  ElMessage.success(`已删除 ${count} 个工具`)
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
  background: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 0 6px #ececec;
  min-width: 320px;
  max-width: 400px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.check-icon, .uncheck-icon {
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.check-icon:hover {
  transform: scale(1.1);
}

.uncheck-icon:hover {
  color: #f56c6c !important;
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
    max-width: none;
    width: 100%;
    max-width: 500px;
  }
}
</style>