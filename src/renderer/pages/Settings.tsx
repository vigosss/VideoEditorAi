import { motion } from 'motion/react'
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card flex flex-col items-center justify-center py-20">
        <SettingsIcon className="mb-4 h-16 w-16 text-dark-600" />
        <p className="mb-2 text-lg text-dark-400">设置</p>
        <p className="text-sm text-dark-500">配置 API Key、模型、输出格式等</p>
      </div>
    </motion.div>
  )
}