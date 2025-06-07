<template>
  <div class="llm-page">
    <div class="page-header">
      <h1>大模型配置</h1>
    </div>

    <div class="llm-content">
      <div class="llm-layout">
        <!-- 左侧：大模型列表 -->
        <div class="llm-list-panel">
          <div class="panel-header">
            <h3>名称</h3>
            <el-button size="small" :icon="Plus" @click="addLlm">新增</el-button>
          </div>

          <div class="llm-list">
            <div
                v-for="llm in llmList"
                :key="llm.id"
                :class="['llm-item', { active: llm.id === selectedLlm?.id }]"
                @click="selectLlm(llm)"
            >
              <div class="llm-content">
                <div class="llm-info">
                  <div class="llm-name">{{ llm.name }}</div>
                  <div class="llm-type">{{ llm.type }}</div>
                </div>
                <div class="llm-status">
                  <el-tag
                      :type="llm.status === 'tested' ? 'success' : llm.status === 'failed' ? 'danger' : 'info'"
                      size="small"
                  >
                    {{ llm.status === 'tested'
                      ? '已测试'
                      : llm.status === 'failed'
                          ? '测试失败'
                          : '待测试'
                    }}
                  </el-tag>
                </div>
              </div>
              <div class="llm-actions">
                <el-dropdown trigger="click" @command="cmd => handleLlmCommand(cmd, llm)">
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

        <!-- 右侧：配置表单 -->
        <div class="llm-config-panel">
          <div v-if="selectedLlm" class="llm-form-container">
            <div class="panel-header">
              <h3>配置</h3>
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
                    @click="saveLlm"
                    :loading="saving"
                >
                  保存
                </el-button>
              </div>
            </div>

            <el-form :model="llmForm" label-width="120px" class="llm-form">
              <el-form-item label="名称" required>
                <el-input
                    v-model="llmForm.name"
                    placeholder="请输入大模型名称"
                    @input="onFormChange"
                />
              </el-form-item>

              <el-form-item label="URL" required>
                <el-input
                    v-model="llmForm.url"
                    placeholder="请输入API地址，如: https://api.openai.com/v1"
                    @input="onFormChange"
                />
              </el-form-item>

              <el-form-item label="Token" required>
                <el-input
                    v-model="llmForm.token"
                    type="password"
                    placeholder="请输入API密钥"
                    show-password
                    @input="onFormChange"
                />
              </el-form-item>

              <el-form-item label="Temperature">
                <div class="slider-container">
                  <el-slider
                      v-model="llmForm.temperature"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      :format-tooltip="(val) => `${val}`"
                      style="flex: 1; margin-right: 16px;"
                      @change="onFormChange"
                  />
                  <el-input-number
                      v-model="llmForm.temperature"
                      :min="0"
                      :max="2"
                      :step="0.1"
                      :precision="1"
                      style="width: 120px;"
                      @change="onFormChange"
                  />
                </div>
                <div class="field-description">
                  控制输出的随机性，0为确定性输出，2为最大随机性
                </div>
              </el-form-item>

              <el-form-item label="Max Tokens">
                <div class="slider-container">
                  <el-slider
                      v-model="llmForm.maxTokens"
                      :min="1"
                      :max="32000"
                      :step="100"
                      :format-tooltip="(val) => `${val}`"
                      style="flex: 1; margin-right: 16px;"
                      @change="onFormChange"
                  />
                  <el-input-number
                      v-model="llmForm.maxTokens"
                      :min="1"
                      :max="32000"
                      :step="100"
                      style="width: 120px;"
                      @change="onFormChange"
                  />
                </div>
                <div class="field-description">
                  单次请求的最大令牌数量
                </div>
              </el-form-item>

              <el-form-item label="模型名称">
                <el-select
                    v-model="llmForm.model"
                    placeholder="请选择或输入模型名称"
                    filterable
                    allow-create
                    style="width: 100%"
                    @change="onFormChange"
                >
                  <el-option label="gpt-4o" value="gpt-4o" />
                  <el-option label="gpt-4o-mini" value="gpt-4o-mini" />
                  <el-option label="gpt-3.5-turbo" value="gpt-3.5-turbo" />
                  <el-option label="claude-3.5-sonnet" value="claude-3-5-sonnet-20241022" />
                  <el-option label="claude-3-haiku" value="claude-3-haiku-20240307" />
                  <el-option label="gemini-pro" value="gemini-pro" />
                  <el-option label="llama-2-70b" value="llama-2-70b-chat" />
                </el-select>
              </el-form-item>

              <el-form-item label="系统提示词">
                <el-input
                    v-model="llmForm.systemPrompt"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入系统提示词"
                    @input="onFormChange"
                />
              </el-form-item>

              <el-form-item label="描述">
                <el-input
                    v-model="llmForm.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入大模型描述"
                    @input="onFormChange"
                />
              </el-form-item>

              <el-form-item label="高级设置">
                <el-collapse>
                  <el-collapse-item title="更多参数" name="advanced">
                    <el-form-item label="Top P">
                      <div class="slider-container">
                        <el-slider
                            v-model="llmForm.topP"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            :format-tooltip="(val) => `${val}`"
                            style="flex: 1; margin-right: 16px;"
                            @change="onFormChange"
                        />
                        <el-input-number
                            v-model="llmForm.topP"
                            :min="0"
                            :max="1"
                            :step="0.1"
                            :precision="1"
                            style="width: 120px;"
                            @change="onFormChange"
                        />
                      </div>
                    </el-form-item>

                    <el-form-item label="Frequency Penalty">
                      <div class="slider-container">
                        <el-slider
                            v-model="llmForm.frequencyPenalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            :format-tooltip="(val) => `${val}`"
                            style="flex: 1; margin-right: 16px;"
                            @change="onFormChange"
                        />
                        <el-input-number
                            v-model="llmForm.frequencyPenalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            :precision="1"
                            style="width: 120px;"
                            @change="onFormChange"
                        />
                      </div>
                    </el-form-item>

                    <el-form-item label="Presence Penalty">
                      <div class="slider-container">
                        <el-slider
                            v-model="llmForm.presencePenalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            :format-tooltip="(val) => `${val}`"
                            style="flex: 1; margin-right: 16px;"
                            @change="onFormChange"
                        />
                        <el-input-number
                            v-model="llmForm.presencePenalty"
                            :min="-2"
                            :max="2"
                            :step="0.1"
                            :precision="1"
                            style="width: 120px;"
                            @change="onFormChange"
                        />
                      </div>
                    </el-form-item>

                    <el-form-item label="超时时间 (秒)">
                      <el-input-number
                          v-model="llmForm.timeout"
                          :min="1"
                          :max="300"
                          style="width: 120px;"
                          @change="onFormChange"
                      />
                    </el-form-item>

                    <el-form-item label="重试次数">
                      <el-input-number
                          v-model="llmForm.retries"
                          :min="0"
                          :max="10"
                          style="width: 120px;"
                          @change="onFormChange"
                      />
                    </el-form-item>
                  </el-collapse-item>
                </el-collapse>
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="llm-empty">
            <el-icon size="64"><Monitor /></el-icon>
            <p>请选择或创建一个大模型配置</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 连接测试结果对话框 -->
    <el-dialog
        v-model="showTestResult"
        title="连接测试结果"
        width="600px"
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
        <div v-if="testResult.response" class="result-response">
          <h4>模型响应：</h4>
          <div class="response-content">{{ testResult.response }}</div>
        </div>
        <div v-if="testResult.error" class="result-error">
          <h4>错误详情：</h4>
          <pre>{{ testResult.error }}</pre>
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
  Monitor,
  CircleCheck,
  CircleClose,
  CopyDocument
} from '@element-plus/icons-vue'

