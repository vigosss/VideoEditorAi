// ==========================================
// 更新 IPC 处理器
// ==========================================

import { ipcMain } from 'electron'
import { checkForUpdate, downloadUpdate, quitAndInstall } from '../services/updater'

/** 注册更新相关 IPC 处理器 */
export function registerUpdaterIPC(): void {
  // 手动检查更新
  ipcMain.handle('updater:check', async () => {
    await checkForUpdate()
  })

  // 下载更新
  ipcMain.handle('updater:download', async () => {
    await downloadUpdate()
  })

  // 安装更新并重启
  ipcMain.handle('updater:install', () => {
    quitAndInstall()
  })

  console.log('[ipc] 更新 IPC 处理器注册完成')
}