import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'

/**
 * 上传 IPC 处理器（占位实现）
 * 完整逻辑将在阶段九（短视频平台自动发布）中实现
 */
export function registerUploadIPC(): void {
  // 开始上传（占位）
  ipcMain.handle(IPC_CHANNELS.UPLOAD_START, async (_event, _projectId: string, _platform: string) => {
    throw new Error('上传功能尚未实现，将在阶段九完成')
  })

  console.log('[ipc] 上传 IPC 处理器已注册（占位）')
}