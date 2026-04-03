// ==========================================
// 设置相关类型定义
// ==========================================

import type { GLMModel, AnalysisMode } from './project'

/** Whisper 模型大小 */
export type WhisperModelSize = 'tiny' | 'base' | 'small'

/** 输出格式 */
export type OutputFormat = 'mp4' | 'mov' | 'webm'

/** 分辨率 */
export type Resolution = '1080p' | '720p' | '480p' | 'original'

/** 主题模式 */
export type ThemeMode = 'dark' | 'light' | 'system'

/** 应用设置 */
export interface AppSettings {
  glmApiKey: string
  defaultModel: GLMModel
  defaultAnalysisMode: AnalysisMode
  systemPrompt: string
  whisperModel: WhisperModelSize
  outputFormat: OutputFormat
  outputResolution: Resolution
  projectSavePath: string
  theme: ThemeMode
}
