import { motion } from 'motion/react'
import { Upload, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* 欢迎区域 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="mb-3 text-3xl font-bold text-white">
          欢迎使用{' '}
          <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            老兵AI智剪
          </span>
        </h1>
        <p className="text-dark-400">
          上传视频，输入需求，AI 自动分析并剪辑，一键发布到短视频平台
        </p>
      </motion.div>

      {/* 视频上传区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card mb-6 p-8"
      >
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-dark-600 py-16 transition-colors hover:border-primary-500/50">
          <Upload className="mb-4 h-12 w-12 text-dark-500" />
          <p className="mb-2 text-lg font-medium text-dark-300">
            拖拽视频文件到此处
          </p>
          <p className="mb-4 text-sm text-dark-500">
            或点击选择文件（支持 MP4、MOV、AVI）
          </p>
          <Button variant="secondary" size="sm">
            选择视频文件
          </Button>
        </div>
      </motion.div>

      {/* Prompt 输入区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card mb-6 p-6"
      >
        <label className="mb-2 block text-sm font-medium text-dark-300">
          剪辑需求描述
        </label>
        <textarea
          className="input-glow w-full resize-none"
          rows={4}
          placeholder="描述你对视频的剪辑需求，例如：帮我找出视频中所有精彩片段，每个片段不超过30秒..."
        />
      </motion.div>

      {/* 配置选项 + 开始按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4 text-sm text-dark-400">
          <span>模型：GLM-4.6V-FlashX</span>
          <span className="text-dark-600">|</span>
          <span>分析模式：标准</span>
        </div>
        <Button glow size="lg">
          <Sparkles className="h-5 w-5" />
          开始分析并剪辑
        </Button>
      </motion.div>
    </div>
  )
}