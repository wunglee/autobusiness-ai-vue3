<template>
  <div class="type-list">
    <div class="panel-header">
      <h4 class="panel-title">任务类型</h4>
      <div class="search-box">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索类型..."
            size="small"
            :prefix-icon="Search"
            clearable
        />
      </div>
      <el-button
          type="primary"
          size="small"
          :icon="Plus"
          @click="handleCreate"
          class="add-type-btn"
      >
        新建类型
      </el-button>
    </div>

    <div class="type-items">
      <div
          v-for="type in filteredTypes"
          :key="type.id"
          :class="['type-item', { active: type.id === currentTypeId }]"
          @click="handleSelect(type.id)"
      >
        <div class="type-icon" :style="{ background: type.color }">
          {{ type.icon }}
        </div>
        <div class="type-info">
          <div class="type-name">
            {{ type.name }}
            <el-tag v-if="type.isSystemType" size="small" type="info">系统</el-tag>
          </div>
          <div class="type-desc">{{ type.description || '暂无描述' }}</div>
          <div class="type-meta">
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(type.createdAt) }}
            </span>
            <span class="meta-item">
              <el-icon><DocumentCopy /></el-icon>
              {{ type.statuses?.length || 0 }} 个状态
            </span>
          </div>
        </div>
        <div class="type-actions" @click.stop>
          <el-dropdown trigger="click" @command="(command) => handleCommand(command, type)">
            <el-button type="text" :icon="MoreFilled" size="small" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="duplicate">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-dropdown-item>
                <el-dropdown-item command="export">
                  <el-icon><Download /></el-icon>
                  导出
                </el-dropdown-item>
                <el-dropdown-item
                    command="delete"
                    :disabled="type.isSystemType"
                    divided
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div v-if="filteredTypes.length === 0" class="empty-list">
        <el-icon size="48"><DocumentCopy /></el-icon>
        <p v-if="searchKeyword">未找到匹配的任务类型</p>
        <p v-else>暂无任务类型，点击上方按钮创建</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Plus,
  Calendar,
  DocumentCopy,
  MoreFilled,
  CopyDocument,
  Download,
  Delete
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  types: {
    type: Array,
    default: () => []
  },
  currentTypeId: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['select', 'create', 'delete', 'duplicate'])

// 响应式数据
const searchKeyword = ref('')

// 计算属性
const filteredTypes = computed(() => {
  if (!searchKeyword.value) {
    return props.types
  }

  const keyword = searchKeyword.value.toLowerCase()
  return props.types.filter(type =>
      type.name.toLowerCase().includes(keyword) ||
      type.description.toLowerCase().includes(keyword)
  )
})

// 方法
const handleSelect = (typeId) => {
  emit('select', typeId)
}

const handleCreate = () => {
  emit('create')
}

const handleCommand = (command, type) => {
  switch (command) {
    case 'duplicate':
      emit('duplicate', type.id)
      break
    case 'export':
      handleExport(type)
      break
    case 'delete':
      emit('delete', type.id)
      break
  }
}

const handleExport = (type) => {
  const exportData = {
    ...type,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${type.name}-任务类型.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('任务类型已导出')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.type-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background: white;
}

.panel-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-box {
  margin-bottom: 12px;
}

.add-type-btn {
  width: 100%;
}

.type-items {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.type-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  background: white;
}

.type-item:hover {
  background: #f5f7fa;
  border-color: #e4e7ed;
}

.type-item.active {
  background: #e6f4ff;
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.type-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  flex-shrink: 0;
}

.type-info {
  flex: 1;
  min-width: 0;
}

.type-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.type-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.type-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #c0c4cc;
}

.meta-item .el-icon {
  font-size: 12px;
}

.type-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.type-item:hover .type-actions {
  opacity: 1;
}

.empty-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  text-align: center;
}

.empty-list p {
  margin-top: 12px;
  font-size: 14px;
}

/* 滚动条样式 */
.type-items::-webkit-scrollbar {
  width: 6px;
}

.type-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.type-items::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.type-items::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
</style>