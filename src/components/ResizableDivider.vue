<template>
  <div class="resizable-divider" @mousedown="startDrag"></div>
</template>
<script setup>
const emit = defineEmits(['drag'])
let startX
function startDrag(e) {
  startX = e.clientX
  document.addEventListener('mousemove', mouseMove)
  document.addEventListener('mouseup', mouseUp)
}
function mouseMove(e) {
  emit('drag', e.clientX - startX)
  startX = e.clientX
}
function mouseUp() {
  document.removeEventListener('mousemove', mouseMove)
  document.removeEventListener('mouseup', mouseUp)
}
</script>
<style scoped>
.resizable-divider {
  width: 8px;
  cursor: ew-resize;
  background: #d0d0d0;
  position: relative;
  z-index: 5;
}
</style>