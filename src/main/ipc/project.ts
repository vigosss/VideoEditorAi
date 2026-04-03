import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  getClipsByProject,
} from '../services/database'
import type { CreateProjectParams, Project } from '../../shared/project'

/** 注册项目相关 IPC 处理器 */
export function registerProjectIPC(): void {
  // 创建项目
  ipcMain.handle(IPC_CHANNELS.PROJECT_CREATE, async (_event, params: CreateProjectParams): Promise<Project> => {
    if (!params.name?.trim()) {
      throw new Error('项目名称不能为空')
    }
    if (!params.videoPath?.trim()) {
      throw new Error('视频路径不能为空')
    }
    return createProject(params)
  })

  // 获取项目列表
  ipcMain.handle(IPC_CHANNELS.PROJECT_LIST, async (): Promise<Project[]> => {
    return listProjects()
  })

  // 获取单个项目
  ipcMain.handle(IPC_CHANNELS.PROJECT_GET, async (_event, id: string): Promise<Project | null> => {
    if (!id) {
      throw new Error('项目 ID 不能为空')
    }
    return getProject(id)
  })

  // 更新项目
  ipcMain.handle(IPC_CHANNELS.PROJECT_UPDATE, async (_event, id: string, data: Partial<Project>): Promise<Project> => {
    if (!id) {
      throw new Error('项目 ID 不能为空')
    }
    return updateProject(id, data)
  })

  // 删除项目
  ipcMain.handle(IPC_CHANNELS.PROJECT_DELETE, async (_event, id: string): Promise<void> => {
    if (!id) {
      throw new Error('项目 ID 不能为空')
    }
    deleteProject(id)
  })

  // 获取项目的剪辑片段
  ipcMain.handle(IPC_CHANNELS.PROJECT_GET_CLIPS, async (_event, projectId: string) => {
    if (!projectId) {
      throw new Error('项目 ID 不能为空')
    }
    return getClipsByProject(projectId)
  })

  console.log('[ipc] 项目 IPC 处理器已注册')
}