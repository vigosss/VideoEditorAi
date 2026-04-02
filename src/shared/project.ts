// ==========================================
// 项目相关类型定义
// ==========================================

/** 项目状态 */
export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed'

/** 分析模式 */
export type AnalysisMode = 'quick' | 'standard' | 'deep'

/** GLM 可选模型 */
export type GLMModel =
  | 'GLM-4.6V-FlashX'
  | 'GLM-5V-Turbo'
  | 'GLM-4.6V'
  | 'GLM-4.7-FlashX'

/** 处理步骤 */
export type ProcessingStep =
  | 'idle'
  | 'parsing'        // 视频解析
  | 'extracting'     // 音频提取
  | 'transcribing'   // 语音转录（Whisper）
  | 'extracting_frames' // 关键帧抽取
  | 'analyzing'      // AI 分析（GLM）
  | 'clipping'       // 剪辑视频
  | 'embedding_subs' // 嵌入字幕
  | 'completed'      // 完成
  | 'failed'         // 失败

/** 项目 */
export interface Project {
  id: string
  name: string
  videoPath: string
  outputPath: string
  prompt: string
  model: GLMModel
  analysisMode: AnalysisMode
  status: ProjectStatus
  progress: number        // 0-100
  currentStep: ProcessingStep
  errorMessage: string | null
  createdAt: string       // ISO date string
  completedAt: string | null
}

/** 创建项目参数 */
export interface CreateProjectParams {
  name: string
  videoPath: string
  outputPath: string
  prompt: string
  model: GLMModel
  analysisMode: AnalysisMode
}