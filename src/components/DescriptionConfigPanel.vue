<template>
  <div class="desc-panel">
    <form class="desc-form">
      <div class="form-row">
        <label class="form-label" for="agent-name">名称</label>
        <input
            id="agent-name"
            class="form-input"
            v-model="form.name"
            placeholder="Value"
        />
      </div>
      <div class="form-row">
        <label class="form-label" for="agent-msg">Message</label>
        <textarea
            id="agent-msg"
            class="form-textarea"
            v-model="form.message"
            rows="8"
            placeholder="Value"
        ></textarea>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, toRef } from 'vue'
const props = defineProps({ agent: Object })

const form = ref({
  name: props.agent?.name ?? '',
  message: props.agent?.message ?? ''
})

watch(() => props.agent, (newAgent) => {
  form.value.name = newAgent?.name ?? ''
  form.value.message = newAgent?.message ?? ''
})
</script>

<style scoped>
.desc-panel {
  background: #f7f7f7;
  padding: 24px 28px 0 12px;
  border-radius: 10px;
}
.desc-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.form-label {
  font-size: 18px;
  color: #444;
  margin-bottom: 2px;
}
.form-input {
  padding: 10px 12px;
  font-size: 18px;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  outline: none;
  background: #fff;
  transition: border 0.2s;
}
.form-input:focus {
  border: 1.5px solid #7ab0ff;
}
.form-textarea {
  min-height: 180px;
  font-size: 17px;
  padding: 12px;
  border: 1.5px solid #ccc;
  border-radius: 8px;
  resize: vertical;
  outline: none;
  background: #fff;
  transition: border 0.2s;
}
.form-textarea:focus {
  border: 1.5px solid #7ab0ff;
}
</style>