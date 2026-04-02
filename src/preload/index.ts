import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/types'

const api: ElectronAPI = {
  // 项目操作
  createProject: (params) => ipcRenderer.invoke('project:create', params),
  listProjects: () => ipcRenderer.invoke('project:list'),
  getProject: (id) => ipcRenderer.invoke('project:get', id),
  deleteProject: (id) => ipcRenderer.invoke('project:delete', id),
  updateProject: (id, data) => ipcRenderer.invoke('project:update', id, data),

  // 视频处理
  getVideoInfo: (filePath) => ipcRenderer.invoke('video:getInfo', filePath),
  startProcess: (projectId) => ipcRenderer.invoke('video:startProcess', projectId),
  cancelProcess: (projectId) => ipcRenderer.invoke('video:cancelProcess', projectId),
  onProgress: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as Parameters<typeof callback>[0])
    }
    ipcRenderer.on('video:progress', handler)
    return () => ipcRenderer.removeListener('video:progress', handler)
  },

  // 设置
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings) => ipcRenderer.invoke('settings:set', settings),

  // 上传
  startUpload: (projectId, platform) => ipcRenderer.invoke('upload:start', projectId, platform),
  onUploadProgress: (callback) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) => {
      callback(data as Parameters<typeof callback>[0])
    }
    ipcRenderer.on('upload:progress', handler)
    return () => ipcRenderer.removeListener('upload:progress', handler)
  },

  // 对话框
  openFileDialog: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  openDirectoryDialog: () => ipcRenderer.invoke('dialog:openDirectory'),

  // 平台信息
  platform: process.platform,

  // 窗口控制
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),
  windowIsMaximized: () => ipcRenderer.invoke('window:isMaximized'),
}

// 通过 contextBridge 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', api)