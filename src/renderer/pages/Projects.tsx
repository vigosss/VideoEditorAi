import { motion } from 'motion/react'
import { FolderOpen } from 'lucide-react'

export default function Projects() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">项目列表</h2>
      </div>

      {/* 空状态 */}
      <div className="glass-card flex flex-col items-center justify-center py-20">
        <FolderOpen className="mb-4 h-16 w-16 text-dark-600" />
        <p className="mb-2 text-lg text-dark-400">暂无项目</p>
        <p className="text-sm text-dark-500">返回首页创建你的第一个AI剪辑项目</p>
      </div>
    </motion.div>
  )
}