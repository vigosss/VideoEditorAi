// ==========================================
// Electron API 类型定义
// ==========================================

import type { Project, CreateProjectParams } from './project'
import type { VideoInfo } from './video'
import type { PipelineProgress } from './pipeline'
import type { AppSettings } from './settings'
import type { UploadRecord, UploadPlatform } from './upload'

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

  // 视频处理
  getVideoInfo: (filePath: string) => Promise<VideoInfo>
  startProcess: (projectId: string) => Promise<void>
  cancelProcess: (projectId: string) => Promise<void>
  onProgress: (callback: (progress: PipelineProgress) => void) => () => void

  // 设置
  getSettings: () => Promise<AppSettings>
  setSettings: (settings: Partial<AppSettings>) => Promise<void>

  // 上传
  startUpload: (projectId: string, platform: UploadPlatform) => Promise<UploadRecord>
  onUploadProgress: (callback: (progress: { platform: UploadPlatform; progress: number }) => void) => () => void

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
