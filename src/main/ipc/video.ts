import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'

/**
 * 视频处理 IPC 处理器（占位实现）
 * 完整逻辑将在阶段四（FFmpeg）、阶段五（Whisper）、阶段六（GLM）、阶段七（Pipeline）中实现
 */
export function registerVideoIPC(): void {
  // 获取视频信息（占位）
  ipcMain.handle(IPC_CHANNELS.VIDEO_GET_INFO, async (_event, _filePath: string) => {
    throw new Error('视频解析功能尚未实现，将在阶段四完成')
  })

  // 开始处理流程（占位）
  ipcMain.handle(IPC_CHANNELS.VIDEO_START_PROCESS, async (_event, _projectId: string) => {
    throw new Error('视频处理功能尚未实现，将在阶段七完成')
  })

  // 取消处理流程（占位）
  ipcMain.handle(IPC_CHANNELS.VIDEO_CANCEL_PROCESS, async (_event, _projectId: string) => {
    throw new Error('取消处理功能尚未实现，将在阶段七完成')
  })

  console.log('[ipc] 视频 IPC 处理器已注册（占位）')
}