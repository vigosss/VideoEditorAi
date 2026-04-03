#!/usr/bin/env node
/**
 * FFmpeg 预处理脚本
 * 从 npm 包中提取 FFmpeg/ffprobe 二进制文件，复制到 resources/ffmpeg/ 目录
 * 用于 electron-builder 打包时作为 extraResources 包含
 */

const fs = require('fs')
const path = require('path')

const RESOURCES_FFMPEG_DIR = path.join(__dirname, '..', 'resources', 'ffmpeg')

function prepareFfmpeg() {
  // 确保 resources/ffmpeg 目录存在
  if (!fs.existsSync(RESOURCES_FFMPEG_DIR)) {
    fs.mkdirSync(RESOURCES_FFMPEG_DIR, { recursive: true })
  }

  const isWin = process.platform === 'win32'
  const ext = isWin ? '.exe' : ''

  // 获取 @ffmpeg-installer/ffmpeg 的二进制路径
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
    const srcFfmpeg = ffmpegInstaller.path
    const destFfmpeg = path.join(RESOURCES_FFMPEG_DIR, `ffmpeg${ext}`)

    if (fs.existsSync(srcFfmpeg)) {
      fs.copyFileSync(srcFfmpeg, destFfmpeg)
      // 设置可执行权限（macOS/Linux）
      if (!isWin) {
        fs.chmodSync(destFfmpeg, 0o755)
      }
      console.log(`[prepare-ffmpeg] 已复制 ffmpeg: ${srcFfmpeg} -> ${destFfmpeg}`)
    } else {
      console.warn(`[prepare-ffmpeg] ffmpeg 源文件不存在: ${srcFfmpeg}`)
    }
  } catch (err) {
    console.error(`[prepare-ffmpeg] 获取 ffmpeg 路径失败: ${err.message}`)
  }

  // 获取 ffprobe-static 的二进制路径
  try {
    const ffprobeStatic = require('ffprobe-static')
    const srcFfprobe = ffprobeStatic.path
    const destFfprobe = path.join(RESOURCES_FFMPEG_DIR, `ffprobe${ext}`)

    if (fs.existsSync(srcFfprobe)) {
      fs.copyFileSync(srcFfprobe, destFfprobe)
      // 设置可执行权限（macOS/Linux）
      if (!isWin) {
        fs.chmodSync(destFfprobe, 0o755)
      }
      console.log(`[prepare-ffmpeg] 已复制 ffprobe: ${srcFfprobe} -> ${destFfprobe}`)
    } else {
      console.warn(`[prepare-ffmpeg] ffprobe 源文件不存在: ${srcFfprobe}`)
    }
  } catch (err) {
    console.error(`[prepare-ffmpeg] 获取 ffprobe 路径失败: ${err.message}`)
  }

  // 验证结果
  const ffmpegFile = path.join(RESOURCES_FFMPEG_DIR, `ffmpeg${ext}`)
  const ffprobeFile = path.join(RESOURCES_FFMPEG_DIR, `ffprobe${ext}`)

  if (fs.existsSync(ffmpegFile) && fs.existsSync(ffprobeFile)) {
    console.log('[prepare-ffmpeg] ✅ FFmpeg 二进制文件准备完成')
  } else {
    console.error('[prepare-ffmpeg] ❌ FFmpeg 二进制文件不完整，请检查')
    process.exit(1)
  }
}

prepareFfmpeg()