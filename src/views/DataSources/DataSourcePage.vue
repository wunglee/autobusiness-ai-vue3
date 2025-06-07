<template>
  <div class="datasource-page">
    <div class="page-header">
      <h1>数据源管理</h1>
      <p>管理全局数据库连接和配置</p>
    </div>

    <div class="datasource-content">
      <div class="datasource-layout">
        <!-- 左侧数据源列表 -->
        <div class="ds-list-panel">
          <div class="panel-header">
            <h3>数据源列表</h3>
            <el-button size="small" :icon="Plus" @click="createDatasource">新建</el-button>
          </div>

          <div class="ds-list">
            <div
                v-for="ds in datasourceList"
                :key="ds.id"
                :class="['ds-item', { active: ds.id === selectedDatasource?.id }]"
                @click="selectDatasource(ds)"
            >
              <div class="ds-item-content">
                <div class="ds-info">
                  <div class="ds-name">{{ ds.name }}</div>
                  <div class="ds-type">{{ ds.type }}</div>
                </div>
                <div class="ds-status">
                  <el-tag
                      :type="ds.status === 'connected' ? 'success' : 'danger'"
                      size="small"
                  >
                    {{ ds.status === 'connected' ? '已连接' : '未连接' }}
                  </el-tag>
                </div>
              </div>
              <div class="ds-actions">
                <el-dropdown trigger="click" @command="cmd => handleCommand(cmd, ds)">
                  <el-icon class="more-icon" :size="16" @click.stop>
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="test">
                        <el-icon><Connection /></el-icon>
                        <span>测试连接</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>
                        <span>编辑</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="duplicate">
                        <el-icon><CopyDocument /></el-icon>
                        <span>复制</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon><Delete /></el-icon>
                        <span>删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧配置表单 -->
        <div class="ds-config-panel">
          <div v-if="selectedDatasource" class="ds-form-container">
            <div class="panel-header">
              <h3>数据源配置</h3>
              <div class="header-actions">
                <el-button
                    size="small"
                    :icon="Connection"
                    @click="testConnection"
                    :loading="testing"
                >
                  测试连接
                </el-button>
                <el-button
                    size="small"
                    type="primary"
                    :icon="Check"
                    @click="saveDatasource"
                    :loading="saving"
                >
                  保存
                </el-button>
              </div>
            </div>

            <el-form :model="datasourceForm" label-width="100px" class="ds-form">
              <el-form-item label="数据源名称" required>
                <el-input
                    v-model="datasourceForm.name"
                    placeholder="请输入数据源名称"
                />
              </el-form-item>

              <el-form-item label="数据库类型" required>
                <el-select v-model="datasourceForm.type" placeholder="请选择数据库类型" style="width: 100%">
                  <el-option label="MySQL" value="mysql" />
                  <el-option label="PostgreSQL" value="postgresql" />
                  <el-option label="SQL Server" value="sqlserver" />
                  <el-option label="Oracle" value="oracle" />
                  <el-option label="MongoDB" value="mongodb" />
                  <el-option label="Redis" value="redis" />
                </el-select>
              </el-form-item>

              <el-form-item label="主机地址" required>
                <el-input
                    v-model="datasourceForm.host"
                    placeholder="请输入主机地址，如: localhost"
                />
              </el-form-item>

              <el-form-item label="端口号" required>
                <el-input-number
                    v-model="datasourceForm.port"
                    :min="1"
                    :max="65535"
                    style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="数据库名">
                <el-input
                    v-model="datasourceForm.database"
                    placeholder="请输入数据库名称"
                />
              </el-form-item>

              <el-form-item label="用户名" required>
                <el-input
                    v-model="datasourceForm.username"
                    placeholder="请输入用户名"
                />
              </el-form-item>

              <el-form-item label="密码" required>
                <el-input
                    v-model="datasourceForm.password"
                    type="password"
                    placeholder="请输入密码"
                    show-password
                />
              </el-form-item>

              <el-form-item label="连接选项">
                <el-input
                    v-model="datasourceForm.options"
                    type="textarea"
                    :rows="3"
                    placeholder="额外的连接参数，如: charset=utf8&timeout=30"
                />
              </el-form-item>

              <el-form-item label="描述">
                <el-input
                    v-model="datasourceForm.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入数据源描述"
                />
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="ds-empty">
            <el-icon size="64"><Coin /></el-icon>
            <p>请选择或创建一个数据源</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接测试结果对话框 -->
    <el-dialog
        v-model="showTestResult"
        title="连接测试结果"
        width="500px"
    >
      <div class="test-result">
        <div :class="['result-status', testResult.success ? 'success' : 'error']">
          <el-icon size="24">
            <CircleCheck v-if="testResult.success" />
            <CircleClose v-else />
          </el-icon>
          <span>{{ testResult.success ? '连接成功' : '连接失败' }}</span>
        </div>
        <div class="result-message">
          {{ testResult.message }}
        </div>
        <div v-if="testResult.details" class="result-details">
          <h4>连接详情：</h4>
          <pre>{{ testResult.details }}</pre>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTestResult = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  MoreFilled,
  Connection,
  Check,
  Coin,
  CircleCheck,
  CircleClose,
  CopyDocument
} from '@element-plus/icons-vue'

