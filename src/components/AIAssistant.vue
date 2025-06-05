<template>
  <div class="ai-assistant">
    <!-- 头部 -->
    <div class="assistant-header">
      <div class="header-info">
        <el-icon size="20"><ChatDotRound /></el-icon>
        <h3>AI 助手</h3>
      </div>
      <div class="header-actions">
        <el-button size="small" :icon="Delete" @click="clearHistory">清空对话</el-button>
        <el-button size="small" :icon="Setting" @click="showSettings = true">设置</el-button>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="chat-container" ref="chatContainer">
      <div class="message-list">
        <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="{ 'user-message': message.role === 'user', 'assistant-message': message.role === 'assistant' }"
        >
          <div class="message-avatar">
            <el-icon v-if="message.role === 'user'">
              <User />
            </el-icon>
            <el-icon v-else>
              <Monitor />
            </el-icon>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-role">{{ message.role === 'user' ? '用户' : 'AI助手' }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-actions" v-if="message.role === 'assistant'">
              <el-button size="small" text @click="copyMessage(message.content)">
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
              <el-button size="small" text @click="regenerateResponse(message)">
                <el-icon><Refresh /></el-icon>
                重新生成
              </el-button>
            </div>
          </div>
        </div>

        <!-- 加载中状态 -->
        <div v-if="isLoading" class="message-item assistant-message">
          <div class="message-avatar">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="message-content">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-wrapper">
        <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keydown.ctrl.enter="sendMessage"
            :disabled="isLoading"
        />
        <div class="input-actions">
          <el-button size="small" text @click="attachFile">
            <el-icon><Paperclip /></el-icon>
            附件
          </el-button>
          <el-button
              type="primary"
              size="small"
              @click="sendMessage"
              :loading="isLoading"
              :disabled="!inputMessage.trim()"
          >
            发送 (Ctrl+Enter)
          </el-button>
        </div>
      </div>
    </div>

    <!-- 设置对话框 -->
    <el-dialog v-model="showSettings" title="AI助手设置" width="500px">
      <el-form :model="settings" label-width="120px">
        <el-form-item label="模型选择">
          <el-select v-model="settings.model" placeholder="请选择AI模型">
            <el-option label="GPT-4" value="gpt-4" />
            <el-option label="GPT-3.5" value="gpt-3.5-turbo" />
            <el-option label="Claude-3" value="claude-3" />
          </el-select>
        </el-form-item>
        <el-form-item label="温度设置">
          <el-slider v-model="settings.temperature" :min="0" :max="2" :step="0.1" show-input />
          <div class="setting-help">控制回答的创造性，数值越高越有创意</div>
        </el-form-item>
        <el-form-item label="最大令牌数">
          <el-input-number v-model="settings.maxTokens" :min="100" :max="4000" />
          <div class="setting-help">限制单次回答的最大长度</div>
        </el-form-item>
        <el-form-item label="系统提示">
          <el-input
              v-model="settings.systemPrompt"
              type="textarea"
              :rows="4"
              placeholder="定义AI助手的行为和角色..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  User,
  Monitor,
  Delete,
  Setting,
  CopyDocument,
  Refresh,
  Paperclip
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  initialMessages: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits([
  'send-message',
  'clear-history',
  'regenerate-response',
  'attach-file'
])

// 响应式数据
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const showSettings = ref(false)
const chatContainer = ref(null)

const settings = ref({
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: '你是一个专业的AI助手，能够帮助用户解决各种问题。请用友善、专业的语调回答问题。'
})

// 初始化
onMounted(() => {
  messages.value = [...props.initialMessages]
  loadSettings()
})

// 方法
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    role: 'user',
    content: inputMessage.value.trim(),
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const messageContent = inputMessage.value.trim()
  inputMessage.value = ''

  await scrollToBottom()

  isLoading.value = true

  try {
    emit('send-message', {
      message: messageContent,
      settings: settings.value,
      onResponse: (response) => {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        messages.value.push(assistantMessage)
        scrollToBottom()
      },
      onError: (error) => {
        ElMessage.error('发送消息失败：' + error.message)
      },
      onComplete: () => {
        isLoading.value = false
      }
    })
  } catch (error) {
    ElMessage.error('发送消息失败')
    isLoading.value = false
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要清空所有对话历史吗？此操作不可恢复。',
        '确认清空',
        {
          type: 'warning',
          confirmButtonText: '清空',
          cancelButtonText: '取消'
        }
    )
    messages.value = []
    emit('clear-history')
    ElMessage.success('对话历史已清空')
  } catch {
    // 用户取消
  }
}

const regenerateResponse = (message) => {
  // 找到该消息的索引，删除它和之后的所有消息
  const messageIndex = messages.value.findIndex(m => m.id === message.id)
  if (messageIndex > 0) {
    const previousUserMessage = messages.value[messageIndex - 1]
    messages.value = messages.value.slice(0, messageIndex)

    isLoading.value = true
    emit('regenerate-response', {
      message: previousUserMessage.content,
      settings: settings.value,
      onResponse: (response) => {
        const assistantMessage = {
          id: Date.now(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
        messages.value.push(assistantMessage)
        scrollToBottom()
      },
      onError: (error) => {
        ElMessage.error('重新生成失败：' + error.message)
      },
      onComplete: () => {
        isLoading.value = false
      }
    })
  }
}

const copyMessage = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('内容已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const attachFile = () => {
  emit('attach-file')
}

const saveSettings = () => {
  localStorage.setItem('ai-assistant-settings', JSON.stringify(settings.value))
  showSettings.value = false
  ElMessage.success('设置已保存')
}

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('ai-assistant-settings')
    if (saved) {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    }
  } catch {
    // 加载失败，使用默认设置
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMessage = (content) => {
  // 简单的markdown格式化
  return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.ai-assistant {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafbfc;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background-color: #409eff;
  color: white;
  align-self: flex-end;
}

.assistant-message .message-content {
  background-color: white;
  color: #303133;
  border: 1px solid #e4e7ed;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background-color: #409eff;
  color: white;
}

.assistant-message .message-avatar {
  background-color: #67c23a;
  color: white;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  opacity: 0.7;
}

.message-text {
  line-height: 1.6;
  word-wrap: break-word;
}

.message-text code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', monospace;
}

.message-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message-item:hover .message-actions {
  opacity: 1;
}

.loading-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409eff;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loading {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.input-container {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
  }

  .assistant-header {
    padding: 12px;
  }

  .header-info h3 {
    font-size: 14px;
  }

  .input-container {
    padding: 12px;
  }

  .input-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* 滚动条样式 */
.chat-container::-webkit-scrollbar {
  width: 6px;
}

.chat-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>