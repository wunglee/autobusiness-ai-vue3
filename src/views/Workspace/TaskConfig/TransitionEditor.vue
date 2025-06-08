<template>
  <div class="task-board">
    <div class="task-board-header">
      <div class="header-left">
        <h2>任务看板</h2>
        <p>项目任务管理和进度跟踪</p>
      </div>
      <div class="header-right">
        <el-button type="primary" :icon="Setting" @click="openTaskTypeConfig">
          配置任务类型
        </el-button>
      </div>
    </div>

    <div class="task-board-content">
      <div v-if="taskTypes.length === 0" class="board-placeholder">
        <el-icon size="80" class="placeholder-icon">
          <Setting />
        </el-icon>
        <h3>开始配置任务类型</h3>
        <p>在开始使用任务看板之前，请先配置任务类型来定义您的工作流程</p>

        <div class="setup-steps">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>定义任务类型</h4>
              <p>创建不同类型的任务，如需求、开发、测试等</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>设计状态流程</h4>
              <p>为每种任务类型设计状态转换流程</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>配置属性字段</h4>
              <p>定义任务所需的自定义属性字段</p>
            </div>
          </div>
        </div>

        <el-button type="primary" size="large" :icon="Plus" @click="openTaskTypeConfig">
          开始配置
        </el-button>
      </div>

      <div v-else class="board-workspace">
        <div class="workspace-sidebar">
          <div class="sidebar-header">
            <h3>任务列表</h3>
            <el-button type="text" :icon="Setting" @click="openTaskTypeConfig" title="配置任务类型" />
          </div>
          <div class="task-tree">
            <!-- 这里将来会显示任务树 -->
            <div class="empty-tasks">
              <el-icon><DocumentAdd /></el-icon>
              <p>暂无任务</p>
              <el-button type="primary" size="small" :icon="Plus">创建任务</el-button>
            </div>
          </div>
        </div>

        <div class="workspace-main">
          <div class="main-placeholder">
            <el-icon size="64"><Calendar /></el-icon>
            <h3>选择任务查看详情</h3>
            <p>从左侧任务列表中选择一个任务来查看其详细信息和子任务状态</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 任务类型配置对话框 -->
    <TaskTypeConfig
        v-model="showTaskTypeConfig"
        @save="handleTaskTypesSaved"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Calendar,
  Setting,
  Plus,
  DocumentAdd
} from '@element-plus/icons-vue'
import TaskTypeConfig from './TaskTypeConfig.vue'

// 响应式数据
const showTaskTypeConfig = ref(false)
const taskTypes = ref([]) // 初始为空，需要用户配置

// 方法
const openTaskTypeConfig = () => {
  showTaskTypeConfig.value = true
}

const handleTaskTypesSaved = (types) => {
  taskTypes.value = types
  ElMessage.success(`已保存 ${types.length} 个任务类型配置`)
}
</script>

<style scoped>
.task-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.task-board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.header-left h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.header-left p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.task-board-content {
  flex: 1;
  overflow: hidden;
}

.board-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.placeholder-icon {
  color: #d3d7de;
  margin-bottom: 24px;
}

.board-placeholder h3 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: #606266;
  font-weight: 500;
}

.board-placeholder p {
  margin: 0 0 32px 0;
  color: #909399;
  line-height: 1.6;
  font-size: 14px;
  max-width: 500px;
}

.setup-steps {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
  justify-content: center;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 200px;
  text-align: left;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.board-workspace {
  display: flex;
  height: 100%;
}

.workspace-sidebar {
  width: 300px;
  border-right: 1px solid #e4e7ed;
  background: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.task-tree {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-tasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  text-align: center;
}

.empty-tasks p {
  margin: 12px 0 16px 0;
  font-size: 14px;
}

.workspace-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.main-placeholder {
  text-align: center;
  color: #909399;
}

.main-placeholder h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: #606266;
}

.main-placeholder p {
  margin: 0;
  font-size: 14px;
  max-width: 300px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .task-board-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 16px;
  }

  .header-left {
    text-align: center;
  }

  .task-board-content {
    padding: 20px;
  }

  .setup-steps {
    flex-direction: column;
    gap: 16px;
  }

  .step-item {
    max-width: none;
  }

  .board-workspace {
    flex-direction: column;
  }

  .workspace-sidebar {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
}
</style>