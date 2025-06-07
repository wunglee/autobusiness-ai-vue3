<template>
  <div class="agent-category-list">
    <div class="list-header">
      <h3>分类</h3>
    </div>
    <div class="list-items">
      <div
          v-for="cat in categories"
          :key="cat.id"
          :class="['list-item', { selected: cat.id === selected }]"
          @click="$emit('select', cat.id)"
      >
        <div class="item-content">
          <span class="item-name">{{ cat.name }}</span>
          <el-dropdown trigger="click" @command="cmd => {
            if (cmd==='rename') onRename(cat)
            else if (cmd==='delete') onDelete(cat)
          }" size="small">
            <el-icon class="more-icon" :size="16" @click.stop>
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="rename">
                  <el-icon><Edit /></el-icon>
                  <span>重命名</span>
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
    <div class="list-add-btn-wrap">
      <el-button
          size="small"
          :icon="Plus"
          @click="$emit('add')"
      >
        新增
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { useNamedEntityActions } from '@/components/useNamedEntityActions'
import { MoreFilled, Plus, Edit, Delete } from '@element-plus/icons-vue'

const { handleRename, handleDelete } = useNamedEntityActions()

defineProps(['categories', 'selected'])
const emit = defineEmits(['select', 'add', 'rename', 'delete'])

// 重命名
const onRename = async (category) => {
  const newName = await handleRename(category.name, {
    title: '重命名分类',
    label: '请输入新的分类名称'
  })
  if (newName && newName !== category.name) {
    emit('rename', { ...category, newName })
  }
}

// 删除
const onDelete = async (category) => {
  const confirmed = await handleDelete(category.name, {
    title: '删除分类',
    message: `确定要删除分类 "${category.name}" 吗？`
  })
  if (confirmed) {
    emit('delete', category)
  }
}
</script>

<style scoped>
.agent-category-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fafbfc;
  border-right: 1px solid #e4e7ed;
  min-width: 0;
  overflow: hidden;
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: white;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.list-items {
  flex: 1 1 0;
  overflow-y: auto;
  min-height: 0;
  background-color: white;
  padding: 8px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #606266;
}

.list-item:hover {
  background-color: #f5f7fa;
  color: #303133;
}

.list-item.selected {
  background-color: #e6f4ff;
  color: #409eff;
  font-weight: 500;
}

.item-content {
  display: flex;
  height: 100%;
  align-items: center;
  width: 100%;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-icon {
  cursor: pointer;
  color: #909399;
  padding: 2px;
  border-radius: 3px;
  transition: all 0.2s;
  opacity: 0;
}

.list-item:hover .more-icon {
  opacity: 1;
}

.more-icon:hover {
  background-color: #e6f4ff;
  color: #409eff;
}

.list-add-btn-wrap {
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background-color: white;
}

.list-add-btn-wrap .el-button {
  width: 100%;
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