// 响应式数据
const datasourceList = ref([])
const selectedDatasource = ref(null)
const testing = ref(false)
const saving = ref(false)
const showTestResult = ref(false)

const datasourceForm = reactive({
  id: null,
  name: '',
  type: 'mysql',
  host: '',
  port: 3306,
  database: '',
  username: '',
  password: '',
  options: '',
  description: ''
})

const testResult = reactive({
  success: false,
  message: '',
  details: ''
})

// 初始化数据
onMounted(() => {
  loadDatasourceList()
})

const loadDatasourceList = () => {
  // 模拟数据
  datasourceList.value = [
    {
      id: 1,
      name: '用户数据库',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'user_db',
      username: 'root',
      password: '123456',
      status: 'connected',
      description: '用户相关数据存储'
    },
    {
      id: 2,
      name: '产品数据库',
      type: 'postgresql',
      host: '192.168.1.100',
      port: 5432,
      database: 'product_db',
      username: 'admin',
      password: 'admin123',
      status: 'disconnected',
      description: '产品信息数据库'
    },
    {
      id: 3,
      name: 'Redis缓存',
      type: 'redis',
      host: 'redis.example.com',
      port: 6379,
      username: '',
      password: 'redis_pass',
      status: 'connected',
      description: '缓存数据库'
    }
  ]
}

const selectDatasource = (ds) => {
  selectedDatasource.value = ds
  // 填充表单
  Object.assign(datasourceForm, {
    id: ds.id,
    name: ds.name,
    type: ds.type,
    host: ds.host,
    port: ds.port,
    database: ds.database || '',
    username: ds.username,
    password: ds.password,
    options: ds.options || '',
    description: ds.description || ''
  })
}

const createDatasource = () => {
  selectedDatasource.value = null
  Object.assign(datasourceForm, {
    id: null,
    name: '',
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    options: '',
    description: ''
  })
}

const saveDatasource = () => {
  if (!datasourceForm.name.trim()) {
    ElMessage.warning('请输入数据源名称')
    return
  }

  if (!datasourceForm.host.trim() || !datasourceForm.username.trim()) {
    ElMessage.warning('请填写必要的连接信息')
    return
  }

  saving.value = true

  setTimeout(() => {
    if (datasourceForm.id) {
      // 更新现有数据源
      const index = datasourceList.value.findIndex(ds => ds.id === datasourceForm.id)
      if (index > -1) {
        datasourceList.value[index] = { ...datasourceForm }
        selectedDatasource.value = datasourceList.value[index]
      }
      ElMessage.success('数据源更新成功')
    } else {
      // 创建新数据源
      const newDs = {
        ...datasourceForm,
        id: Date.now(),
        status: 'disconnected'
      }
      datasourceList.value.push(newDs)
      selectedDatasource.value = newDs
      datasourceForm.id = newDs.id
      ElMessage.success('数据源创建成功')
    }
    saving.value = false
  }, 500)
}

