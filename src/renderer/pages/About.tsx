import { motion } from 'motion/react'
import { Heart, Github, ExternalLink, Keyboard, Zap, Sparkles } from 'lucide-react'
import { Card } from '../components/ui/Card'

/** 快捷键列表 */
const SHORTCUTS = [
  { keys: ['⌘', 'N'], desc: '新建项目' },
  { keys: ['⌘', 'S'], desc: '保存当前项目' },
  { keys: ['⌘', ','], desc: '打开设置' },
  { keys: ['⌘', 'P'], desc: '项目列表' },
  { keys: ['Space'], desc: '播放/暂停预览' },
  { keys: ['⌘', 'Z'], desc: '撤销' },
  { keys: ['⌘', '⇧', 'Z'], desc: '重做' },
  { keys: ['Esc'], desc: '返回/关闭弹窗' },
]

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        关于
      </h2>

      {/* 应用信息 */}
      <Card>
        <div className="flex flex-col items-center py-6 text-center">
          <div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
            }}
          >
            <Sparkles className="h-10 w-10 text-primary-400" />
          </div>
          <h3 className="mb-1 text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            老兵AI智剪
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            版本 0.1.0 (Beta)
          </p>
          <p className="mt-3 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
            基于 AI 视觉大模型的智能视频剪辑工具，自动分析视频内容，一键生成精彩片段，助力短视频创作。
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://github.com/vigosss/video-editor-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <Github className="h-4 w-4" />
              GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>

      {/* 核心技术 */}
      <Card title="核心技术">
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <Zap className="h-5 w-5 text-primary-400" />, title: '智谱 GLM', desc: '视觉大模型驱动视频理解' },
            { icon: <Sparkles className="h-5 w-5 text-accent-400" />, title: 'FFmpeg', desc: '专业视频处理引擎' },
            { icon: <Heart className="h-5 w-5 text-red-400" />, title: 'Whisper', desc: 'OpenAI 语音识别转字幕' },
            { icon: <Keyboard className="h-5 w-5 text-cyan-400" />, title: 'Electron', desc: '跨平台桌面应用框架' },
          ].map((tech) => (
            <div key={tech.title} className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {tech.icon}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tech.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tech.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 快捷键 */}
      <Card title="快捷键">
        <div className="space-y-3">
          {SHORTCUTS.map((shortcut) => (
            <div key={shortcut.desc} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{shortcut.desc}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-lg border px-2 py-0.5 text-xs font-medium"
                    style={{
                      borderColor: 'var(--border-color)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 致谢 */}
      <Card>
        <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Made with <Heart className="inline h-3 w-3 text-red-500" /> by 老兵团队
        </p>
      </Card>
    </motion.div>
  )
}