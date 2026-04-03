import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

/** 确保目录存在，不存在则递归创建 */
function ensureDir(dir: string): string {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** 应用用户数据目录 */
export function getUserDataPath(): string {
  return app.getPath('userData')
}

/** 数据库文件路径 */
export function getDatabasePath(): string {
  return join(getUserDataPath(), 'video-editor.db')
}

/** 临时文件目录 */
export function getTempDir(): string {
  return ensureDir(join(getUserDataPath(), 'temp'))
}

/** 项目输出目录 */
export function getProjectsDir(): string {
  return ensureDir(join(getUserDataPath(), 'projects'))
}

/** 获取某个项目的目录 */
export function getProjectDir(projectId: string): string {
  return ensureDir(join(getProjectsDir(), projectId))
}

/** FFmpeg 二进制文件目录（开发/生产环境路径不同） */
export function getFfmpegPath(): string {
  // 生产环境：打包在 resources/ffmpeg 目录下
  // 开发环境：使用系统安装的 ffmpeg
  if (app.isPackaged) {
    return join(process.resourcesPath, 'ffmpeg')
  }
  return 'ffmpeg' // 开发环境依赖系统 PATH
}

/** Whisper 模型存储目录 */
export function getWhisperModelsDir(): string {
  return ensureDir(join(getUserDataPath(), 'whisper-models'))
}

/** 日志目录 */
export function getLogsDir(): string {
  return ensureDir(join(getUserDataPath(), 'logs'))
}