// 响应式数据
const llmList = ref([])
const selectedLlm = ref(null)
const testing = ref(false)
const saving = ref(false)
const showTestResult = ref(false)

// status: "untested" | "tested" | "failed"
const llmForm = reactive({
  id: null,
  name: '',
  url: '',
  token: '',
  model: '',
  temperature: 0.7,
  maxTokens: 4096,
  topP: 1.0,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  systemPrompt: '',
  description: '',
  timeout: 30,
  retries: 3,
  status: 'untested'
})

const testResult = reactive({
  success: false,
  message: '',
  response: '',
  error: ''
})

// 初始化数据
onMounted(() => {
  loadLlmList()
})

const loadLlmList = () => {
  // 模拟数据
  llmList.value = [
    {
      id: 1,
      name: 'GPT-4',
      type: 'OpenAI',
      url: 'https://api.openai.com/v1',
      model: 'gpt-4o',
      status: 'tested',
      temperature: 0.7,
      maxTokens: 4096,
      description: 'OpenAI GPT-4 模型'
    },
    {
      id: 2,
      name: 'Claude-3.5',
      type: 'Anthropic',
      url: 'https://api.anthropic.com',
      model: 'claude-3-5-sonnet-20241022',
      status: 'tested',
      temperature: 0.5,
      maxTokens: 8192,
      description: 'Anthropic Claude 3.5 模型'
    },
    {
      id: 3,
      name: 'Gemini Pro',
      type: 'Google',
      url: 'https://generativelanguage.googleapis.com/v1',
      model: 'gemini-pro',
      status: 'untested',
      temperature: 0.8,
      maxTokens: 2048,
      description: 'Google Gemini Pro 模型'
    }
  ]

  if (llmList.value.length > 0) {
    selectLlm(llmList.value[0])
  }
}

