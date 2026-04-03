// ==========================================
// 自动更新服务（强制更新）
// ==========================================

import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BrowserWindow, app } from 'electron'

let mainWindow: BrowserWindow | null = null

/** 初始化自动更新服务 */
export function initUpdater(window: BrowserWindow): void {
  mainWindow = window

  // 仅生产环境启用
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('[updater] 开发环境，跳过自动更新')
    return
  }

  // 配置 autoUpdater
  autoUpdater.autoDownload = false // 手动控制下载
  autoUpdater.autoRunAppAfterInstall = true

  // 监听事件
  setupEventListeners()

  // 延迟 3 秒后自动检查更新（等待窗口完全加载）
  setTimeout(() => {
    console.log('[updater] 启动时自动检查更新...')
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[updater] 自动检查更新失败:', err)
    })
  }, 3000)
}

/** 设置事件监听 */
function setupEventListeners(): void {
  // 发现新版本
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('[updater] 发现新版本:', info.version)
    sendToRenderer('update:available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseName: info.releaseName,
      releaseDate: info.releaseDate,
    })
  })

  // 已是最新版本
  autoUpdater.on('update-not-available', () => {
    console.log('[updater] 已是最新版本')
    sendToRenderer('update:not-available', null)
  })

  // 下载进度
  autoUpdater.on('download-progress', (progressInfo) => {
    const progress = {
      percent: Math.round(progressInfo.percent),
      bytesPerSecond: progressInfo.bytesPerSecond,
      transferred: progressInfo.transferred,
      total: progressInfo.total,
    }
    sendToRenderer('update:progress', progress)
  })

  // 下载完成
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    console.log('[updater] 更新下载完成:', info.version)
    sendToRenderer('update:downloaded', {
      version: info.version,
    })
  })

  // 更新错误
  autoUpdater.on('error', (error: Error) => {
    console.error('[updater] 更新错误:', error.message)
    sendToRenderer('update:error', {
      message: error.message,
    })
  })
}

/** 手动检查更新 */
export async function checkForUpdate(): Promise<void> {
  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[updater] 检查更新失败:', message)
    sendToRenderer('update:error', { message })
  }
}

/** 下载更新 */
export async function downloadUpdate(): Promise<void> {
  try {
    await autoUpdater.downloadUpdate()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[updater] 下载更新失败:', message)
    sendToRenderer('update:error', { message })
  }
}

/** 安装更新并重启 */
export function quitAndInstall(): void {
  console.log('[updater] 退出并安装更新...')
  autoUpdater.quitAndInstall()
}

/** 向渲染进程发送事件 */
function sendToRenderer(channel: string, data: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}