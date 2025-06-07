<template>
  <div class="mcp-page">
    <div class="page-header">
      <h1>MCP配置</h1>
    </div>

    <div class="mcp-content">
      <div class="mcp-layout">
        <!-- 左侧：MCP发现服务器 -->
        <div class="mcp-servers-panel">
          <div class="panel-header">
            <h3>MCP发现服务器</h3>
            <el-button size="small" :icon="Plus" @click="addServer">新增</el-button>
          </div>

          <div class="server-list">
            <div
                v-for="server in mcpServers"
                :key="server.id"
                :class="['server-item', { active: server.id === selectedServer?.id }]"
                @click="selectServer(server)"
            >
              <div class="server-content">
                <div class="server-name">{{ server.name }}</div>
                <div class="server-url">{{ server.url }}</div>
              </div>
              <div class="server-actions">
                <el-dropdown trigger="click" @command="cmd => handleServerCommand(cmd, server)">
                  <el-icon class="more-icon" :size="16" @click.stop>
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>
                        <span>编辑</span>
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

        <!-- 右侧：MCP服务和配置 -->
        <div class="mcp-services-panel">

          <!-- MCP服务列表 -->
          <div class="services-section">
            <div class="section-header">
              <h4>MCP服务</h4>
              <div class="header-actions">
                <span class="service-count">{{ mcpServices.length }} 个服务</span>
                <el-button size="small" :icon="Refresh" @click="refreshServices">刷新</el-button>
              </div>
            </div>

            <div class="services-table">
              <table class="service-table">
                <thead>
                <tr>
                  <th>名称</th>
                  <th>客户端启动</th>
                  <th>配置信息</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="service in mcpServices" :key="service.id">
                  <td>{{ service.name }}</td>
                  <td>
                    <el-switch
                        v-model="service.enabled"
                        @change="toggleService(service)"
                    />
                  </td>
                  <td>
                    <el-button
                        text
                        :icon="Setting"
                        @click="configureService(service)"
                    >
                      配置
                    </el-button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 配置信息区域 -->
          <div class="config-section">
            <div class="section-header">
              <h4>配置信息</h4>
            </div>

            <div class="config-form">
              <el-form :model="serviceConfig" label-width="100px">
                <el-form-item label="服务名称">
                  <el-input v-model="serviceConfig.name" readonly />
                </el-form-item>
                <el-form-item label="启动命令">
                  <el-input v-model="serviceConfig.command" placeholder="请输入启动命令" />
                </el-form-item>
                <el-form-item label="参数">
                  <el-input
                      v-model="serviceConfig.args"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入命令参数"
                  />
                </el-form-item>
                <el-form-item label="环境变量">
                  <el-input
                      v-model="serviceConfig.env"
                      type="textarea"
                      :rows="3"
                      placeholder="KEY1=value1&#10;KEY2=value2"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="saveServiceConfig">保存配置</el-button>
                  <el-button @click="resetServiceConfig">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 客户端启动日志 -->
          <div class="logs-section">
            <div class="section-header">
              <h4>客户端启动日志</h4>
              <div class="header-actions">
                <el-button size="small" :icon="Delete" @click="clearLogs">清空</el-button>
                <el-button size="small" :icon="Download" @click="exportLogs">导出</el-button>
              </div>
            </div>

            <div class="logs-container">
              <div class="log-entry" v-for="log in logs" :key="log.id" :class="log.level">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-level">{{ log.level.toUpperCase() }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑服务器对话框 -->
    <el-dialog
        v-model="showServerDialog"
        :title="editingServer ? '编辑服务器' : '新增服务器'"
        width="500px"
    >
      <el-form :model="serverForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="serverForm.name" placeholder="请输入服务器名称" />
        </el-form-item>
        <el-form-item label="地址" required>
          <el-input v-model="serverForm.url" placeholder="请输入服务器地址" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
              v-model="serverForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入服务器描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showServerDialog = false">取消</el-button>
        <el-button type="primary" @click="saveServer">保存</el-button>
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
  Setting,
  Refresh,
  Download
} from '@element-plus/icons-vue'

// 响应式数据
const mcpServers = ref([])
const mcpServices = ref([])
const selectedServer = ref(null)
const selectedService = ref(null)
const logs = ref([])

const showServerDialog = ref(false)
const editingServer = ref(null)
const serverForm = reactive({
  name: '',
  url: '',
  description: ''
})

const serviceConfig = reactive({
  name: '',
  command: '',
  args: '',
  env: ''
})

// 初始化数据
onMounted(() => {
  loadMcpServers()
  loadMcpServices()
  loadLogs()
  resetServiceConfig()
})

