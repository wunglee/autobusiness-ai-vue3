<template>
  <div class="agent-list">
    <div class="list-header">
      <h3>名称</h3>
    </div>
    <div class="list-items">
      <div
          v-for="agent in agents"
          :key="agent.id"
          :class="['list-item', { selected: agent.id === selected?.id }]"
          @click="$emit('select', agent)"
      >
        <div class="item-content">
          <span class="item-name">{{ agent.name }}</span>
          <el-dropdown trigger="click" @command="cmd => {
            if (cmd==='rename') onRename(agent)
            else if (cmd==='delete') onDelete(agent)
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

defineProps(['agents', 'selected'])
const emit = defineEmits(['select', 'add', 'rename', 'delete'])

// 重命名
const onRename = async (agent) => {
  const newName = await handleRename(agent.name, {
    title: '重命名智能体',
    label: '请输入新的智能体名称'
  })
  if (newName && newName !== agent.name) {
    emit('rename', { ...agent, newName })
  }
}

// 删除
const onDelete = async (agent) => {
  const confirmed = await handleDelete(agent.name, {
    title: '删除智能体',
    message: `确定要删除智能体 "${agent.name}" 吗？`
  })
  if (confirmed) {
    emit('delete', agent)
  }
}
</script>

<style scoped>
.agent-list {
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