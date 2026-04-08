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

/** 管线步骤配置 */
export interface PipelineStepConfig {
  key: ProcessingStep
  label: string
  weight: number  // 该步骤在总体进度中的权重占比
}

/** 管线步骤列表（有序） */
export const PIPELINE_STEPS: PipelineStepConfig[] = [
  { key: 'normalizing', label: '视频合并', weight: 10 },
  { key: 'parsing', label: '视频解析', weight: 10 },
  { key: 'extracting', label: '音频提取', weight: 10 },
  { key: 'transcribing', label: '语音转录', weight: 15 },
  { key: 'extracting_frames', label: '关键帧抽取', weight: 10 },
  { key: 'analyzing', label: 'AI 分析', weight: 20 },
  { key: 'clipping', label: '视频剪辑', weight: 15 },
  { key: 'embedding_subs', label: '字幕嵌入', weight: 10 },
]

/** 队列中的项目状态 */
export interface QueueItem {
  projectId: string
  status: 'waiting' | 'processing' | 'cancelled'
  addedAt: number  // timestamp
}

/** 队列状态 */
export interface QueueStatus {
  currentProjectId: string | null
  queue: QueueItem[]
  isProcessing: boolean
}

/** 不需要字幕时跳过的步骤 key */
const SUBTITLE_STEP_KEYS = ['extracting', 'transcribing', 'embedding_subs']

/** 根据是否需要字幕，返回活跃步骤列表（权重按比例重新分配） */
export function getActiveSteps(needsSubtitles: boolean): PipelineStepConfig[] {
  const steps = needsSubtitles
    ? PIPELINE_STEPS
    : PIPELINE_STEPS.filter(s => !SUBTITLE_STEP_KEYS.includes(s.key))

  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0)
  return steps.map(s => ({
    ...s,
    weight: Math.round((s.weight / totalWeight) * 100),
  }))
}
