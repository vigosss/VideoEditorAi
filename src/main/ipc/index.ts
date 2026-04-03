import { registerProjectIPC } from './project'
import { registerSettingsIPC } from './settings'
import { registerVideoIPC } from './video'
import { registerUploadIPC } from './upload'
import { registerDialogIPC } from './dialog'

/** 注册所有 IPC 处理器 */
export function registerAllIPC(): void {
  registerProjectIPC()
  registerSettingsIPC()
  registerVideoIPC()
  registerUploadIPC()
  registerDialogIPC()
  console.log('[ipc] 所有 IPC 处理器注册完成')
}