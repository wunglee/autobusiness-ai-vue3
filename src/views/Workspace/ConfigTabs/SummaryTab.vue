<template>
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
  padding: 32px 32px 10px 32px;
  background: #fff;
  border-radius: 10px;
}

.summary-pane .el-form {
  background: none;
  max-width: 560px;
  margin: 0 auto;
  padding: 0;
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
</style>