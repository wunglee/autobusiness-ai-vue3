import { ElMessageBox } from 'element-plus'

/**
 * 用于对任何“命名对象”进行增、删、改操作的通用方法
 * 支持自定义标题、提示、校验规则等
 */
export function useNamedEntityActions() {
    /**
     * 通用“新建”操作
     */
    const handleCreate = async (
        options: {
            title?: string
            label?: string
            inputPlaceholder?: string
            inputPattern?: RegExp
            inputErrorMessage?: string
            confirmButtonText?: string
            cancelButtonText?: string
        } = {}
    ): Promise<string | undefined> => {
        const {
            title = '新建对象',
            label = '请输入名称',
            inputPlaceholder = '请输入名称',
            inputPattern = /^[\w\-. ]+$/,
            inputErrorMessage = '名称格式不正确',
            confirmButtonText = '确定',
            cancelButtonText = '取消'
        } = options

        try {
            const { value } = await ElMessageBox.prompt(
                label,
                title,
                {
                    confirmButtonText,
                    cancelButtonText,
                    inputPattern,
                    inputErrorMessage,
                    inputPlaceholder
                }
            )
            return value
        } catch {
            return undefined // 用户取消
        }
    }

    /**
     * 通用“重命名”操作
     */
    const handleRename = async (
        currentName: string,
        options: {
            title?: string
            label?: string
            inputPattern?: RegExp
            inputErrorMessage?: string
            confirmButtonText?: string
            cancelButtonText?: string
        } = {}
    ): Promise<string | undefined> => {
        const {
            title = '重命名',
            label = '请输入新名称',
            inputPattern = /^[\w\-. ]+$/,
            inputErrorMessage = '名称格式不正确',
            confirmButtonText = '确定',
            cancelButtonText = '取消'
        } = options

        try {
            const { value } = await ElMessageBox.prompt(
                label,
                title,
                {
                    confirmButtonText,
                    cancelButtonText,
                    inputValue: currentName,
                    inputPattern,
                    inputErrorMessage
                }
            )
            return value
        } catch {
            return undefined // 用户取消
        }
    }

    /**
     * 通用“删除”操作
     */
    const handleDelete = async (
        name: string,
        options: {
            title?: string
            message?: string
            confirmButtonText?: string
            cancelButtonText?: string
            type?: 'warning' | 'info' | 'success' | 'error'
        } = {}
    ): Promise<boolean> => {
        const {
            title = '确认删除',
            message = `确定要删除 "${name}" 吗？此操作不可恢复。`,
            confirmButtonText = '删除',
            cancelButtonText = '取消',
            type = 'warning'
        } = options

        try {
            await ElMessageBox.confirm(
                message,
                title,
                {
                    type,
                    confirmButtonText,
                    cancelButtonText
                }
            )
            return true
        } catch {
            return false // 用户取消
        }
    }

    return {
        handleCreate,
        handleRename,
        handleDelete
    }
}