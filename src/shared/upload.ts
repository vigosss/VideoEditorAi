// ==========================================
// 上传相关类型定义
// ==========================================

/** 上传平台 */
export type UploadPlatform = 'kuaishou' | 'douyin'

/** 上传状态 */
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed'

/** 上传记录 */
export interface UploadRecord {
  id: string
  projectId: string
  platform: UploadPlatform
  videoId: string
  videoUrl: string
  status: UploadStatus
  uploadedAt: string
}