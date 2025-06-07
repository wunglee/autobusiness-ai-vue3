<template>
  <div
      class="agent-team-chat"
      :style="chatStyle"
      :class="{ 'maximized': isMaximized }"
  >
    <!-- 标题栏 -->
    <div
        class="chat-header"
        @mousedown="startDrag"
    >
      <div class="header-left">
        <div class="window-controls">
          <button class="control-btn minimize" @click="handleMinimize" title="最小化">
            <span></span>
          </button>
          <button class="control-btn maximize" @click="handleMaximize" title="最大化">
            <span></span>
          </button>
        </div>
        <h3 class="chat-title">智能体团队</h3>
      </div>
      <div class="header-right">
        <el-button size="small" :icon="Setting" circle @click="showSettings = true" />
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="chat-body" ref="chatBody">
      <div class="message-list">
        <div
            v-for="message in messages"
            :key="message.id"
            class="message-item"
            :class="{ 'user-message': message.role === 'user', 'agent-message': message.role === 'agent' }"
        >
          <div class="message-avatar" v-if="message.role === 'agent'">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="message-content">
            <div class="message-header" v-if="message.role === 'agent'">
              <span class="agent-name">{{ message.agentName }}</span>
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            </div>
            <div class="message-text">{{ message.content }}</div>
          </div>
          <div class="message-avatar" v-if="message.role === 'user'">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-footer">
      <div class="input-area">
        <div
            ref="messageInput"
            class="message-input"
            contenteditable="true"
            @input="handleInput"
            @keydown="handleKeyDown"
            @blur="handleBlur"
            :placeholder="inputPlaceholder"
        ></div>
        <el-button
            type="primary"
            @click="sendMessage"
            :disabled="!hasContent"
        >
          发送
        </el-button>
      </div>
    </div>

    <!-- @提及菜单 -->
    <div
        v-if="showMentionMenu"
        class="mention-menu"
        :style="mentionMenuStyle"
    >
      <div class="mention-list">
        <div
            v-for="agent in filteredAgents"
            :key="agent.id"
            class="mention-item"
            @click="selectMention(agent)"
        >
          <el-icon class="agent-icon"><Avatar /></el-icon>
          <span>{{ agent.name }}</span>
        </div>
        <el-divider />
        <div class="mention-item" @click="openAgentManager">
          <el-icon><Setting /></el-icon>
          <span>管理智能体</span>
        </div>
      </div>
    </div>

    <!-- MCP工具列表弹出层 -->
    <el-popover
        v-model:visible="showToolsPopover"
        placement="top"
        width="300"
        trigger="click"
        :virtual-ref="toolsButtonRef"
        virtual-triggering
    >
      <div class="mcp-tools-list">
        <h4>{{ currentAgent?.name }} - MCP工具</h4>
        <el-divider />
        <div v-for="tool in currentAgentTools" :key="tool.id" class="tool-item">
          <el-icon><Tools /></el-icon>
          <span>{{ tool.name }}</span>
        </div>
      </div>
    </el-popover>

    <!-- 调整大小手柄 -->
    <div
        v-if="!isMaximized"
        class="resize-handle resize-n"
        @mousedown="startResize('n')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-e"
        @mousedown="startResize('e')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-s"
        @mousedown="startResize('s')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-w"
        @mousedown="startResize('w')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-ne"
        @mousedown="startResize('ne')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-se"
        @mousedown="startResize('se')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-sw"
        @mousedown="startResize('sw')"
    ></div>
    <div
        v-if="!isMaximized"
        class="resize-handle resize-nw"
        @mousedown="startResize('nw')"
    ></div>

    <!-- 智能体管理对话框 -->
    <el-dialog
        v-model="showAgentManager"
        title="智能体工具"
        width="900px"
        :append-to-body="true"
    >
      <div class="agent-manager-dual">
        <div class="agent-list-section">
          <div class="section-header">
            <h4>备选智能体</h4>
            <el-input
                v-model="searchKeyword"
                placeholder="搜索智能体"
                :prefix-icon="Search"
                size="small"
                style="width: 200px"
            />
          </div>
          <div class="agent-list available-list">
            <div
                v-for="agent in availableAgentList"
                :key="agent.id"
                class="agent-row"
                @click="addToSelected(agent)"
            >
              <el-icon class="agent-avatar"><Avatar /></el-icon>
              <div class="agent-info">
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-desc">{{ agent.description }}</div>
              </div>
              <el-button
                  text
                  :icon="MoreFilled"
                  circle
                  size="small"
                  @click.stop="showAgentDetail(agent)"
              />
            </div>
          </div>
        </div>

        <div class="agent-transfer-buttons">
          <el-button :icon="ArrowRight" circle @click="addAllToSelected" />
          <el-button :icon="ArrowLeft" circle @click="removeAllFromSelected" />
        </div>

        <div class="agent-list-section">
          <div class="section-header">
            <h4>已选智能体</h4>
            <span class="selected-count">{{ selectedAgentList.length }} 个</span>
          </div>
          <div class="agent-list selected-list">
            <div
                v-for="agent in selectedAgentList"
                :key="agent.id"
                class="agent-row"
                @click="removeFromSelected(agent)"
            >
              <el-icon class="agent-avatar"><Avatar /></el-icon>
              <div class="agent-info">
                <div class="agent-name">{{ agent.name }}</div>
                <div class="agent-desc">{{ agent.description }}</div>
              </div>
              <el-button
                  text
                  :icon="MoreFilled"
                  circle
                  size="small"
                  @click.stop="showAgentDetail(agent)"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="showAgentManager = false">取消</el-button>
        <el-button type="primary" @click="saveAgentSelection">保存</el-button>
      </template>
    </el-dialog>

    <!-- 智能体详情对话框 -->
    <el-dialog
        v-model="showDetailDialog"
        :title="detailAgent?.name"
        width="600px"
        :append-to-body="true"
    >
      <div v-if="detailAgent" class="agent-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ detailAgent.name }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ detailAgent.description }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ detailAgent.type || '通用助手' }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ detailAgent.version || '1.0.0' }}</el-descriptions-item>
          <el-descriptions-item label="MCP工具">
            <el-tag v-for="tool in detailAgent.tools" :key="tool" size="small" style="margin-right: 8px">
              {{ tool }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailAgent.createTime || '2024-01-01' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Monitor,
  User,
  Avatar,
  Setting,
  Tools,
  Search,
  MoreFilled,
  ArrowRight,
  ArrowLeft
} from '@element-plus/icons-vue'