const loadMcpServers = () => {
  mcpServers.value = [
    {
      id: 1,
      name: '服务器1',
      url: 'http://localhost:8080',
      description: 'MCP服务器1'
    },
    {
      id: 2,
      name: '服务器2',
      url: 'http://localhost:8081',
      description: 'MCP服务器2'
    }
  ]

  if (mcpServers.value.length > 0) {
    selectServer(mcpServers.value[0])
  }
}

const loadMcpServices = () => {
  mcpServices.value = [
    {
      id: 1,
      name: 'MCP服务1',
      enabled: true,
      command: 'mcp-service-1',
      args: '--port 3001',
      env: 'NODE_ENV=production'
    },
    {
      id: 2,
      name: 'MCP服务2',
      enabled: true,
      command: 'mcp-service-2',
      args: '--port 3002',
      env: 'NODE_ENV=production'
    },
    {
      id: 3,
      name: 'MCP服务3',
      enabled: false,
      command: 'mcp-service-3',
      args: '--port 3003',
      env: 'NODE_ENV=development'
    },
    {
      id: 4,
      name: 'MCP服务4',
      enabled: false,
      command: 'mcp-service-4',
      args: '--port 3004',
      env: 'NODE_ENV=development'
    },
    {
      id: 5,
      name: 'MCP服务5',
      enabled: false,
      command: 'mcp-service-5',
      args: '--port 3005',
      env: 'NODE_ENV=development'
    },
    {
      id: 6,
      name: 'MCP服务6',
      enabled: true,
      command: 'mcp-service-6',
      args: '--port 3006',
      env: 'NODE_ENV=production'
    },
    {
      id: 7,
      name: 'MCP服务7',
      enabled: true,
      command: 'mcp-service-7',
      args: '--port 3007',
      env: 'NODE_ENV=production'
    }
  ]
}

const loadLogs = () => {
  logs.value = [
    {
      id: 1,
      time: '2024-01-15 10:30:25',
      level: 'info',
      message: 'MCP客户端启动成功'
    },
    {
      id: 2,
      time: '2024-01-15 10:30:26',
      level: 'info',
      message: '连接到服务器: http://localhost:8080'
    },
    {
      id: 3,
      time: '2024-01-15 10:30:27',
      level: 'warn',
      message: '服务 MCP服务3 配置不完整'
    },
    {
      id: 4,
      time: '2024-01-15 10:30:28',
      level: 'error',
      message: '服务 MCP服务5 启动失败'
    }
  ]
}

const selectServer = (server) => {
  selectedServer.value = server
}

const addServer = () => {
  editingServer.value = null
  Object.assign(serverForm, {
    name: '',
    url: '',
    description: ''
  })
  showServerDialog.value = true
}

const handleServerCommand = (command, server) => {
  switch (command) {
    case 'edit':
      editingServer.value = server
      Object.assign(serverForm, server)
      showServerDialog.value = true
      break
    case 'delete':
      deleteServer(server)
      break
  }
}

const saveServer = () => {
  if (!serverForm.name.trim() || !serverForm.url.trim()) {
    ElMessage.warning('请填写服务器名称和地址')
    return
  }

  if (editingServer.value) {
    // 编辑
    const index = mcpServers.value.findIndex(s => s.id === editingServer.value.id)
    if (index > -1) {
      mcpServers.value[index] = { ...serverForm, id: editingServer.value.id }
    }
    ElMessage.success('服务器更新成功')
  } else {
    // 新增
    const newServer = {
      ...serverForm,
      id: Date.now()
    }
    mcpServers.value.push(newServer)
    ElMessage.success('服务器添加成功')
  }

  showServerDialog.value = false
}

