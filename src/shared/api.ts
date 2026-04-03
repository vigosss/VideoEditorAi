// ==========================================
// Electron API 类型定义
// ==========================================

import type { Project, CreateProjectParams } from './project'
import type { Clip } from './clip'
import type { VideoInfo } from './video'
import type { PipelineProgress } from './pipeline'
import type { AppSettings, WhisperModelSize } from './settings'
import type { UploadRecord, UploadPlatform } from './upload'
import type { PromptTemplate } from './prompt'

/** 文件过滤器 */
export interface FileFilter {
  name: string
  extensions: string[]
}

/** 暴露给渲染进程的 API */
export interface ElectronAPI {
  // 项目操作
  createProject: (params: CreateProjectParams) => Promise<Project>
  listProjects: () => Promise<Project[]>
  getProject: (id: string) => Promise<Project | null>
  deleteProject: (id: string) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>
  getProjectClips: (projectId: string) => Promise<Clip[]>

  // 视频处理
  getVideoInfo: (filePath: string) => Promise<VideoInfo>
  startProcess: (projectId: string) => Promise<void>
  cancelProcess: (projectId: string) => Promise<void>
  checkFfmpeg: () => Promise<boolean>
  extractAudio: (videoPath: string, outputDir?: string) => Promise<string>
  extractFrames: (videoPath: string, outputDir: string, interval?: number) => Promise<string[]>
  clipVideo: (videoPath: string, clips: Array<{ startTime: number; endTime: number; reason?: string }>, outputDir: string) => Promise<string[]>
  mergeClips: (clipPaths: string[], outputPath: string) => Promise<string>
  embedSubtitles: (videoPath: string, srtPath: string, outputPath: string) => Promise<string>
  onProgress: (callback: (progress: PipelineProgress) => void) => () => void

  // 设置
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>

  // 上传
  startUpload: (projectId: string, platform: UploadPlatform) => Promise<UploadRecord>
  onUploadProgress: (callback: (progress: { platform: UploadPlatform; progress: number }) => void) => () => void

  // Whisper 语音识别
  whisperTranscribe: (audioPath: string, modelSize: WhisperModelSize, outputDir?: string) => Promise<{
    segments: Array<{ id: number; startTime: number; endTime: number; text: string }>
    fullText: string
    srtPath: string
  }>
  whisperDownloadModel: (modelSize: WhisperModelSize) => Promise<{
    size: WhisperModelSize
    downloaded: boolean
    path: string
  }>
  whisperGetModels: () => Promise<Array<{
    size: WhisperModelSize
    downloaded: boolean
    path: string
    fileSize: number
  }>>
  whisperDeleteModel: (modelSize: WhisperModelSize) => Promise<{ success: boolean }>
  onWhisperProgress: (callback: (progress: {
    type: 'download' | 'transcribe'
    modelSize?: WhisperModelSize
    progress: number
    message: string
  }) => void) => () => void

  // Prompt 模板
  listTemplates: () => Promise<PromptTemplate[]>
  createTemplate: (name: string, content: string) => Promise<PromptTemplate>
  updateTemplate: (id: string, name: string, content: string) => Promise<PromptTemplate>
  deleteTemplate: (id: string) => Promise<void>

  // 对话框
  openFileDialog: (filters?: FileFilter[]) => Promise<string | null>
  openDirectoryDialog: () => Promise<string | null>

  // 平台信息
  platform: string

  // 窗口控制
  windowMinimize: () => Promise<void>
  windowMaximize: () => Promise<void>
  windowClose: () => Promise<void>
  windowIsMaximized: () => Promise<boolean>
}