// 响应式数据
const messages = ref([])
const messageInput = ref(null)
const inputPlaceholder = '输入消息，使用 @ 提及智能体...'
const hasContent = ref(false)
const mentionedAgents = ref([]) // 存储已提及的智能体

// @提及相关
const showMentionMenu = ref(false)
const mentionMenuStyle = ref({})
const mentionKeyword = ref('')
const currentMentionPosition = ref(0)

// 智能体列表
const allAgents = ref([
  { id: 1, name: 'XX助手', description: '专业的编程助手', type: '编程助手', tools: ['代码生成', '代码优化', '错误检查'] },
  { id: 2, name: 'YY助手', description: '数据分析专家', type: '数据分析', tools: ['数据清洗', '统计分析', '可视化'] },
  { id: 3, name: 'CC助手', description: '文档编写助手', type: '文档助手', tools: ['文档生成', '格式转换', '翻译'] },
  { id: 4, name: '管理智能体', description: '团队协作管理', type: '管理工具', tools: ['任务分配', '进度跟踪'] }
])

const availableAgentList = ref([...allAgents.value])
const selectedAgentList = ref([])

const showAgentManager = ref(false)
const showDetailDialog = ref(false)
const detailAgent = ref(null)
const searchKeyword = ref('')

// MCP工具相关
const showToolsPopover = ref(false)
const currentAgent = ref(null)
const currentAgentTools = ref([])
const toolsButtonRef = ref(null)

