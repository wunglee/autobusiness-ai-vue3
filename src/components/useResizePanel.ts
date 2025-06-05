import { Ref, ref, onUnmounted } from 'vue'

type PanelType = string // 比如 'sidebar' | 'assistant' | 'main'，可根据实际需求拓展

interface UseResizePanelOptions {
    widthRef: Ref<number>
    direction?: 'horizontal' | 'vertical'      // 拖拽方向，默认 'horizontal'
    min?: number                               // 最小值
    max?: number                               // 最大值
    reverse?: boolean                          // 拖拽变化方向，默认false。右栏拖拽时建议传true
    onChange?: (width: number) => void         // 宽度变化时的回调（可选）
}

export function useResizePanel({
                                   widthRef,
                                   direction = 'horizontal',
                                   min = 100,
                                   max = 600,
                                   reverse = false,
                                   onChange
                               }: UseResizePanelOptions) {
    const isResizing = ref(false)
    const startX = ref(0)
    const startY = ref(0)
    let initialWidth = 0
    let initialHeight = 0

    const startResize = (event: MouseEvent) => {
        isResizing.value = true
        if (direction === 'horizontal') {
            startX.value = event.clientX
            initialWidth = widthRef.value
        } else {
            startY.value = event.clientY
            initialHeight = widthRef.value
        }
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseup', handleMouseUp)
        event.preventDefault()
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizing.value) return
        let newSize: number
        if (direction === 'horizontal') {
            const delta = event.clientX - startX.value
            newSize = reverse
                ? initialWidth - delta  // 右边栏、反向拖动
                : initialWidth + delta  // 左边栏、正向拖动
        } else {
            const delta = event.clientY - startY.value
            newSize = reverse
                ? initialHeight - delta
                : initialHeight + delta
        }
        newSize = Math.max(min, Math.min(max, newSize))
        widthRef.value = newSize
        onChange?.(newSize)
    }

    const handleMouseUp = () => {
        isResizing.value = false
        document.body.style.cursor = ''
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
    }

    const showResizeCursor = () => {
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    }
    const hideResizeCursor = () => {
        if (!isResizing.value) {
            document.body.style.cursor = ''
        }
    }

    onUnmounted(() => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
    })

    return {
        isResizing,
        startResize,
        showResizeCursor,
        hideResizeCursor
    }
}