import { motion } from 'motion/react'
import { useParams } from 'react-router-dom'
import { FileVideo } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-card flex flex-col items-center justify-center py-20">
        <FileVideo className="mb-4 h-16 w-16 text-dark-600" />
        <p className="mb-2 text-lg text-dark-400">项目详情</p>
        <p className="text-sm text-dark-500">项目 ID: {id}</p>
      </div>
    </motion.div>
  )
}