// 窗口状态
const isMaximized = ref(false)
const position = reactive({
  x: window.innerWidth - 600,
  y: 100,
  width: 500,
  height: 600
})
const savedPosition = reactive({
  x: 0,
  y: 0,
  width: 500,
  height: 600
})

// 拖拽相关
const isDragging = ref(false)
const isResizing = ref(false)
const resizeDirection = ref('')
const dragStart = reactive({ x: 0, y: 0 })
const initialPos = reactive({ x: 0, y: 0, width: 0, height: 0 })

// Emits
const emit = defineEmits(['minimize', 'close'])

// 计算样式
const chatStyle = computed(() => {
  if (isMaximized.value) {
    return {
      top: '64px',
      left: '0',
      right: '0',
      bottom: '0',
      width: 'auto',
      height: 'auto'
    }
  }
  return {
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${position.width}px`,
    height: `${position.height}px`
  }
})

// 过滤的智能体列表（用于@提及）
const filteredAgents = computed(() => {
  if (!mentionKeyword.value) return selectedAgentList.value
  const keyword = mentionKeyword.value.toLowerCase()
  return selectedAgentList.value.filter(agent =>
      agent.name.toLowerCase().includes(keyword)
  )
})

// 窗口控制方法
const handleMinimize = () => {
  emit('minimize')
}

const handleMaximize = () => {
  if (!isMaximized.value) {
    savedPosition.x = position.x
    savedPosition.y = position.y
    savedPosition.width = position.width
    savedPosition.height = position.height
  } else {
    position.x = savedPosition.x
    position.y = savedPosition.y
    position.width = savedPosition.width
    position.height = savedPosition.height
  }
  isMaximized.value = !isMaximized.value
}

// 拖拽功能
const startDrag = (e) => {
  if (isMaximized.value || e.target.closest('.window-controls')) return

  isDragging.value = true
  dragStart.x = e.clientX - position.x
  dragStart.y = e.clientY - position.y

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const handleDrag = (e) => {
  if (!isDragging.value) return

  position.x = e.clientX - dragStart.x
  position.y = e.clientY - dragStart.y

  // 限制在窗口内
  position.x = Math.max(0, Math.min(window.innerWidth - position.width, position.x))
  position.y = Math.max(64, Math.min(window.innerHeight - position.height, position.y))
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 调整大小功能
const startResize = (direction) => {
  isResizing.value = true
  resizeDirection.value = direction
  initialPos.x = position.x
  initialPos.y = position.y
  initialPos.width = position.width
  initialPos.height = position.height

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e) => {
  if (!isResizing.value) return

  const minWidth = 400
  const minHeight = 300

  switch (resizeDirection.value) {
    case 'e':
      position.width = Math.max(minWidth, initialPos.width + (e.clientX - (initialPos.x + initialPos.width)))
      break
    case 'w':
      const newWidth = initialPos.width - (e.clientX - initialPos.x)
      if (newWidth >= minWidth) {
        position.width = newWidth
        position.x = e.clientX
      }
      break
    case 's':
      position.height = Math.max(minHeight, initialPos.height + (e.clientY - (initialPos.y + initialPos.height)))
      break
    case 'n':
      const newHeight = initialPos.height - (e.clientY - initialPos.y)
      if (newHeight >= minHeight) {
        position.height = newHeight
        position.y = e.clientY
      }
      break
    case 'se':
      position.width = Math.max(minWidth, initialPos.width + (e.clientX - (initialPos.x + initialPos.width)))
      position.height = Math.max(minHeight, initialPos.height + (e.clientY - (initialPos.y + initialPos.height)))
      break
    case 'sw':
      const swWidth = initialPos.width - (e.clientX - initialPos.x)
      if (swWidth >= minWidth) {
        position.width = swWidth
        position.x = e.clientX
      }
      position.height = Math.max(minHeight, initialPos.height + (e.clientY - (initialPos.y + initialPos.height)))
      break
    case 'ne':
      position.width = Math.max(minWidth, initialPos.width + (e.clientX - (initialPos.x + initialPos.width)))
      const neHeight = initialPos.height - (e.clientY - initialPos.y)
      if (neHeight >= minHeight) {
        position.height = neHeight
        position.y = e.clientY
      }
      break
    case 'nw':
      const nwWidth = initialPos.width - (e.clientX - initialPos.x)
      const nwHeight = initialPos.height - (e.clientY - initialPos.y)
      if (nwWidth >= minWidth) {
        position.width = nwWidth
        position.x = e.clientX
      }
      if (nwHeight >= minHeight) {
        position.height = nwHeight
        position.y = e.clientY
      }
      break
  }
}

const stopResize = () => {
  isResizing.value = false
  resizeDirection.value = ''
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 输入处理
const handleInput = (e) => {
  const text = messageInput.value.innerText
  hasContent.value = text.trim().length > 0

  // 检测@符号
  const selection = window.getSelection()
  const cursorPosition = selection.focusOffset
  const textBeforeCursor = text.substring(0, cursorPosition)
  const lastAtIndex = textBeforeCursor.lastIndexOf('@')

  if (lastAtIndex !== -1 && cursorPosition > lastAtIndex) {
    const textAfterAt = text.substring(lastAtIndex + 1, cursorPosition)
    // 检查@后面是否有空格或其他终止符
    if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
      mentionKeyword.value = textAfterAt
      currentMentionPosition.value = lastAtIndex
      showMentionMenuAtCursor()
    } else {
      showMentionMenu.value = false
    }
  } else {
    showMentionMenu.value = false
  }
}

const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  } else if (e.key === 'Escape' && showMentionMenu.value) {
    showMentionMenu.value = false
  }
}

const handleBlur = () => {
  // 延迟关闭，以便点击菜单项
  setTimeout(() => {
    showMentionMenu.value = false
  }, 200)
}

// 显示@提及菜单
const showMentionMenuAtCursor = () => {
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  const chatRect = messageInput.value.getBoundingClientRect()

  mentionMenuStyle.value = {
    left: `${rect.left - chatRect.left}px`,
    bottom: `${chatRect.bottom - rect.bottom + 30}px`
  }
  showMentionMenu.value = true
}

// 选择提及的智能体
const selectMention = (agent) => {
  const text = messageInput.value.innerText
  const beforeMention = text.substring(0, currentMentionPosition.value)
  const afterMention = text.substring(currentMentionPosition.value + mentionKeyword.value.length + 1)

  // 创建智能体按钮
  const agentButton = createAgentButton(agent)

  // 重构输入框内容
  messageInput.value.innerHTML = ''
  messageInput.value.appendChild(document.createTextNode(beforeMention))
  messageInput.value.appendChild(agentButton)
  messageInput.value.appendChild(document.createTextNode(' '))
  if (afterMention) {
    messageInput.value.appendChild(document.createTextNode(afterMention))
  }

  // 将光标移到按钮后面
  const range = document.createRange()
  const selection = window.getSelection()
  range.setStartAfter(messageInput.value.lastChild)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  showMentionMenu.value = false
  mentionedAgents.value.push(agent)
  hasContent.value = true
}

// 创建智能体按钮元素
const createAgentButton = (agent) => {
  const button = document.createElement('span')
  button.className = 'agent-mention-button'
  button.contentEditable = 'false'
  button.dataset.agentId = agent.id
  button.dataset.agentName = agent.name

  const nameSpan = document.createElement('span')
  nameSpan.textContent = agent.name

  const iconSpan = document.createElement('span')
  iconSpan.className = 'agent-icon-button'
  iconSpan.innerHTML = '📎'
  iconSpan.onclick = (e) => {
    e.stopPropagation()
    showAgentTools(agent, iconSpan)
  }

  button.appendChild(nameSpan)
  button.appendChild(iconSpan)

  return button
}

// 显示智能体工具
const showAgentTools = (agent, buttonElement) => {
  currentAgent.value = agent
  currentAgentTools.value = agent.tools.map((tool, index) => ({
    id: index + 1,
    name: tool
  }))
  toolsButtonRef.value = buttonElement
  showToolsPopover.value = true
}

// 打开智能体管理
const openAgentManager = () => {
  showMentionMenu.value = false
  showAgentManager.value = true
}

// 智能体管理功能
const addToSelected = (agent) => {
  if (!selectedAgentList.value.find(a => a.id === agent.id)) {
    selectedAgentList.value.push(agent)
  }
}

const removeFromSelected = (agent) => {
  const index = selectedAgentList.value.findIndex(a => a.id === agent.id)
  if (index > -1) {
    selectedAgentList.value.splice(index, 1)
  }
}

const addAllToSelected = () => {
  availableAgentList.value.forEach(agent => {
    if (!selectedAgentList.value.find(a => a.id === agent.id)) {
      selectedAgentList.value.push(agent)
    }
  })
}

const removeAllFromSelected = () => {
  selectedAgentList.value = []
}

const showAgentDetail = (agent) => {
  detailAgent.value = agent
  showDetailDialog.value = true
}

const saveAgentSelection = () => {
  showAgentManager.value = false
  ElMessage.success('智能体配置已保存')
}

// 发送消息
const sendMessage = () => {
  const content = extractMessageContent()
  if (!content.text.trim() && content.mentions.length === 0) return

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: content.text,
    mentions: content.mentions,
    timestamp: new Date()
  })

  // 清空输入框
  messageInput.value.innerHTML = ''
  hasContent.value = false
  mentionedAgents.value = []

  // 模拟智能体回复
  if (content.mentions.length > 0) {
    content.mentions.forEach((agent, index) => {
      setTimeout(() => {
        messages.value.push({
          id: Date.now() + index,
          role: 'agent',
          agentName: agent.name,
          content: `收到您的消息，我是${agent.name}，正在为您处理...`,
          timestamp: new Date()
        })
        scrollToBottom()
      }, 300 + index * 500)
    })
  }

  scrollToBottom()
}

// 提取消息内容
const extractMessageContent = () => {
  const text = messageInput.value.innerText
  const mentions = []

  // 提取所有提及的智能体
  const buttons = messageInput.value.querySelectorAll('.agent-mention-button')
  buttons.forEach(button => {
    const agent = selectedAgentList.value.find(a => a.id == button.dataset.agentId)
    if (agent) mentions.push(agent)
  })

  return { text, mentions }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  // 初始化消息
  messages.value = [
    {
      id: 1,
      role: 'agent',
      agentName: '系统',
      content: '欢迎使用智能体团队群聊！使用 @ 可以提及智能体。',
      timestamp: new Date()
    }
  ]

  // 初始化选中的智能体（默认选中前两个）
  selectedAgentList.value = [allAgents.value[0], allAgents.value[1]]
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped>
.agent-team-chat {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: none;
}

.agent-team-chat.maximized {
  border-radius: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
  cursor: move;
  user-select: none;
}

.maximized .chat-header {
  border-radius: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  position: relative;
  transition: opacity 0.2s;
}

.control-btn:hover {
  opacity: 0.8;
}

.control-btn.minimize {
  background: #ffbd2e;
}

.control-btn.maximize {
  background: #27c93f;
}

.control-btn.minimize span {
  position: absolute;
  left: 2px;
  top: 8px;
  width: 10px;
  height: 2px;
  background: rgba(0, 0, 0, 0.5);
}

.control-btn.maximize span {
  position: absolute;
  left: 3px;
  top: 3px;
  width: 8px;
  height: 8px;
  border: 2px solid rgba(0, 0, 0, 0.5);
  border-radius: 1px;
}

.chat-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #fafbfc;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.agent-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-message .message-avatar {
  background: #409eff;
  color: white;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-message .message-content {
  background: #409eff;
  color: white;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.agent-name {
  font-weight: 500;
  color: #667eea;
}

.message-text {
  line-height: 1.5;
}

.chat-footer {
  border-top: 1px solid #e4e7ed;
  background: white;
  padding: 12px;
  border-radius: 0 0 8px 8px;
  position: relative;
}

.maximized .chat-footer {
  border-radius: 0;
}

.input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 60px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  line-height: 1.5;
  position: relative;
}

.message-input:focus {
  border-color: #409eff;
}

.message-input:empty:before {
  content: attr(placeholder);
  color: #c0c4cc;
  pointer-events: none;
}

/* 智能体按钮样式 */
.message-input :deep(.agent-mention-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  margin: 0 2px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  color: #409eff;
  font-size: 14px;
  cursor: default;
  user-select: none;
  vertical-align: middle;
}

.message-input :deep(.agent-icon-button) {
  cursor: pointer;
  font-size: 12px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.message-input :deep(.agent-icon-button:hover) {
  opacity: 1;
}

/* @提及菜单 */
.mention-menu {
  position: absolute;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.mention-list {
  padding: 4px 0;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.mention-item:hover {
  background: #f5f7fa;
}

.mention-item .agent-icon {
  font-size: 20px;
  color: #667eea;
}

/* 调整大小手柄 */
.resize-handle {
  position: absolute;
  background: transparent;
}

.resize-n {
  top: -3px;
  left: 10px;
  right: 10px;
  height: 6px;
  cursor: n-resize;
}

.resize-e {
  top: 10px;
  right: -3px;
  bottom: 10px;
  width: 6px;
  cursor: e-resize;
}

.resize-s {
  bottom: -3px;
  left: 10px;
  right: 10px;
  height: 6px;
  cursor: s-resize;
}

.resize-w {
  top: 10px;
  left: -3px;
  bottom: 10px;
  width: 6px;
  cursor: w-resize;
}

.resize-ne {
  top: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  cursor: ne-resize;
}

.resize-se {
  bottom: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  cursor: se-resize;
}

.resize-sw {
  bottom: -3px;
  left: -3px;
  width: 10px;
  height: 10px;
  cursor: sw-resize;
}

.resize-nw {
  top: -3px;
  left: -3px;
  width: 10px;
  height: 10px;
  cursor: nw-resize;
}

/* 智能体管理双列表样式 */
.agent-manager-dual {
  display: flex;
  gap: 20px;
  align-items: stretch;
  height: 500px;
}

.agent-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.selected-count {
  font-size: 14px;
  color: #909399;
}

.agent-list {
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow-y: auto;
  background: #fafbfc;
}

.agent-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background 0.2s;
}

.agent-row:hover {
  background: #f5f7fa;
}

.agent-row:last-child {
  border-bottom: none;
}

.agent-avatar {
  font-size: 28px;
  color: #667eea;
  margin-right: 12px;
}

.agent-info {
  flex: 1;
}

.agent-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.agent-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.agent-transfer-buttons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 8px;
}

/* 智能体详情样式 */
.agent-detail {
  padding: 16px;
}

/* MCP工具列表样式 */
.mcp-tools-list h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.tool-item:hover {
  background: #f5f7fa;
}

/* 滚动条样式 */
.chat-body::-webkit-scrollbar,
.message-input::-webkit-scrollbar,
.mention-menu::-webkit-scrollbar,
.agent-list::-webkit-scrollbar {
  width: 6px;
}

.chat-body::-webkit-scrollbar-track,
.message-input::-webkit-scrollbar-track,
.mention-menu::-webkit-scrollbar-track,
.agent-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb,
.message-input::-webkit-scrollbar-thumb,
.mention-menu::-webkit-scrollbar-thumb,
.agent-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chat-body::-webkit-scrollbar-thumb:hover,
.message-input::-webkit-scrollbar-thumb:hover,
.mention-menu::-webkit-scrollbar-thumb:hover,
.agent-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>