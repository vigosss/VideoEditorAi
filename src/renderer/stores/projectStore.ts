import { create } from 'zustand'
import type { Project, CreateProjectParams } from '@shared/types'

interface ProjectState {
  // 项目列表
  projects: Project[]
  setProjects: (projects: Project[]) => void

  // 当前项目
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void

  // 加载状态
  loading: boolean
  setLoading: (loading: boolean) => void

  // 操作方法
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (params: CreateProjectParams) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),

  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  fetchProjects: async () => {
    set({ loading: true })
    try {
      const projects = await window.electronAPI.listProjects()
      set({ projects })
    } finally {
      set({ loading: false })
    }
  },

  fetchProject: async (id) => {
    set({ loading: true })
    try {
      const project = await window.electronAPI.getProject(id)
      set({ currentProject: project })
    } finally {
      set({ loading: false })
    }
  },

  createProject: async (params) => {
    const project = await window.electronAPI.createProject(params)
    // 刷新项目列表
    await get().fetchProjects()
    return project
  },

  deleteProject: async (id) => {
    await window.electronAPI.deleteProject(id)
    // 刷新项目列表
    await get().fetchProjects()
  },
}))