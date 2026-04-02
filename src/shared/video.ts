// ==========================================
// 视频信息类型定义
// ==========================================

/** 视频元信息 */
export interface VideoInfo {
  duration: number       // 秒
  width: number
  height: number
  fps: number
  bitrate: number
  codec: string
  size: number           // 字节
}