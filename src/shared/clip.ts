// ==========================================
// 剪辑片段类型定义
// ==========================================

/** 剪辑片段 */
export interface Clip {
  id: string
  projectId: string
  startTime: number  // 秒
  endTime: number    // 秒
  reason: string     // AI 给出的剪辑理由
}