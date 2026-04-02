// ==========================================
// 处理管线类型定义
// ==========================================

import type { ProcessingStep } from './project'

/** 管线步骤进度 */
export interface PipelineProgress {
  step: ProcessingStep
  progress: number       // 当前步骤进度 0-100
  overallProgress: number // 总体进度 0-100
  message: string
}