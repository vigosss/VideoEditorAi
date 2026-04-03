import { create } from 'zustand'
import type { AppSettings, ThemeMode } from '@shared/types'
import { DEFAULT_SYSTEM_PROMPT } from '@shared/constants'

interface SettingsState {
  settings: AppSettings
  setSettings: (settings: Partial<AppSettings>) => Promise<void>
  fetchSettings: () => Promise<void>
}

/** 默认设置 */
const defaultSettings: AppSettings = {
  glmApiKey: '',
  defaultModel: 'GLM-4.6V-FlashX',
  defaultAnalysisMode: 'standard',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  whisperModel: 'base',
  outputFormat: 'mp4',
  outputResolution: '1080p',
  projectSavePath: '',
  theme: 'dark',
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,

  setSettings: async (partial) => {
    await window.electronAPI.setSettings(partial)
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }))
  },

  fetchSettings: async () => {
    const settings = await window.electronAPI.getSettings()
    set({ settings })
  },
}))