const selectLlm = (llm) => {
  selectedLlm.value = llm
  // 填充表单
  Object.assign(llmForm, {
    id: llm.id,
    name: llm.name,
    url: llm.url,
    token: llm.token || '',
    model: llm.model,
    temperature: llm.temperature || 0.7,
    maxTokens: llm.maxTokens || 4096,
    topP: llm.topP || 1.0,
    frequencyPenalty: llm.frequencyPenalty || 0.0,
    presencePenalty: llm.presencePenalty || 0.0,
    systemPrompt: llm.systemPrompt || '',
    description: llm.description || '',
    timeout: llm.timeout || 30,
    retries: llm.retries || 3,
    status: llm.status || 'untested'
  })
}

// 表单内容变化时，状态恢复为“待测试”
const onFormChange = () => {
  if (selectedLlm.value && selectedLlm.value.status !== 'untested') {
    selectedLlm.value.status = 'untested'
  }
  llmForm.status = 'untested'
}

const addLlm = () => {
  selectedLlm.value = null
  Object.assign(llmForm, {
    id: null,
    name: '',
    url: '',
    token: '',
    model: '',
    temperature: 0.7,
    maxTokens: 4096,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPrompt: '',
    description: '',
    timeout: 30,
    retries: 3,
    status: 'untested'
  })
}

const saveLlm = () => {
  if (!llmForm.name.trim()) {
    ElMessage.warning('请输入大模型名称')
    return
  }

  if (!llmForm.url.trim() || !llmForm.token.trim()) {
    ElMessage.warning('请填写API地址和密钥')
    return
  }

  saving.value = true

  setTimeout(() => {
    if (llmForm.id) {
      // 更新现有大模型
      const index = llmList.value.findIndex(llm => llm.id === llmForm.id)
      if (index > -1) {
        llmList.value[index] = { ...llmForm, type: getProviderType(llmForm.url) }
        selectedLlm.value = llmList.value[index]
      }
      ElMessage.success('大模型配置更新成功')
    } else {
      // 创建新大模型
      const newLlm = {
        ...llmForm,
        id: Date.now(),
        type: getProviderType(llmForm.url),
        status: 'untested'
      }
      llmList.value.push(newLlm)
      selectedLlm.value = newLlm
      llmForm.id = newLlm.id
      ElMessage.success('大模型配置创建成功')
    }
    saving.value = false
  }, 500)
}

const getProviderType = (url) => {
  if (url.includes('openai.com')) return 'OpenAI'
  if (url.includes('anthropic.com')) return 'Anthropic'
  if (url.includes('googleapis.com')) return 'Google'
  if (url.includes('azure.com')) return 'Azure'
  return 'Custom'
}

