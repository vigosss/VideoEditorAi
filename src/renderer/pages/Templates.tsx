import { useEffect, useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { toast } from 'react-toastify'
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Search,
  Loader2,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import type { PromptTemplate } from '@shared/types'

/** 模板表单数据 */
interface TemplateFormData {
  name: string
  content: string
}

export default function Templates() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 模态框状态
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [formData, setFormData] = useState<TemplateFormData>({ name: '', content: '' })
  const [saving, setSaving] = useState(false)

  // 删除确认
  const [deleteTarget, setDeleteTarget] = useState<PromptTemplate | null>(null)
  const [deleting, setDeleting] = useState(false)

  /** 加载模板列表 */
  const fetchTemplates = useCallback(async () => {
    try {
      const list = await window.electronAPI.listTemplates()
      setTemplates(list)
    } catch {
      toast.error('加载模板列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  /** 过滤模板 */
  const filteredTemplates = templates.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
  })

  /** 打开新建模态框 */
  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({ name: '', content: '' })
    setModalOpen(true)
  }

  /** 打开编辑模态框 */
  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template)
    setFormData({ name: template.name, content: template.content })
    setModalOpen(true)
  }

  /** 保存模板（新建/编辑） */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.warning('请输入模板名称')
      return
    }
    if (!formData.content.trim()) {
      toast.warning('请输入模板内容')
      return
    }

    setSaving(true)
    try {
      if (editingTemplate) {
        await window.electronAPI.updateTemplate(editingTemplate.id, formData.name.trim(), formData.content.trim())
        toast.success('模板已更新')
      } else {
        await window.electronAPI.createTemplate(formData.name.trim(), formData.content.trim())
        toast.success('模板已创建')
      }
      setModalOpen(false)
      fetchTemplates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存模板失败')
    } finally {
      setSaving(false)
    }
  }

  /** 确认删除 */
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await window.electronAPI.deleteTemplate(deleteTarget.id)
      toast.success('模板已删除')
      setDeleteTarget(null)
      fetchTemplates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除模板失败')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Prompt 模板管理
          </h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            管理你的 Prompt 模板，在创建项目时快速选择使用
          </p>
        </div>
        <Button glow onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          新建模板
        </Button>
      </div>

      {/* 搜索栏 */}
      <div
        className="glass-card flex items-center gap-3 px-4 py-3"
      >
        <Search className="h-4 w-4 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="搜索模板名称或内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* 模板列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
            }}
          >
            <FileText className="h-8 w-8 text-primary-400" />
          </div>
          <p className="mb-1 text-base font-medium" style={{ color: 'var(--text-primary)' }}>
            {searchQuery ? '没有找到匹配的模板' : '还没有模板'}
          </p>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {searchQuery ? '尝试其他关键词搜索' : '点击上方"新建模板"按钮创建你的第一个 Prompt 模板'}
          </p>
          {!searchQuery && (
            <Button variant="secondary" onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              新建模板
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="glass-card group relative p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                      }}
                    >
                      <FileText className="h-4 w-4 text-primary-400" />
                    </div>
                    <h3 className="truncate text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                      {template.name}
                    </h3>
                  </div>
                  <p
                    className="line-clamp-2 text-sm leading-relaxed"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {template.content}
                  </p>
                </div>

                {/* 操作按钮 */}
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="h-8 w-8 !p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(template)}
                    className="h-8 w-8 !p-0 hover:!text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 新建/编辑模态框 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? '编辑模板' : '新建模板'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button glow onClick={handleSave} loading={saving}>
              {editingTemplate ? '保存修改' : '创建模板'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="模板名称"
            placeholder="例如：精彩片段集锦"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              模板内容
            </label>
            <textarea
              className="input-glow w-full resize-none"
              rows={5}
              placeholder="输入 Prompt 模板内容，例如：帮我找出视频中所有精彩片段..."
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>
        </div>
      </Modal>

      {/* 删除确认模态框 */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="确认删除"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              取消
            </Button>
            <Button
              variant="secondary"
              onClick={handleConfirmDelete}
              loading={deleting}
              className="!bg-red-500/20 !text-red-400 hover:!bg-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              确认删除
            </Button>
          </>
        }
      >
        <p>
          确定要删除模板「<span className="font-medium" style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</span>」吗？此操作不可撤销。
        </p>
      </Modal>
    </motion.div>
  )
}