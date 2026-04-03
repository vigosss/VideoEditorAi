// ==========================================
// 强制更新全屏模态框
// ==========================================

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, RefreshCw, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { Progress } from './ui/Progress'
import type { UpdateInfo, UpdateProgress, UpdateError } from '@shared/types'

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'

interface ForceUpdateModalState {
  status: UpdateStatus
  updateInfo: UpdateInfo | null
  progress: UpdateProgress | null
  error: UpdateError | null
}

export function ForceUpdateModal() {
  const [state, setState] = useState<ForceUpdateModalState>({
    status: 'idle',
    updateInfo: null,
    progress: null,
    error: null,
  })

  // 是否为开发环境（开发环境不显示更新模态框）
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // 监听更新事件
  useEffect(() => {
    if (isDev) return

    const unsubAvailable = window.electronAPI.onUpdateAvailable((info) => {
      console.log('[updater] 发现新版本:', info.version)
      setState({ status: 'available', updateInfo: info, progress: null, error: null })
      // 发现新版本后自动开始下载
      setTimeout(() => {
        window.electronAPI.updaterDownload()
        setState((prev) => ({ ...prev, status: 'downloading' }))
      }, 1500)
    })

    const unsubNotAvailable = window.electronAPI.onUpdateNotAvailable(() => {
      console.log('[updater] 已是最新版本')
      setState({ status: 'idle', updateInfo: null, progress: null, error: null })
    })

    const unsubProgress = window.electronAPI.onUpdateProgress((progress) => {
      setState((prev) => ({ ...prev, status: 'downloading', progress }))
    })

    const unsubDownloaded = window.electronAPI.onUpdateDownloaded((info) => {
      console.log('[updater] 下载完成:', info.version)
      setState((prev) => ({ ...prev, status: 'downloaded', progress: null }))
      // 下载完成后自动安装重启
      setTimeout(() => {
        window.electronAPI.updaterInstall()
      }, 2000)
    })

    const unsubError = window.electronAPI.onUpdateError((error) => {
      console.error('[updater] 更新错误:', error.message)
      setState((prev) => ({ ...prev, status: 'error', error }))
    })

    return () => {
      unsubAvailable()
      unsubNotAvailable()
      unsubProgress()
      unsubDownloaded()
      unsubError()
    }
  }, [])

  // 启动时检查更新（仅生产环境）
  useEffect(() => {
    if (isDev) return
    setState((prev) => ({ ...prev, status: 'checking' }))
    window.electronAPI.updaterCheck().catch(() => {
      // 忽略错误，由 onUpdateError 回调处理
    })
  }, [isDev])

  // 重试
  const handleRetry = useCallback(() => {
    setState({ status: 'checking', updateInfo: null, progress: null, error: null })
    window.electronAPI.updaterCheck()
  }, [])

  // 是否显示模态框（idle 时不显示，checking 完成后如果没有更新也不显示）
  const showModal = state.status !== 'idle'

  // 格式化文件大小
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // 格式化下载速度
  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`
  }

  // 获取发布说明文本
  const getReleaseNotes = (): string => {
    if (!state.updateInfo?.releaseNotes) return ''
    if (typeof state.updateInfo.releaseNotes === 'string') {
      return state.updateInfo.releaseNotes
    }
    if (Array.isArray(state.updateInfo.releaseNotes)) {
      return state.updateInfo.releaseNotes.map((n) => n.note).join('\n')
    }
    return ''
  }

  return (
    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* 全屏遮罩 — 完全阻止底层交互 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)' }}
          />

          {/* 模态框内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* 顶部渐变光线 */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-primary), var(--color-accent), transparent)',
                opacity: 0.6,
              }}
            />

            <div className="p-8">
              {/* 图标 + 标题 */}
              <div className="mb-6 flex flex-col items-center text-center">
                {/* 应用图标 */}
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  <Zap className="h-8 w-8 text-white" />
                </div>

                <h2
                  className="mb-1 text-xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {state.status === 'checking' && '正在检查更新...'}
                  {state.status === 'available' && '发现新版本'}
                  {state.status === 'downloading' && '正在下载更新...'}
                  {state.status === 'downloaded' && '更新准备就绪'}
                  {state.status === 'error' && '更新失败'}
                </h2>

                {state.updateInfo && (
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    最新版本：v{state.updateInfo.version}
                  </p>
                )}
              </div>

              {/* 发布说明 */}
              {state.updateInfo && getReleaseNotes() && state.status !== 'error' && (
                <div
                  className="mb-6 max-h-32 overflow-y-auto rounded-xl p-3 text-sm"
                  style={{
                    background: 'var(--input-bg)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {getReleaseNotes()}
                </div>
              )}

              {/* 进度条区域 */}
              {(state.status === 'checking' || state.status === 'downloading') && (
                <div className="mb-4">
                  <Progress
                    value={state.status === 'checking' ? 0 : (state.progress?.percent ?? 0)}
                    size="lg"
                    showPercent
                    className="mb-3"
                  />
                  {state.status === 'downloading' && state.progress && (
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span>
                        {formatBytes(state.progress.transferred)} / {formatBytes(state.progress.total)}
                      </span>
                      <span>{formatSpeed(state.progress.bytesPerSecond)}</span>
                    </div>
                  )}
                  {state.status === 'checking' && (
                    <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      正在连接更新服务器...
                    </p>
                  )}
                </div>
              )}

              {/* 下载完成提示 */}
              {state.status === 'downloaded' && (
                <div className="mb-4 flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5" style={{ color: '#22C55E' }} />
                  <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
                    下载完成，正在准备安装重启...
                  </span>
                </div>
              )}

              {/* 错误状态 */}
              {state.status === 'error' && (
                <div className="mb-6">
                  <div
                    className="mb-4 flex items-start gap-3 rounded-xl p-4"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: '1px' }}
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#EF4444' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                        更新下载失败
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {state.error?.message || '网络连接异常，请检查网络后重试'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRetry}
                    className="btn-glow flex w-full items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    重试
                  </button>
                </div>
              )}

              {/* 下载中动画提示 */}
              {state.status === 'downloading' && (
                <div className="flex items-center justify-center gap-2">
                  <Download className="h-4 w-4 animate-bounce" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    请勿关闭应用，更新将自动安装
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}