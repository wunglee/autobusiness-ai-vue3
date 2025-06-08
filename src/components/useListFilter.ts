import { Ref, ref, computed, ComputedRef } from 'vue'

/**
 * 列表过滤 Hook
 * 提供搜索关键词管理和列表过滤功能
 */
export function useListFilter<T extends { id: any }>() {
    const searchKeyword = ref('')

    /**
     * 创建过滤后的列表
     * @param sourceList - 源数据列表 (响应式引用)
     * @param selectedItems - 已选中的项目列表 (可选)
     * @param searchFields - 搜索字段数组 (默认 ['name'])
     * @param customFilter - 自定义过滤函数 (可选)
     * @returns 过滤后的列表
     */
    function createFilteredList(
        sourceList: Ref<T[]>,
        selectedItems: Ref<T[]> | T[] = [],
        searchFields: string[] = ['name'],
        customFilter: ((item: T, keyword: string) => boolean) | null = null
    ): ComputedRef<T[]> {
        return computed(() => {
            const keyword = searchKeyword.value.toLowerCase()
            let selectedIds: any[] = []

            // 处理已选中项目的ID列表
            if ('value' in selectedItems) {
                selectedIds = (selectedItems as Ref<T[]>).value.map(item => item.id)
            } else if (Array.isArray(selectedItems)) {
                selectedIds = (selectedItems as T[]).map(item => item.id)
            }

            return sourceList.value.filter(item => {
                // 如果已选中，则过滤掉（不在左侧显示）
                if (selectedIds.includes(item.id)) return false

                // 如果有自定义过滤函数，先应用自定义过滤
                if (customFilter && !customFilter(item, keyword)) return false

                // 如果没有搜索关键词，显示所有未选中的项目
                if (!keyword) return true

                // 根据搜索字段进行搜索
                return searchFields.some(field => {
                    const value = (item as any)[field]
                    return value && value.toString().toLowerCase().includes(keyword)
                })
            })
        })
    }

    /**
     * 创建简单的搜索过滤列表（不排除已选中项目）
     * @param sourceList - 源数据列表
     * @param searchFields - 搜索字段数组
     * @param customFilter - 自定义过滤函数
     * @returns 过滤后的列表
     */
    function createSearchFilteredList(
        sourceList: Ref<T[]>,
        searchFields: string[] = ['name'],
        customFilter: ((item: T, keyword: string) => boolean) | null = null
    ): ComputedRef<T[]> {
        return computed(() => {
            const keyword = searchKeyword.value.toLowerCase()

            if (!keyword && !customFilter) return sourceList.value

            return sourceList.value.filter(item => {
                // 如果有自定义过滤函数，先应用自定义过滤
                if (customFilter && !customFilter(item, keyword)) return false

                // 如果没有搜索关键词，显示所有项目
                if (!keyword) return true

                // 根据搜索字段进行搜索
                return searchFields.some(field => {
                    const value = (item as any)[field]
                    return value && value.toString().toLowerCase().includes(keyword)
                })
            })
        })
    }

    /**
     * 重置搜索关键词
     */
    function resetSearch() {
        searchKeyword.value = ''
    }

    return {
        searchKeyword,
        createFilteredList,
        createSearchFilteredList,
        resetSearch
    }
}