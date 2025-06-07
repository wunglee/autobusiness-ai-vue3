<template>
  <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
      class="workspace-config-dialog"
      @close="onCancel"
  >
    <el-tabs v-model="activeTab" type="card" class="workspace-config-tabs">
      <!-- 摘要 -->
      <el-tab-pane label="摘要" name="summary">
        <div class="tab-pane-content summary-pane">
          <el-form :model="form" label-width="90px">
            <el-form-item label="工作组名称" required>
              <el-input v-model="form.name" placeholder="请输入工作组名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="任务描述">
              <el-input
                  v-model="form.description"
                  type="textarea"
                  placeholder="请输入任务描述"
                  maxlength="200"
                  show-word-limit
                  :rows="4"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- 文件集 -->
      <el-tab-pane label="文件集" name="fileSet">
        <div class="file-set-pane">
          <div class="file-set-lists">
            <!-- 文件列表 -->
            <div class="file-list-panel">
              <div class="panel-title">文件列表</div>
              <el-table
                  :data="form.fileSetLeftFiles"
                  border
                  style="width: 260px"
                  height="220"
                  @selection-change="val => fileSetLeftSelection = val"
              >
                <el-table-column type="selection" width="38" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="path" label="路径" />
              </el-table>
              <div class="panel-actions">
                <el-button class="primary-btn" size="medium" @click="onUploadFileSetLeftFile">上传</el-button>
                <el-button class="primary-btn" size="medium" type="danger" @click="onRemoveFileSetLeftFiles">删除</el-button>
              </div>
            </div>
            <!-- 地址列表 -->
            <div class="file-list-panel">
              <div class="panel-title">网址列表</div>
              <el-table
                  :data="form.fileSetRightUrls"
                  border
                  style="width: 260px"
                  height="220"
                  @selection-change="val => fileSetRightSelection = val"
              >
                <el-table-column type="selection" width="38" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="path" label="路径" />
              </el-table>
              <div class="panel-actions">
                <el-button class="primary-btn" size="medium" @click="onAddFileSetRightUrl">新增</el-button>
                <el-button class="primary-btn" size="medium" type="danger" @click="onRemoveFileSetRightUrls">删除</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 数据源 -->
      <el-tab-pane label="数据源" name="datasource">
        <div class="datasource-pane">
          <div class="datasource-layout">
            <!-- 左侧数据源列表 -->
            <div class="ds-list">
              <div class="ds-list-title">名称</div>
              <el-table :data="form.datasourceList" border style="width: 180px" height="220" @current-change="onDatasourceSelect">
                <el-table-column prop="label" label="名称" />
              </el-table>
              <el-button class="primary-btn" size="medium" style="margin-top:12px;" @click="onAddDatasource">新建</el-button>
            </div>
            <!-- 右侧数据源表单 -->
            <div class="ds-form">
              <div class="ds-form-title">配置</div>
              <el-form :model="form.datasourceForm" label-width="60px" style="margin-top:8px">
                <el-form-item label="名称">
                  <el-input v-model="form.datasourceForm.label" />
                </el-form-item>
                <el-form-item label="地址">
                  <el-input v-model="form.datasourceForm.host" />
                </el-form-item>
                <el-form-item label="用户名">
                  <el-input v-model="form.datasourceForm.user" />
                </el-form-item>
                <el-form-item label="密码">
                  <el-input v-model="form.datasourceForm.password" type="password" />
                </el-form-item>
              </el-form>
              <div class="ds-form-actions">
                <el-button class="primary-btn" size="medium">测试连接</el-button>
                <el-button class="primary-btn" size="medium" type="primary">保存</el-button>
                <el-button class="primary-btn" size="medium">关闭</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 智能体 -->
      <el-tab-pane label="智能体" name="agent">
        <div class="agent-pane">
          <div class="agent-title">智能体</div>
          <div class="agent-lists">
            <!-- 左侧备选智能体 -->
            <div class="agent-list-panel">
              <el-form-item label="分类" label-width="38px" style="margin-bottom: 8px">
                <el-select v-model="form.agentCategory" style="width: 240px">
                  <el-option label="Value" value="Value" />
                </el-select>
              </el-form-item>
              <el-table
                  :data="form.agentCandidates"
                  border
                  style="width: 260px"
                  height="220"
                  @selection-change="val => agentLeftSelection = val"
              >
                <el-table-column type="selection" width="38" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="desc" label="描述" />
              </el-table>
            </div>
            <!-- 操作按钮 -->
            <div class="agent-transfer-actions">
              <el-button class="primary-btn" size="medium" @click="onAddAgentsToWorkspace">
                <span style="font-size: 18px;">→</span> 新增
              </el-button>
              <el-button class="primary-btn" size="medium" type="danger" @click="onRemoveAgentsFromWorkspace">
                <span style="font-size: 18px;">←</span> 删除
              </el-button>
            </div>
            <!-- 右侧当前工作空间智能体 -->
            <div class="agent-list-panel">
              <el-table
                  :data="form.agentInWorkspace"
                  border
                  style="width: 260px"
                  height="220"
                  @selection-change="val => agentRightSelection = val"
              >
                <el-table-column type="selection" width="38" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="desc" label="描述" />
              </el-table>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="footer-actions">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
