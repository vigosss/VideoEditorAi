// ==========================================
// Whisper 语音识别服务
// ==========================================

import { Whisper, WhisperFullParams, WhisperSamplingStrategy, decodeAudioAsync } from '@napi-rs/whisper'
import { getWhisperModelsDir } from '../utils/paths'
import { existsSync, unlinkSync, createWriteStream, writeFileSync, statSync, renameSync } from 'fs'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { https, http } from 'follow-redirects'
import { URL } from 'url'
import type { WhisperModelSize } from '../../shared/settings'

// ==========================================
// 类型定义
// ==========================================

/** 转录段落（带时间戳） */
export interface TranscribeSegment {
  id: number
  startTime: number  // 秒
  endTime: number    // 秒
  text: string
}

/** 转录结果 */
export interface TranscribeResult {
  segments: TranscribeSegment[]
  fullText: string
  srtPath: string
}

/** 模型信息 */
export interface ModelInfo {
  size: WhisperModelSize
  downloaded: boolean
  path: string
  fileSize: number  // 字节
}

/** 进度回调类型 */
export type ProgressCallback = (progress: number, message: string) => void

// ==========================================
// 常量
// ==========================================

/** 模型文件名映射 */
const MODEL_FILENAMES: Record<WhisperModelSize, string> = {
  tiny: 'ggml-tiny.bin',
  base: 'ggml-base.bin',
  small: 'ggml-small.bin',
}

/** 模型文件大小（字节，用于校验） */
const MODEL_EXPECTED_SIZES: Record<WhisperModelSize, number> = {
  tiny: 75 * 1024 * 1024,      // ~75MB
  base: 142 * 1024 * 1024,     // ~142MB
  small: 466 * 1024 * 1024,    // ~466MB
}

/**
 * 多源下载配置（按优先级排列）
 * 支持国内镜像自动降级
 */
const MODEL_SOURCES: Record<WhisperModelSize, string[]> = {
  tiny: [
    // 主源：HF Mirror（国内可直连的镜像，无需代理）
    'https://hf-mirror.com/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
    // 备用源1：ModelScope（阿里巴巴，国内稳定）
    'https://modelscope.cn/api/v1/models/pkufool/whisper.cpp/repo?Revision=master&FilePath=ggml-tiny.bin',
    // 备用源2：官方 HF（有代理时可用）
    'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
  ],
  base: [
    'https://hf-mirror.com/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
    'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
  ],
  small: [
    'https://hf-mirror.com/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
    'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin',
  ],
}

// ==========================================
// 模型路径管理
// ==========================================

/** 获取模型文件路径 */
export function getModelPath(size: WhisperModelSize): string {
  return join(getWhisperModelsDir(), MODEL_FILENAMES[size])
}

/** 检测模型是否已下载 */
export function isModelDownloaded(size: WhisperModelSize): boolean {
  const modelPath = getModelPath(size)
  if (!existsSync(modelPath)) return false
  // 简单校验文件大小 > 1MB（避免空文件或下载中断的文件）
  try {
    const stats = statSync(modelPath)
    return stats.size > 1024 * 1024 // 至少 1MB
  } catch {
    return false
  }
}

/** 获取所有可用模型信息 */
export function getAvailableModels(): ModelInfo[] {
  const sizes: WhisperModelSize[] = ['tiny', 'base', 'small']
  return sizes.map((size) => {
    const path = getModelPath(size)
    let fileSize = 0
    try {
      if (existsSync(path)) {
        fileSize = statSync(path).size
      }
    } catch {
      // 忽略
    }
    return {
      size,
      downloaded: isModelDownloaded(size),
      path,
      fileSize,
    }
  })
}

// ==========================================
// 模型下载（多源自动降级）
// ==========================================

/**
 * 带进度追踪的文件下载
 */