const testConnection = () => {
  if (!datasourceForm.host.trim() || !datasourceForm.username.trim()) {
    ElMessage.warning('请填写连接信息后再测试')
    return
  }

  testing.value = true

  // 模拟连接测试
  setTimeout(() => {
    const success = Math.random() > 0.3 // 70%成功率

    testResult.success = success
    testResult.message = success
        ? '数据库连接测试成功！'
        : '连接失败，请检查配置信息'
    testResult.details = success
        ? `服务器: ${datasourceForm.host}:${datasourceForm.port}\n数据库: ${datasourceForm.database}\n连接时间: ${new Date().toLocaleString()}`
        : '错误代码: 1045\n错误信息: Access denied for user'

    // 更新数据源状态
    if (selectedDatasource.value) {
      selectedDatasource.value.status = success ? 'connected' : 'disconnected'
      const index = datasourceList.value.findIndex(ds => ds.id === selectedDatasource.value.id)
      if (index > -1) {
        datasourceList.value[index].status = success ? 'connected' : 'disconnected'
      }
    }

    testing.value = false
    showTestResult.value = true
  }, 1500)
}

const handleCommand = async (command, datasource) => {
  switch (command) {
    case 'test':
      selectDatasource(datasource)
      testConnection()
      break

    case 'edit':
      selectDatasource(datasource)
      break

    case 'duplicate':
      const duplicated = {
        ...datasource,
        id: Date.now(),
        name: `${datasource.name} (副本)`,
        status: 'disconnected'
      }
      datasourceList.value.push(duplicated)
      ElMessage.success('数据源复制成功')
      break

    case 'delete':
      try {
        await ElMessageBox.confirm(
            `确定要删除数据源 "${datasource.name}" 吗？`,
            '确认删除',
            { type: 'warning' }
        )

        const index = datasourceList.value.findIndex(ds => ds.id === datasource.id)
        if (index > -1) {
          datasourceList.value.splice(index, 1)
          if (selectedDatasource.value?.id === datasource.id) {
            selectedDatasource.value = null
          }
          ElMessage.success('数据源删除成功')
        }
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
.datasource-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 16px;
}

.datasource-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.datasource-layout {
  display: flex;
  height: 100%;
}

.ds-list-panel {
  width: 320px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.ds-config-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.ds-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.ds-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.ds-item:hover {
  background-color: #f5f7fa;
}

.ds-item.active {
  background-color: #e6f4ff;
  border-color: #409eff;
}

.ds-item-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ds-info {
  flex: 1;
}

.ds-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.ds-type {
  font-size: 12px;
  color: #909399;
}

.ds-status {
  margin-right: 8px;
}

.ds-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.ds-item:hover .ds-actions {
  opacity: 1;
}

.more-icon {
  cursor: pointer;
  color: #909399;
  padding: 4px;
  border-radius: 3px;
  transition: all 0.2s;
}

.more-icon:hover {
  background-color: #e6f4ff;
  color: #409eff;
}

.ds-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ds-form {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.ds-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.ds-empty p {
  margin-top: 16px;
  font-size: 16px;
}

.test-result {
  padding: 16px 0;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}

.result-status.success {
  color: #67c23a;
}

.result-status.error {
  color: #f56c6c;
}

.result-message {
  color: #606266;
  margin-bottom: 16px;
}

.result-details h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.result-details pre {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
}

/* 确保下拉菜单中的图标和文字对齐 */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .datasource-layout {
    flex-direction: column;
  }

  .ds-list-panel {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
}

@media (max-width: 768px) {
  .datasource-page {
    padding: 16px;
  }

  .panel-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: center;
  }
}
</style>