// ===== JS 逻辑区 =====
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean,
  editing?: boolean,
  value?: any
}>()
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, v => visible.value = v)
watch(visible, v => emit('update:modelValue', v))

const dialogTitle = computed(() => props.editing ? '编辑工作区' : '创建工作区')

// tab
const activeTab = ref('summary')

// ------------------ 摘要 -------------------
const form = reactive({
  name: '',
  description: '',
  type: 'private',

  // ------------------ 文件集 ------------------
  fileSetLeftFiles: [
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' }
  ],
  fileSetRightUrls: [
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' },
    { name: 'Text', path: 'Text' }
  ],

  // ------------------ 数据源 ------------------
  datasourceList: [
    { label: '名称一' }, { label: '名称二' }
  ],
  datasourceForm: {
    label: '',
    host: '',
    user: '',
    password: ''
  },

  // ------------------ 智能体 ------------------
  agentCategory: 'Value',
  agentCandidates: [
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' }
  ],
  agentInWorkspace: [
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' },
    { name: 'Text', desc: 'Text' }
  ]
})

// 文件集选择
let fileSetLeftSelection: any[] = []
let fileSetRightSelection: any[] = []

const onUploadFileSetLeftFile = () => {
  // 这里实现上传，实际项目可用input[type=file]
  form.fileSetLeftFiles.push({ name: '上传文件', path: '上传路径' })
}
const onRemoveFileSetLeftFiles = () => {
  form.fileSetLeftFiles = form.fileSetLeftFiles.filter(f => !fileSetLeftSelection.includes(f))
  fileSetLeftSelection = []
}
const onAddFileSetRightUrl = () => {
  form.fileSetRightUrls.push({ name: '新网址', path: '新路径' })
}
const onRemoveFileSetRightUrls = () => {
  form.fileSetRightUrls = form.fileSetRightUrls.filter(f => !fileSetRightSelection.includes(f))
  fileSetRightSelection = []
}

// ------------------ 数据源 ------------------
const onAddDatasource = () => {
  form.datasourceList.push({ label: '新数据源' })
}
const onDatasourceSelect = (row: any) => {
  // 这里可设置选中行填充到 datasourceForm
  if (row) {
    form.datasourceForm.label = row.label
    form.datasourceForm.host = ''
    form.datasourceForm.user = ''
    form.datasourceForm.password = ''
  }
}

// ------------------ 智能体 ------------------
let agentLeftSelection: any[] = []
let agentRightSelection: any[] = []
const onAddAgentsToWorkspace = () => {
  agentLeftSelection.forEach(item => {
    if (!form.agentInWorkspace.some(a => a.name === item.name && a.desc === item.desc)) {
      form.agentInWorkspace.push(item)
    }
  })
  agentLeftSelection = []
}
const onRemoveAgentsFromWorkspace = () => {
  form.agentInWorkspace = form.agentInWorkspace.filter(a => !agentRightSelection.includes(a))
  agentRightSelection = []
}

// 关闭/确认
const onCancel = () => {
  visible.value = false
  emit('cancel')
}
const onConfirm = () => {
  visible.value = false
  emit('confirm', JSON.parse(JSON.stringify(form)))
}
</script>

<style scoped>
/* ===== CSS样式区 ===== */
.workspace-config-dialog {
  --el-dialog-bg-color: #fafafa;
}
.workspace-config-tabs {
  min-height: 400px;
}
.tab-pane-content {
  padding: 8px 0 0 0;
}
.summary-pane .el-form {
  max-width: 500px;
  margin: 0 auto;
}

/* -------- 文件集 -------- */
.file-set-pane {
  background: #fafafa;
  padding: 24px 0 0 0;
}
.file-set-lists {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 90px;
  margin-bottom: 24px;
}
.file-list-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.panel-title {
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: 500;
}
.panel-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  gap: 32px;
  justify-content: center;
}
.footer-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 32px;
}
.primary-btn {
  background: #232323;
  color: #fff;
  border: none;
  font-size: 18px;
  padding: 4px 28px;
}
.primary-btn[type=danger], .primary-btn.el-button--danger {
  background: #232323 !important;
  color: #fff !important;
}

/* -------- 数据源 -------- */
.datasource-pane {
  padding: 24px 0 0 0;
}
.datasource-layout {
  display: flex;
  flex-direction: row;
  gap: 48px;
  justify-content: center;
}
.ds-list, .ds-form {
  background: #f6f6f6;
  border-radius: 8px;
  padding: 18px 20px 18px 20px;
  min-width: 200px;
}
.ds-list-title, .ds-form-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}
.ds-form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
}

/* -------- 智能体 -------- */
.agent-pane {
  background: #fafafa;
  padding: 24px 0 0 0;
}
.agent-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 500;
}
.agent-lists {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 90px;
  margin-bottom: 24px;
}
.agent-list-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.agent-transfer-actions {
  display: flex;
  flex-direction: column;
  gap: 32px;
  justify-content: center;
  align-items: center;
}
.agent-transfer-actions .el-button {
  min-width: 120px;
  font-size: 18px;
}

@media (max-width: 900px) {
  .file-set-lists, .agent-lists, .datasource-layout {
    flex-direction: column;
    gap: 32px;
    align-items: center;
  }
}
</style>