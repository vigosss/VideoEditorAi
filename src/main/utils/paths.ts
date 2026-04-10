import { app } from 'electron'
import { join, resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

/** 确保目录存在，不存在则递归创建 */
function ensureDir(dir: string): string {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** 获取项目根目录（构建产物在 dist-electron/main/，向上两级即项目根） */
function getProjectRoot(): string {
  return resolve(__dirname, '..', '..')
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

/** FFmpeg 二进制路径（开发/生产环境路径不同） */
export function getFfmpegPath(): string {
  const isWin = process.platform === 'win32'
  const ext = isWin ? '.exe' : ''

  // 生产环境：从 extraResources 中读取打包的 FFmpeg
  if (app.isPackaged) {
    const prodPath = join(process.resourcesPath, 'ffmpeg', `ffmpeg${ext}`)
    if (existsSync(prodPath)) {
      return prodPath
    }
    console.error(`[paths] Production ffmpeg not found at: ${prodPath}`)
  }

  // 开发环境：Strategy 1 — require('ffmpeg-static')
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffmpegPath = require('ffmpeg-static') as string | null
    if (ffmpegPath && typeof ffmpegPath === 'string' && existsSync(ffmpegPath)) {
      console.log(`[paths] ffmpeg resolved via require('ffmpeg-static'): ${ffmpegPath}`)
      return ffmpegPath
    }
    if (ffmpegPath) {
      console.warn(`[paths] require('ffmpeg-static') returned path but file does not exist: ${ffmpegPath}`)
    }
  } catch (err) {
    console.warn(`[paths] require('ffmpeg-static') failed: ${(err as Error).message}`)
  }

  // 开发环境：Strategy 2 — 直接路径推算（绕过 require）
  const directPath = join(getProjectRoot(), 'node_modules', 'ffmpeg-static', `ffmpeg${ext}`)
  if (existsSync(directPath)) {
    console.log(`[paths] ffmpeg resolved via direct path: ${directPath}`)
    return directPath
  }

  console.error(`[paths] All ffmpeg resolution strategies failed. Direct path also missing: ${directPath}`)
  console.error('[paths] Falling back to bare "ffmpeg" — this will fail if ffmpeg is not on PATH')
  return 'ffmpeg' // 降级：依赖系统 PATH
}

/** FFprobe 二进制路径 */
export function getFfprobePath(): string {
  const isWin = process.platform === 'win32'
  const ext = isWin ? '.exe' : ''

  // 生产环境：从 extraResources 中读取打包的 FFprobe
  if (app.isPackaged) {
    const prodPath = join(process.resourcesPath, 'ffmpeg', `ffprobe${ext}`)
    if (existsSync(prodPath)) {
      return prodPath
    }
    console.error(`[paths] Production ffprobe not found at: ${prodPath}`)
  }

  // 开发环境：Strategy 1 — require('ffprobe-static').path
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ffprobePath = require('ffprobe-static').path as string | null
    if (ffprobePath && typeof ffprobePath === 'string' && existsSync(ffprobePath)) {
      console.log(`[paths] ffprobe resolved via require('ffprobe-static'): ${ffprobePath}`)
      return ffprobePath
    }
    if (ffprobePath) {
      console.warn(`[paths] require('ffprobe-static').path returned path but file does not exist: ${ffprobePath}`)
    }
  } catch (err) {
    console.warn(`[paths] require('ffprobe-static') failed: ${(err as Error).message}`)
  }

  // 开发环境：Strategy 2 — 直接路径推算（绕过 require）
  // ffprobe-static 的二进制位于 bin/{platform}/{arch}/ffprobe{ext}
  const platform = isWin ? 'win32' : process.platform
  const arch = process.arch
  const directPath = join(
    getProjectRoot(),
    'node_modules', 'ffprobe-static', 'bin', platform, arch, `ffprobe${ext}`,
  )
  if (existsSync(directPath)) {
    console.log(`[paths] ffprobe resolved via direct path: ${directPath}`)
    return directPath
  }

  console.error(`[paths] All ffprobe resolution strategies failed. Direct path also missing: ${directPath}`)
  console.error('[paths] Falling back to bare "ffprobe" — this will fail if ffprobe is not on PATH')
  return 'ffprobe' // 降级：依赖系统 PATH
}

/** Whisper 模型存储目录 */
export function getWhisperModelsDir(): string {
  return ensureDir(join(getUserDataPath(), 'whisper-models'))
}

/** Whisper CLI 二进制路径（开发/生产环境路径不同） */
export function getWhisperCliPath(): string {
  const isWin = process.platform === 'win32'
  const ext = isWin ? '.exe' : ''

  if (app.isPackaged) {
    // 生产环境：从 extraResources 中读取打包的 whisper-cli
    return join(process.resourcesPath, 'whisper', `whisper-cli${ext}`)
  }

  // 开发环境：使用 resources/whisper/ 目录中的二进制
  const devPath = join(__dirname, '..', '..', 'resources', 'whisper', `whisper-cli${ext}`)
  if (existsSync(devPath)) {
    return devPath
  }

  // 降级：依赖系统 PATH
  return 'whisper-cli'
}

/** 日志目录 */
export function getLogsDir(): string {
  return ensureDir(join(getUserDataPath(), 'logs'))
}