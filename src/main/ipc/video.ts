// ==========================================
// 视频处理 IPC 处理器
// ==========================================

import { BrowserWindow } from 'electron'
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
import { addToQueue, cancelProject, setMainWindow } from '../services/queue'
import { getProject } from '../services/database'
import { getProjectWorkDir } from '../services/ffmpeg'
import { runReRenderPipeline } from '../services/pipeline'
import { existsSync, statSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { handleWithLog } from '../utils/logger'

/** 中间视频文件信息 */
interface IntermediateVideo {
  label: string
  path: string
  exists: boolean
}

/** 获取项目的中间视频文件列表 */
function getIntermediateVideos(projectId: string): IntermediateVideo[] {
  const workDir = getProjectWorkDir(projectId)
  const project = getProject(projectId)
  const isMultiVideo = project && project.videoPaths && project.videoPaths.length > 1

  const videos: IntermediateVideo[] = []

  // 1. 合并后原视频（仅多视频项目）
  if (isMultiVideo) {
    const concatPath = join(workDir, 'concat_input.mp4')
    videos.push({
      label: '合并后原视频',
      path: concatPath,
      exists: existsSync(concatPath) && statSync(concatPath).size > 0,
    })
  }

  // 2. 剪辑后视频（AI剪辑合并，无字幕无BGM）
  const mergedPath = join(workDir, 'merged.mp4')
  videos.push({
    label: '剪辑后视频',
    path: mergedPath,
    exists: existsSync(mergedPath) && statSync(mergedPath).size > 0,
  })

  return videos
}

export function registerVideoIPC(): void {
  // ==========================================
  // 检测 FFmpeg 是否可用
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_CHECK_FFMPEG, async () => {
    return checkFfmpegAvailable()
  })

  // ==========================================
  // 获取视频信息
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_GET_INFO, async (_event, filePath: string) => {
    return ffmpegGetVideoInfo(filePath)
  })

  // ==========================================
  // 提取音频
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_EXTRACT_AUDIO,
    async (_event, videoPath: string, outputDir?: string) => {
      return ffmpegExtractAudio(videoPath, outputDir)
    },
  )

  // ==========================================
  // 抽取关键帧
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_EXTRACT_FRAMES,
    async (_event, videoPath: string, outputDir: string, interval?: number) => {
      return ffmpegExtractFrames(videoPath, outputDir, interval)
    },
  )

  // ==========================================
  // 视频剪辑
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_CLIP,
    async (_event, videoPath: string, clips: ClipParams[], outputDir: string) => {
      return ffmpegClipVideo(videoPath, clips, outputDir)
    },
  )

  // ==========================================
  // 视频片段合并
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_MERGE,
    async (_event, clipPaths: string[], outputPath: string) => {
      return ffmpegMergeClips(clipPaths, outputPath)
    },
  )

  // ==========================================
  // 字幕嵌入
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_EMBED_SUBTITLES,
    async (_event, videoPath: string, srtPath: string, outputPath: string) => {
      return ffmpegEmbedSubtitles(videoPath, srtPath, outputPath)
    },
  )

  // ==========================================
  // 开始处理流程
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_START_PROCESS, async (event, projectId: string) => {
    // 验证项目存在
    const project = getProject(projectId)
    if (!project) {
      throw new Error(`项目不存在: ${projectId}`)
    }

    // 设置 BrowserWindow 引用（用于进度推送）
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      setMainWindow(win)
    }

    // 添加到处理队列
    addToQueue(projectId)
  })

  // ==========================================
  // 取消处理流程
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_CANCEL_PROCESS, async (_event, projectId: string) => {
    const cancelled = cancelProject(projectId)
    if (!cancelled) {
      throw new Error(`未找到正在处理的项目: ${projectId}`)
    }
  })

  // ==========================================
  // 获取中间视频文件列表
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_GET_INTERMEDIATES, async (_event, projectId: string) => {
    return getIntermediateVideos(projectId)
  })

  // ==========================================
  // 获取剪辑片段视频文件列表
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_GET_CLIP_FILES, async (_event, projectId: string) => {
    const workDir = getProjectWorkDir(projectId)
    const clipsDir = join(workDir, 'clips')

    if (!existsSync(clipsDir)) {
      return []
    }

    const files = readdirSync(clipsDir)
      .filter((f) => f.startsWith('clip_') && f.endsWith('.mp4'))
      .sort()

    return files.map((fileName, idx) => {
      const filePath = join(clipsDir, fileName)
      const stat = existsSync(filePath) ? statSync(filePath) : null
      return {
        index: idx + 1,
        path: filePath,
        fileName,
        size: stat ? stat.size : 0,
        exists: !!stat && stat.size > 0,
      }
    })
  })

  // ==========================================
  // 获取关键帧图片文件列表
  // ==========================================
  handleWithLog(IPC_CHANNELS.VIDEO_GET_FRAME_FILES, async (_event, projectId: string, withDataUrl?: boolean) => {
    const workDir = getProjectWorkDir(projectId)
    const framesDir = join(workDir, 'frames')

    if (!existsSync(framesDir)) {
      return []
    }

    // 获取项目信息以推算帧时间戳
    const project = getProject(projectId)
    const frameIntervals: Record<string, number> = { quick: 5, standard: 3, deep: 2 }
    const interval = project ? (frameIntervals[project.analysisMode] || 3) : 3

    const files = readdirSync(framesDir)
      .filter((f) => f.startsWith('frame_') && f.endsWith('.jpg'))
      .sort()

    return files.map((fileName, idx) => {
      const filePath = join(framesDir, fileName)
      const fileExists = existsSync(filePath) && statSync(filePath).size > 0

      const result: {
        index: number
        path: string
        fileName: string
        timestamp: number
        exists: boolean
        dataUrl?: string
      } = {
        index: idx + 1,
        path: filePath,
        fileName,
        timestamp: idx * interval,
        exists: fileExists,
      }

      // 如果需要 Data URL（用于前端展示），读取文件并转换为 base64
      if (withDataUrl && fileExists) {
        try {
          const buffer = readFileSync(filePath)
          result.dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`
        } catch {
          // 读取失败时不设置 dataUrl
        }
      }

      return result
    })
  })

  // ==========================================
  // 重新渲染（用户编辑剪辑后重新生成视频）
  // ==========================================
  handleWithLog(
    IPC_CHANNELS.VIDEO_RE_RENDER,
    async (event, projectId: string, clips: Array<{ startTime: number; endTime: number; reason: string }>) => {
      // 验证项目存在
      const project = getProject(projectId)
      if (!project) {
        throw new Error(`项目不存在: ${projectId}`)
      }

      if (!clips || clips.length === 0) {
        throw new Error('剪辑片段列表不能为空')
      }

      // 获取 BrowserWindow 实例
      const win = BrowserWindow.fromWebContents(event.sender)

      // 执行重新渲染管线
      const outputPath = await runReRenderPipeline(projectId, clips, win!)
      return outputPath
    },
  )
}
