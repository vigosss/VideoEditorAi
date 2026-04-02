import { create } from 'zustand'
import type { ThemeMode, PipelineProgress } from '@shared/types'

interface AppState {
  // 主题
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void

  // 侧边栏
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // 当前处理进度
  currentProgress: PipelineProgress | null
  setCurrentProgress: (progress: PipelineProgress | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 主题（默认深色模式）
  theme: 'dark',
  setTheme: (theme) => set({ theme }),

  // 侧边栏
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // 处理进度
  currentProgress: null,
  setCurrentProgress: (progress) => set({ currentProgress: progress }),
}))