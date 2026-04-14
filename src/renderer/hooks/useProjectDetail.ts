import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useProjectStore } from '../stores/projectStore'
import type { Clip, IntermediateVideo, FrameFileInfo, ClipFileInfo } from '@shared/types'
import type { PipelineProgress } from '@shared/pipeline'

export function useProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, loading, fetchProject, deleteProject } = useProjectStore()

  const [clips, setClips] = useState<Clip[]>([])
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // 中间视频列表
  const [intermediateVideos, setIntermediateVideos] = useState<IntermediateVideo[]>([])

  // 实时进度状态（本地缓存，不通过 store 刷新）
  const [liveProgress, setLiveProgress] = useState<PipelineProgress | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // AI 思考过程（reasoning_content）
  const [thinkingContent, setThinkingContent] = useState<string>('')
  const [showThinking, setShowThinking] = useState(false)

  // 关键帧图片列表
  const [frameFiles, setFrameFiles] = useState<FrameFileInfo[]>([])
  // 关键帧展开状态
  const [showFrames, setShowFrames] = useState(false)
  // 关键帧图片放大查看
  const [previewFrame, setPreviewFrame] = useState<FrameFileInfo | null>(null)

  // 剪辑片段视频文件
  const [clipFiles, setClipFiles] = useState<ClipFileInfo[]>([])

  /** 加载剪辑片段 */
  const loadClips = useCallback((projectId: string) => {
    window.electronAPI.getProjectClips(projectId).then(setClips).catch(() => {})
  }, [])

  /** 加载剪辑片段视频文件 */
  const loadClipFiles = useCallback((projectId: string) => {
    window.electronAPI.getProjectClipFiles(projectId).then(setClipFiles).catch(() => {})
  }, [])

  useEffect(() => {
    if (id) {
      fetchProject(id)
      loadClips(id)
    }
  }, [id, fetchProject, loadClips, loadClipFiles])

  /** 监听处理进度 */
  useEffect(() => {
    if (!id) return

    const cleanup = window.electronAPI.onProgress((progress: PipelineProgress) => {
      setLiveProgress(progress)

      // 捕获 AI 思考内容
      if (progress.thinkingContent) {
        setThinkingContent(progress.thinkingContent)
      }

      // 完成或失败时刷新项目状态和片段列表
      if (progress.step === 'completed') {
        toast.success('视频处理完成！')
        fetchProject(id)
        loadClips(id)
        loadClipFiles(id)
      } else if (progress.step === 'failed') {
        toast.error(progress.message || '处理失败')
        fetchProject(id)
        loadClipFiles(id)
      }
    })

    return cleanup
  }, [id, fetchProject, loadClips])

  /** 加载中间视频列表（处理完成或失败时） */
  useEffect(() => {
    if (!id) return
    if (currentProject?.status !== 'completed' && currentProject?.status !== 'failed') {
      setIntermediateVideos([])
      return
    }
    window.electronAPI.getIntermediateVideos(id).then(setIntermediateVideos).catch(() => {})
    loadClipFiles(id)
  }, [id, currentProject?.status, loadClipFiles])

  /** 展开关键帧时加载图片 Data URL */
  useEffect(() => {
    if (!id || !showFrames) return
    if (currentProject?.status !== 'completed') return
    // 仅在未加载或加载为空时请求
    if (frameFiles.length > 0 && frameFiles.some(f => f.dataUrl)) return
    window.electronAPI.getProjectFrameFiles(id, true).then(setFrameFiles).catch(() => {})
  }, [id, showFrames, currentProject?.status])

  /** 处理中的定时轮询（保底机制，每5秒刷新一次） */
  useEffect(() => {
    if (!id) return
    if (currentProject?.status !== 'processing') {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
      return
    }

    progressTimerRef.current = setInterval(() => {
      fetchProject(id)
    }, 5000)

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }
  }, [id, currentProject?.status, fetchProject])

  /** 删除项目 */
  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteProject(id)
      toast.success('项目已删除')
      navigate('/projects')
    } catch {
      toast.error('删除失败')
    } finally {
      setDeleting(false)
    }
  }

  /** 重新处理 */
  const handleRetry = async () => {
    if (!id) return
    try {
      await window.electronAPI.startProcess(id)
      toast.success('已重新开始处理')
      setLiveProgress(null)
      fetchProject(id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '启动处理失败')
    }
  }

  /** 取消处理 */
  const handleCancel = async () => {
    if (!id) return
    setCancelling(true)
    try {
      await window.electronAPI.cancelProcess(id)
      toast.info('已发送取消请求')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '取消失败')
    } finally {
      setCancelling(false)
    }
  }

  /** 加载关键帧文件列表（不带图片数据） */
  const loadFrameFileList = () => {
    if (!id) return
    window.electronAPI.getProjectFrameFiles(id, false).then((files) => {
      if (!frameFiles.length) setFrameFiles(files)
    }).catch(() => {})
  }

  return {
    // 路由
    id,
    navigate,
    // 项目数据
    project: currentProject,
    loading,
    clips,
    // 实时进度
    liveProgress,
    // AI 思考
    thinkingContent,
    showThinking,
    setShowThinking,
    // 关键帧
    frameFiles,
    showFrames,
    setShowFrames,
    previewFrame,
    setPreviewFrame,
    loadFrameFileList,
    // 中间视频
    intermediateVideos,
    // 剪辑片段视频文件
    clipFiles,
    // 操作
    deleting,
    showDeleteModal,
    setShowDeleteModal,
    cancelling,
    handleDelete,
    handleRetry,
    handleCancel,
  }
}