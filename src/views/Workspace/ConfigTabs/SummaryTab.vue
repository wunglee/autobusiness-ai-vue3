<template>
  <div class="tab-pane-content">
    <div class="summary-pane">
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
  </div>
</template>

<script setup>
const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:form'])
</script>

<style scoped>
.tab-pane-content {
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.summary-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.summary-pane .el-form {
  background: none;
  width: 100%;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

:deep(.summary-pane .el-form-item__label) {
  color: #344563;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.1px;
}

:deep(.summary-pane .el-form-item__content) {
  font-size: 15px;
}

:deep(.summary-pane .el-input),
:deep(.summary-pane .el-textarea) {
  width: 100%;
}

:deep(.summary-pane .el-form-item:last-child) {
  flex: 1;
}

:deep(.summary-pane .el-form-item:last-child .el-textarea) {
  height: 100%;
}

:deep(.summary-pane .el-form-item:last-child .el-textarea__inner) {
  height: 100% !important;
  min-height: 200px !important;
  resize: none;
}
</style>