function downloadWithProgress(
  url: string,
  destPath: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const httpModule = parsedUrl.protocol === 'https:' ? https : http

    // 临时文件路径
    const tempPath = destPath + '.downloading'

    // 清理可能存在的临时文件
    try {
      if (existsSync(tempPath)) unlinkSync(tempPath)
    } catch {
      // 忽略
    }

    const file = createWriteStream(tempPath)
    let downloadedBytes = 0
    let totalBytes = 0

    const request = httpModule.get(url, (response) => {
      // 处理重定向
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close()
        try { unlinkSync(tempPath) } catch { /* 忽略 */ }
        downloadWithProgress(response.headers.location, destPath, onProgress)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        file.close()
        try { unlinkSync(tempPath) } catch { /* 忽略 */ }
        reject(new Error(`下载失败，HTTP 状态码: ${response.statusCode}`))
        return
      }

      totalBytes = parseInt(response.headers['content-length'] || '0', 10)

      response.on('data', (chunk: Buffer) => {
        downloadedBytes += chunk.length
        if (totalBytes > 0 && onProgress) {
          const progress = Math.round((downloadedBytes / totalBytes) * 100)
          onProgress(progress)
        }
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close(() => {
          // 下载完成，重命名临时文件为正式文件
          try {
            // 如果正式文件已存在，先删除
            if (existsSync(destPath)) unlinkSync(destPath)
            renameSync(tempPath, destPath)
            resolve()
          } catch (err) {
            reject(new Error(`重命名临时文件失败: ${(err as Error).message}`))
          }
        })
      })
    })

    request.on('error', (err) => {
      file.close()
      try { unlinkSync(tempPath) } catch { /* 忽略 */ }
      reject(new Error(`网络请求失败: ${err.message}`))
    })

    // 设置超时（5分钟）
    request.setTimeout(5 * 60 * 1000, () => {
      request.destroy()
      file.close()
      try { unlinkSync(tempPath) } catch { /* 忽略 */ }
      reject(new Error('下载超时'))
    })
  })
}

/**
 * 下载模型（多源自动降级）
 * 按优先级依次尝试，直到有一个成功
 */
export async function downloadModel(
  size: WhisperModelSize,
  onProgress?: ProgressCallback,
): Promise<void> {
  // 如果已下载则跳过
  if (isModelDownloaded(size)) {
    onProgress?.(100, '模型已存在，无需下载')
    return
  }

  const urls = MODEL_SOURCES[size]
  let lastError: Error | null = null

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const hostname = new URL(url).hostname

    try {
      onProgress?.(0, `正在从 ${hostname} 下载 ${size} 模型...`)
      console.log(`[Whisper] 尝试从 ${hostname} 下载 ${size} 模型 (${i + 1}/${urls.length})`)

      await downloadWithProgress(url, getModelPath(size), (progress) => {
        onProgress?.(progress, `正在下载 ${size} 模型 (${progress}%)`)
      })

      // 校验下载结果
      if (!isModelDownloaded(size)) {
        throw new Error('下载完成但模型文件校验失败')
      }

      console.log(`[Whisper] ${size} 模型下载成功`)
      onProgress?.(100, `${size} 模型下载完成`)
      return
    } catch (err) {
      console.warn(`[Whisper] 源 ${hostname} 失败: ${(err as Error).message}`)
      lastError = err as Error

      // 清理可能残留的坏文件
      try {
        const modelPath = getModelPath(size)
        if (existsSync(modelPath)) unlinkSync(modelPath)
        const tempPath = modelPath + '.downloading'
        if (existsSync(tempPath)) unlinkSync(tempPath)
      } catch {
        // 忽略
      }

      // 继续尝试下一个源
    }
  }

  // 所有源都失败
  const modelPath = getModelPath(size)
  throw new Error(
    `所有下载源均失败。您可以手动下载 ${size} 模型文件并放置到：${modelPath}\n` +
    `下载地址：https://hf-mirror.com/ggerganov/whisper.cpp/resolve/main/${MODEL_FILENAMES[size]}\n` +
    `最后错误：${lastError?.message}`,
  )
}

/** 删除模型文件 */
export function deleteModel(size: WhisperModelSize): void {
  const modelPath = getModelPath(size)
  if (existsSync(modelPath)) {
    unlinkSync(modelPath)
    console.log(`[Whisper] 已删除 ${size} 模型`)
  }
}