const deleteServer = async (server) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除服务器 "${server.name}" 吗？`,
        '确认删除',
        { type: 'warning' }
    )

    const index = mcpServers.value.findIndex(s => s.id === server.id)
    if (index > -1) {
      mcpServers.value.splice(index, 1)
      if (selectedServer.value?.id === server.id) {
        selectedServer.value = mcpServers.value[0] || null
      }
      ElMessage.success('服务器删除成功')
    }
  } catch {
    // 用户取消
  }
}

const refreshServices = () => {
  ElMessage.success('服务列表已刷新')
  addLog('info', '刷新MCP服务列表')
}

const toggleService = (service) => {
  const action = service.enabled ? '启用' : '禁用'
  if(service.enabled){
    ElMessage.success('MCP客户端启动中...')
    addLog('info', 'MCP客户端启动成功')
  } else {
    ElMessage.success('MCP客户端已停止')
    addLog('info', 'MCP客户端已停止')
  }
}

const configureService = (service) => {
  selectedService.value = service
  Object.assign(serviceConfig, {
    name: service.name,
    command: service.command,
    args: service.args,
    env: service.env
  })
}

const saveServiceConfig = () => {
  if (!serviceConfig.name.trim()) {
    ElMessage.warning('请填写服务名称')
    return
  }
  if (selectedService.value) {
    // 编辑服务
    Object.assign(selectedService.value, {
      command: serviceConfig.command,
      args: serviceConfig.args,
      env: serviceConfig.env
    })
    ElMessage.success('服务配置已保存')
    addLog('info', `${selectedService.value.name} 配置已更新`)
  } else {
    // 新建服务
    const newService = {
      id: Date.now(),
      name: serviceConfig.name,
      command: serviceConfig.command,
      args: serviceConfig.args,
      env: serviceConfig.env,
      enabled: false
    }
    mcpServices.value.push(newService)
    ElMessage.success('服务已添加')
    addLog('info', `${serviceConfig.name} 服务已添加`)
    // 新增后自动选中
    configureService(newService)
  }
}

// 重置表单
const resetServiceConfig = () => {
  if (selectedService.value) {
    Object.assign(serviceConfig, {
      name: selectedService.value.name,
      command: selectedService.value.command,
      args: selectedService.value.args,
      env: selectedService.value.env
    })
  } else {
    Object.assign(serviceConfig, {
      name: '',
      command: '',
      args: '',
      env: ''
    })
  }
}

const addLog = (level, message) => {
  logs.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleString('zh-CN'),
    level,
    message
  })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

const clearLogs = () => {
  logs.value = []
  ElMessage.success('日志已清空')
}

const exportLogs = () => {
  const logText = logs.value.map(log =>
      `[${log.time}] ${log.level.toUpperCase()}: ${log.message}`
  ).join('\n')

  const blob = new Blob([logText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mcp-logs-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('日志已导出')
}
</script>

<style scoped>
.mcp-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.mcp-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.mcp-layout {
  display: flex;
  height: 100%;
}

.mcp-servers-panel {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}
.mcp-services-panel {
  min-height: 0 !important;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.server-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.server-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #e4e7ed;
}

.server-item:hover {
  background-color: #f5f7fa;
}

.server-item.active {
  background-color: #e6f4ff;
  border-color: #409eff;
}

.server-content {
  flex: 1;
}

.server-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.server-url {
  font-size: 12px;
  color: #909399;
}

.server-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.server-item:hover .server-actions {
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

.server-actions-footer .el-button {
  flex: 1;
}

.services-section,
.config-section,
.logs-section {
  background: white;
  margin: 8px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.services-section {
  flex: 0 0 280px;
}

.config-section {
  flex: 1;
  min-height: 400px;
}

.logs-section {
  flex: 0 0 180px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.service-count {
  font-size: 12px;
  color: #909399;
}

.services-table {
  overflow-x: auto;
}

.service-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.service-table th,
.service-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.service-table th {
  background: #fafafa;
  color: #666;
  font-weight: 500;
}

.service-table td {
  color: #333;
}

.config-form {
  padding: 16px;
}

.config-empty {
  padding: 40px 16px;
  text-align: center;
  color: #909399;
}

.logs-container {
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: #1e1e1e;
  color: #d4d4d4;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 2px 0;
  line-height: 1.4;
}

.log-time {
  color: #569cd6;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  width: 50px;
  font-weight: bold;
}

.log-entry.info .log-level {
  color: #4ec9b0;
}

.log-entry.warn .log-level {
  color: #dcdcaa;
}

.log-entry.error .log-level {
  color: #f48771;
}

.log-message {
  flex: 1;
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
  .mcp-layout {
    flex-direction: column;
    overflow-y: auto;
  }

  .mcp-servers-panel {
    width: 100%;
    max-height: 250px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;
  }

  .services-header {
    padding: 12px 16px;
  }

  .services-section {
    flex: 0 0 220px;
    margin: 4px;
  }

  .config-section {
    flex: 1;
    min-height: 400px;
    margin: 4px;
  }

  .logs-section {
    flex: 0 0 150px;
    margin: 4px;
  }
}

@media (max-width: 768px) {
  .mcp-page {
    padding: 16px;
  }

  .mcp-servers-panel {
    max-height: 200px;
  }

  .services-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    padding: 8px 12px;
  }

  .header-controls {
    justify-content: center;
  }

  .panel-header,
  .section-header {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    padding: 8px 12px;
  }

  .header-actions {
    justify-content: center;
  }

  .services-section {
    flex: 0 0 180px;
  }

  .config-section {
    min-height: 400px;
  }

  .logs-section {
    flex: 0 0 120px;
  }
}

</style>