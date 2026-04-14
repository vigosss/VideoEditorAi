import { motion } from 'motion/react'
import { Scissors, Play } from 'lucide-react'
import { Card } from '../ui/Card'
import type { Clip, ClipFileInfo } from '@shared/types'
import { formatTime } from './constants'

interface ClipsCardProps {
  clips: Clip[]
  clipFiles?: ClipFileInfo[]
}

export function ClipsCard({
  clips,
  clipFiles,
}: ClipsCardProps) {
  if (clips.length === 0) return null

  return (
    <Card
      title="AI 剪辑结果"
      description={`共 ${clips.length} 个片段`}
    >
      <div className="space-y-3">
        {clips.map((clip, idx) => {
          const clipFile = clipFiles?.[idx]
          const canPlay = clipFile?.exists

          return (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 rounded-xl border p-3"
              style={{ borderColor: 'var(--border-color)', background: 'var(--bg-tertiary)' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                  color: 'var(--color-primary)',
                }}
              >
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Scissors className="h-3.5 w-3.5 text-primary-400" />
                  {formatTime(clip.startTime)} — {formatTime(clip.endTime)}
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    ({Math.round(clip.endTime - clip.startTime)}秒)
                  </span>
                </div>
                {clip.reason && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {clip.reason}
                  </p>
                )}
              </div>
              <button
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  canPlay
                    ? 'cursor-pointer hover:bg-white/10'
                    : 'cursor-not-allowed opacity-40'
                }`}
                style={{
                  background: canPlay
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))'
                    : 'var(--bg-secondary)',
                }}
                onClick={() => {
                  if (canPlay && clipFile) {
                    window.electronAPI.openPath(clipFile.path)
                  }
                }}
                disabled={!canPlay}
                title={canPlay ? '播放片段' : '片段文件未生成'}
              >
                <Play className="h-4 w-4 text-primary-400" />
              </button>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
