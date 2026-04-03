// ==========================================
// 视频处理 IPC 处理器
// ==========================================

import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import {
  getVideoInfo as ffmpegGetVideoInfo,
  extractAudio as ffmpegExtractAudio,
  extractFrames as ffmpegExtractFrames,
  clipVideo as ffmpegClipVideo,
  mergeClips as ffmpegMergeClips,
  embedSubtitles as ffmpegEmbedSubtitles,
  checkFfmpegAvailable,
} from '../services/ffmpeg'
import type { ClipParams } from '../services/ffmpeg'

export function registerVideoIPC(): void {
  // ==========================================
  // 检测 FFmpeg 是否可用
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.VIDEO_CHECK_FFMPEG, async () => {
    return checkFfmpegAvailable()
  })

  // ==========================================
  // 获取视频信息
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_INFO, async (_event, filePath: string) => {
    return ffmpegGetVideoInfo(filePath)
  })

  // ==========================================
  // 提取音频
  // ==========================================
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_EXTRACT_AUDIO,
    async (_event, videoPath: string, outputDir?: string) => {
      return ffmpegExtractAudio(videoPath, outputDir)
    },
  )

  // ==========================================
  // 抽取关键帧
  // ==========================================
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_EXTRACT_FRAMES,
    async (_event, videoPath: string, outputDir: string, interval?: number) => {
      return ffmpegExtractFrames(videoPath, outputDir, interval)
    },
  )

  // ==========================================
  // 视频剪辑
  // ==========================================
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_CLIP,
    async (_event, videoPath: string, clips: ClipParams[], outputDir: string) => {
      return ffmpegClipVideo(videoPath, clips, outputDir)
    },
  )

  // ==========================================
  // 视频片段合并
  // ==========================================
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_MERGE,
    async (_event, clipPaths: string[], outputPath: string) => {
      return ffmpegMergeClips(clipPaths, outputPath)
    },
  )

  // ==========================================
  // 字幕嵌入
  // ==========================================
  ipcMain.handle(
    IPC_CHANNELS.VIDEO_EMBED_SUBTITLES,
    async (_event, videoPath: string, srtPath: string, outputPath: string) => {
      return ffmpegEmbedSubtitles(videoPath, srtPath, outputPath)
    },
  )

  // ==========================================
  // 开始处理流程（占位，将在阶段七完成完整实现）
  // ==========================================
  ipcMain.handle(IPC_CHANNELS.VIDEO_START_PROCESS, async (_event, _projectId: string) => {
    throw new Error('视频处理功能尚未实现，将在阶段七完成')
  })

  // 取消处理流程（占位）
  ipcMain.handle(IPC_CHANNELS.VIDEO_CANCEL_PROCESS, async (_event, _projectId: string) => {
    throw new Error('取消处理功能尚未实现，将在阶段七完成')
  })

  console.log('[ipc] 视频 IPC 处理器已注册')
}