const testConnection = () => {
  if (!llmForm.url.trim() || !llmForm.token.trim()) {
    ElMessage.warning('请填写API地址和密钥后再测试')
    return
  }

  testing.value = true

  // 模拟连接测试
  setTimeout(() => {
    const success = Math.random() > 0.2 // 80%成功率

    testResult.success = success
    testResult.message = success
        ? '模型连接测试成功！API可以正常使用。'
        : '连接失败，请检查API地址和密钥是否正确。'
    testResult.response = success
        ? '你好！我是AI助手，很高兴为您服务。这是一个测试响应，表明API连接正常。'
        : ''
    testResult.error = success
        ? ''
        : `HTTP 401: Unauthorized\nInvalid API key provided.\nURL: ${llmForm.url}`

    // 更新大模型状态
    if (selectedLlm.value) {
      selectedLlm.value.status = success ? 'tested' : 'failed'
      llmForm.status = selectedLlm.value.status
      const index = llmList.value.findIndex(llm => llm.id === selectedLlm.value.id)
      if (index > -1) {
        llmList.value[index].status = selectedLlm.value.status
      }
    }

    testing.value = false
    showTestResult.value = true
  }, 2000)
}

const handleLlmCommand = async (command, llm) => {
  switch (command) {
    case 'test':
      selectLlm(llm)
      testConnection()
      break

    case 'edit':
      selectLlm(llm)
      break

    case 'duplicate':
      const duplicated = {
        ...llm,
        id: Date.now(),
        name: `${llm.name} (副本)`,
        status: 'untested'
      }
      llmList.value.push(duplicated)
      ElMessage.success('大模型配置复制成功')
      break

    case 'delete':
      try {
        await ElMessageBox.confirm(
            `确定要删除大模型配置 "${llm.name}" 吗？`,
            '确认删除',
            { type: 'warning' }
        )

        const index = llmList.value.findIndex(l => l.id === llm.id)
        if (index > -1) {
          llmList.value.splice(index, 1)
          if (selectedLlm.value?.id === llm.id) {
            selectedLlm.value = llmList.value[0] || null
            if (selectedLlm.value) {
              selectLlm(selectedLlm.value)
            }
          }
          ElMessage.success('大模型配置删除成功')
        }
      } catch {
        // 用户取消
      }
      break
  }
}
</script>
<style scoped>
.llm-page {
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

.llm-content {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.llm-layout {
  width:100%;
  display: flex;
  height: 100%;
}

.llm-list-panel {
  width: 280px;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafbfc;
}

.llm-config-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
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

.llm-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.llm-item {
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

.llm-item:hover {
  background-color: #f5f7fa;
}

.llm-item.active {
  background-color: #e6f4ff;
  border-color: #409eff;
}

.llm-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.llm-info {
  flex: 1;
}

.llm-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.llm-type {
  font-size: 12px;
  color: #909399;
}

.llm-status {
  margin-right: 8px;
}

.llm-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.llm-item:hover .llm-actions {
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

.llm-form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.llm-form {
  flex: 1;
  padding: 24px;
  width: 100%;
  overflow-y: auto;
}

.llm-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.llm-empty p {
  margin-top: 16px;
  font-size: 16px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width:100%
}

.field-description {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
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
  line-height: 1.5;
}

.result-response h4,
.result-error h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.response-content {
  background: #f0f9ff;
  padding: 12px;
  border-radius: 4px;
  color: #0369a1;
  line-height: 1.5;
  border-left: 3px solid #0ea5e9;
}

.result-error pre {
  background: #fef2f2;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #dc2626;
  white-space: pre-wrap;
  border-left: 3px solid #ef4444;
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

/* Element Plus 样式覆盖 */
:deep(.el-slider__runway) {
  margin: 16px 0;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .llm-layout {
    width:100%;
    flex-direction: column;
  }

  .llm-list-panel {
    width: 100%;
    max-height: 300px;
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
}

@media (max-width: 768px) {
  .llm-page {
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

  .slider-container {
    flex-direction: column;
    align-items: stretch;
  }
}
:deep(.el-form-item__label) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 140px !important; /* 推荐 120~160 之间，按实际需求调整 */
  padding-right: 8px;
}
/* 保证 collapse 内容区撑满宽度 */
:deep(.el-collapse-item__content) {
  padding: 0 24px 16px 24px;
  width: 100%;
  box-sizing: border-box;
}
:deep(.el-form-item__content > .el-collapse) {
  width: 100% !important;
}
:deep(.el-collapse-item__header) {
  width: fit-content !important;
}
</style>