// ==========================================
// 音频转录
// ==========================================

/**
 * 转录音频文件，生成带时间戳的段落和 SRT 字幕文件
 * @param audioPath 音频文件路径（WAV 16kHz 单声道）
 * @param modelSize 模型大小
 * @param outputPath SRT 输出路径
 * @param onProgress 进度回调
 * @returns 转录结果
 */
export async function transcribeAudio(
  audioPath: string,
  modelSize: WhisperModelSize,
  outputPath: string,
  onProgress?: ProgressCallback,
): Promise<TranscribeResult> {
  // 校验音频文件
  if (!existsSync(audioPath)) {
    throw new Error(`音频文件不存在: ${audioPath}`)
  }

  // 校验模型文件
  if (!isModelDownloaded(modelSize)) {
    throw new Error(`${modelSize} 模型未下载，请先下载模型`)
  }

  const modelPath = getModelPath(modelSize)
  console.log(`[Whisper] 开始转录: ${audioPath}`)
  console.log(`[Whisper] 使用模型: ${modelSize} (${modelPath})`)

  onProgress?.(0, '正在加载模型...')

  // 读取模型文件
  const modelBuffer = await readFile(modelPath)

  // 创建 Whisper 实例
  const whisper = new Whisper(modelBuffer)

  onProgress?.(5, '正在解码音频...')

  // 读取并解码音频
  const audioBuffer = await readFile(audioPath)
  const samples = await decodeAudioAsync(audioBuffer, audioPath)

  onProgress?.(10, '正在转录...')

  // 收集转录段落
  const segments: TranscribeSegment[] = []
  let segmentIndex = 0

  // 配置转录参数
  const params = new WhisperFullParams(WhisperSamplingStrategy.Greedy)
  params.language = 'zh'           // 中文
  params.printProgress = false
  params.printRealtime = false
  params.printTimestamps = false
  params.singleSegment = false     // 获取所有段落
  params.noTimestamps = false       // 保留时间戳
  params.tokenTimestamps = true     // token 级时间戳
  params.splitOnWord = true         // 按词分割
  params.nThreads = 4              // 使用 4 线程

  // 进度回调
  params.onProgress = (progress: number) => {
    // Whisper 进度 0-100，映射到我们的 10-90 范围
    const mappedProgress = 10 + Math.round(progress * 0.8)
    onProgress?.(mappedProgress, `正在转录 (${progress}%)...`)
  }

  // 新段落回调
  params.onNewSegment = (segment: { text: string; start: number; end: number }) => {
    const text = segment.text.trim()
    if (text) {
      segments.push({
        id: ++segmentIndex,
        startTime: segment.start / 1000, // ms → 秒
        endTime: segment.end / 1000,
        text,
      })
    }
  }

  // 执行转录
  const fullText = whisper.full(params, samples)

  onProgress?.(90, '正在生成 SRT 字幕...')

  // 生成 SRT 文件
  const srtContent = generateSrtContent(segments)
  writeFileSync(outputPath, srtContent, 'utf-8')

  onProgress?.(100, '转录完成')

  console.log(`[Whisper] 转录完成，共 ${segments.length} 个段落`)
  console.log(`[Whisper] SRT 文件已保存: ${outputPath}`)

  return {
    segments,
    fullText: fullText.trim(),
    srtPath: outputPath,
  }
}

// ==========================================
// SRT 字幕生成
// ==========================================

/**
 * 格式化时间为 SRT 格式 (HH:MM:SS,mmm)
 */
function formatSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const millis = Math.round((seconds % 1) * 1000)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

/**
 * 根据转录段落生成 SRT 内容
 */
export function generateSrtContent(segments: TranscribeSegment[]): string {
  return segments
    .map((seg) => {
      return (
        `${seg.id}\n` +
        `${formatSrtTime(seg.startTime)} --> ${formatSrtTime(seg.endTime)}\n` +
        `${seg.text}\n`
      )
    })
    .join('\n')
}