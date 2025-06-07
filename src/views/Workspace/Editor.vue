<template>
  <div class="code-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-select 
          v-model="selectedLanguage" 
          placeholder="选择语言" 
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="lang in languages"
            :key="lang.value"
            :label="lang.label"
            :value="lang.value"
          />
        </el-select>
        
        <el-select 
          v-model="selectedTheme" 
          placeholder="选择主题" 
          size="small"
          style="width: 100px; margin-left: 8px"
        >
          <el-option label="浅色" value="light" />
          <el-option label="暗色" value="dark" />
        </el-select>
      </div>
      
      <div class="toolbar-right">
        <el-button @click="copyCode" size="small" type="primary" plain>
          <el-icon><CopyDocument /></el-icon>
          复制
        </el-button>
        
        <el-button @click="downloadCode" size="small" type="success" plain>
          <el-icon><Download /></el-icon>
          下载
        </el-button>
      </div>
    </div>
    
    <!-- 编辑器主体 -->
    <div class="editor-container" :class="`theme-${selectedTheme}`">
      <!-- 行号 -->
      <div ref="lineNumbers" class="line-numbers"></div>
      
      <!-- 文本编辑区域 -->
      <textarea
        ref="codeEditor"
        v-model="codeContent"
        class="code-textarea"
        @input="onCodeChange"
        @keydown="onKeyDown"
        @scroll="syncScroll"
        spellcheck="false"
        wrap="off"
      ></textarea>
    </div>
    
    <!-- 状态栏 -->
    <div class="editor-status">
      <span>行: {{ currentLine }}, 列: {{ currentColumn }}</span>
      <span>字符数: {{ codeContent.length }}</span>
      <span>语言: {{ selectedLanguage }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument, Download } from '@element-plus/icons-vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  theme: {
    type: String,
    default: 'light'
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change', 'save'])

// 响应式数据
const codeContent = ref('')
const selectedLanguage = ref('javascript')
const selectedTheme = ref('light')
const currentLine = ref(1)
const currentColumn = ref(1)

// 模板引用
const codeEditor = ref(null)
const lineNumbers = ref(null)

// 语言选项
const languages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C#', value: 'csharp' },
  { label: 'PHP', value: 'php' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Vue', value: 'vue' },
  { label: 'React', value: 'jsx' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Shell', value: 'shell' }
]

// 初始化
onMounted(() => {
  codeContent.value = props.modelValue
  selectedLanguage.value = props.language
  selectedTheme.value = props.theme
  
  updateLineNumbers()
  
  // 监听编辑器输入
  if (codeEditor.value) {
    codeEditor.value.addEventListener('input', updateCursorPosition)
    codeEditor.value.addEventListener('keyup', updateCursorPosition)
    codeEditor.value.addEventListener('mouseup', updateCursorPosition)
  }
})

// 监听器
watch(() => props.modelValue, (newVal) => {
  if (newVal !== codeContent.value) {
    codeContent.value = newVal
  }
})

watch(codeContent, (newVal) => {
  emit('update:modelValue', newVal)
  emit('change', newVal)
  updateLineNumbers()
})

// 方法
const onCodeChange = () => {
  updateCursorPosition()
}

const onKeyDown = (event) => {
  // 处理 Tab 键
  if (event.key === 'Tab') {
    event.preventDefault()
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    const spaces = '  ' // 使用2个空格作为缩进
    
    codeContent.value = codeContent.value.substring(0, start) + spaces + codeContent.value.substring(end)
    
    nextTick(() => {
      event.target.selectionStart = event.target.selectionEnd = start + spaces.length
    })
  }
  
  // 处理 Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    emit('save', codeContent.value)
    ElMessage.success('代码已保存')
  }
}

const updateCursorPosition = () => {
  if (!codeEditor.value) return
  
  const textarea = codeEditor.value
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = codeContent.value.substring(0, cursorPos)
  const lines = textBeforeCursor.split('\n')
  
  currentLine.value = lines.length
  currentColumn.value = lines[lines.length - 1].length + 1
}

const updateLineNumbers = () => {
  if (!lineNumbers.value) return
  
  const lines = codeContent.value.split('\n')
  const lineNumbersHtml = lines.map((_, index) => 
    `<div class="line-number">${index + 1}</div>`
  ).join('')
  
  lineNumbers.value.innerHTML = lineNumbersHtml
}

const syncScroll = () => {
  if (!codeEditor.value || !lineNumbers.value) return
  
  const scrollTop = codeEditor.value.scrollTop
  lineNumbers.value.scrollTop = scrollTop
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeContent.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadCode = () => {
  const blob = new Blob([codeContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `code.${getFileExtension(selectedLanguage.value)}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('代码已下载')
}

const getFileExtension = (language) => {
  const extensions = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    csharp: 'cs',
    php: 'php',
    go: 'go',
    rust: 'rs',
    sql: 'sql',
    html: 'html',
    css: 'css',
    vue: 'vue',
    jsx: 'jsx',
    json: 'json',
    xml: 'xml',
    markdown: 'md',
    shell: 'sh'
  }
  return extensions[language] || 'txt'
}
</script>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 6px;
}

.editor-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.line-numbers {
  width: 50px;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 8px 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  text-align: right;
  color: #909399;
  overflow: hidden;
  user-select: none;
}

.line-number {
  height: 21px;
  line-height: 21px;
}

.code-textarea {
  flex: 1;
  padding: 8px 12px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: #fff;
  color: #303133;
  overflow: auto;
}

.theme-dark .line-numbers {
  background-color: #2d2d2d;
  color: #888;
  border-right-color: #404040;
}

.theme-dark .code-textarea {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.editor-status {
  display: flex;
  justify-content: space-between;
  padding: 4px 12px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #909399;
}

.theme-dark .editor-toolbar,
.theme-dark .editor-status {
  background-color: #2d2d2d;
  border-color: #404040;
  color: #d4d4d4;
}
</style>