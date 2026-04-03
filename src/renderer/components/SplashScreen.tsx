import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface SplashScreenProps {
  onFinish: () => void
}

/** 粒子数据 */
interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  opacity: number
}

/** 光环粒子 */
interface RingParticle {
  id: number
  angle: number
  radius: number
  size: number
  duration: number
  delay: number
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'enter' | 'loading' | 'exit'>('enter')

  // 生成背景粒子
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2,
      opacity: Math.random() * 0.5 + 0.1,
    }))
  }, [])

  // 生成光环粒子
  const ringParticles = useMemo<RingParticle[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      radius: 90,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 2 + 3,
      delay: Math.random() * 0.5,
    }))
  }, [])

  // 进度条动画
  useEffect(() => {
    if (phase === 'enter') {
      const timer = setTimeout(() => setPhase('loading'), 800)
      return () => clearTimeout(timer)
    }

    if (phase === 'loading') {
      const duration = 2800
      const interval = 30
      const steps = duration / interval
      let current = 0

      const timer = setInterval(() => {
        current++
        // 缓动效果 - 先快后慢
        const t = current / steps
        const eased = 1 - Math.pow(1 - t, 3)
        setProgress(Math.min(eased * 100, 100))

        if (current >= steps) {
          clearInterval(timer)
          setPhase('exit')
        }
      }, interval)

      return () => clearInterval(timer)
    }

    if (phase === 'exit') {
      const timer = setTimeout(() => {
        onFinish()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [phase, onFinish])

  return (
    <AnimatePresence>
      {phase !== 'exit' ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at center, #0E1425 0%, #080C18 50%, #020408 100%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* 背景粒子 */}
          <div className="absolute inset-0">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: p.id % 3 === 0
                    ? 'rgba(99, 102, 241, 0.8)'
                    : p.id % 3 === 1
                      ? 'rgba(139, 92, 246, 0.8)'
                      : 'rgba(6, 182, 212, 0.8)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, p.opacity, 0],
                  scale: [0, 1, 0.5],
                  y: [0, -30, -60],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* 中心辉光 */}
          <motion.div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* 主内容 */}
          <div className="relative flex flex-col items-center">
            {/* Logo 外围旋转光环 */}
            <motion.div
              className="absolute"
              style={{
                width: 180,
                height: 180,
              }}
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 0.6, rotate: 360 }}
              transition={{
                opacity: { duration: 0.8, delay: 0.3 },
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              }}
            >
              <svg viewBox="0 0 180 180" className="h-full w-full">
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
                <circle
                  cx="90"
                  cy="90"
                  r="85"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="40 20 10 20"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* 第二圈反向旋转光环 */}
            <motion.div
              className="absolute"
              style={{
                width: 200,
                height: 200,
              }}
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 0.4, rotate: -360 }}
              transition={{
                opacity: { duration: 1, delay: 0.5 },
                rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
              }}
            >
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <defs>
                  <linearGradient id="ringGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="url(#ringGrad2)"
                  strokeWidth="1"
                  strokeDasharray="20 40 60 30"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>

            {/* 光环粒子 */}
            {ringParticles.map((rp) => (
              <motion.div
                key={`ring-${rp.id}`}
                className="absolute rounded-full"
                style={{
                  width: rp.size,
                  height: rp.size,
                  background: 'rgba(99, 102, 241, 0.9)',
                  boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)',
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: rp.duration,
                  delay: 0.8 + rp.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <motion.div
                  className="h-full w-full rounded-full"
                  animate={{
                    x: [Math.cos((rp.angle * Math.PI) / 180) * rp.radius, Math.cos(((rp.angle + 360) * Math.PI) / 180) * rp.radius],
                    y: [Math.sin((rp.angle * Math.PI) / 180) * rp.radius, Math.sin(((rp.angle + 360) * Math.PI) / 180) * rp.radius],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            ))}

            {/* Logo */}
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
            >
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 0 40px rgba(99, 102, 241, 0.3), 0 0 80px rgba(139, 92, 246, 0.15), inset 0 0 20px rgba(99, 102, 241, 0.1)',
                }}
              >
                <img
                  src="./logo.png"
                  alt="Logo"
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    // 如果 logo 加载失败，显示文字 fallback
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    if (target.parentElement) {
                      target.parentElement.innerHTML = '<span style="font-size:32px;font-weight:700;background:linear-gradient(135deg,#6366F1,#8B5CF6);-webkit-background-clip:text;-webkit-text-fill-color:transparent">AI</span>'
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* 脉冲波纹效果 */}
            <motion.div
              className="absolute"
              style={{
                width: 96,
                height: 96,
                borderRadius: 16,
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{
                duration: 2,
                delay: 1,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.div
              className="absolute"
              style={{
                width: 96,
                height: 96,
                borderRadius: 16,
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2.5 }}
              transition={{
                duration: 2,
                delay: 1.7,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            {/* 标题文字 */}
            <motion.div
              className="mt-8 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              {/* 主标题 - 逐字动画 */}
              <div className="flex items-center">
                {'老兵AI智剪'.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #E8ECF8, #6366F1, #8B5CF6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 1 + i * 0.08,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* 副标题 */}
              <motion.p
                className="mt-2 text-xs tracking-widest"
                style={{ color: 'rgba(137, 146, 176, 0.7)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                AI 驱动的智能视频剪辑
              </motion.p>
            </motion.div>

            {/* 加载进度条 */}
            <motion.div
              className="mt-10"
              style={{ width: 200 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              {/* 进度条背景 */}
              <div
                className="h-1 w-full overflow-hidden rounded-full"
                style={{ background: 'rgba(99, 102, 241, 0.1)' }}
              >
                {/* 进度条填充 */}
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #06B6D4)',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>

              {/* 进度文字 */}
              <motion.div
                className="mt-3 text-center text-xs"
                style={{ color: 'rgba(137, 146, 176, 0.5)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                {progress < 100 ? '正在初始化...' : '准备就绪'}
              </motion.div>
            </motion.div>
          </div>

          {/* 四角装饰线 */}
          <svg className="absolute left-0 top-0 h-20 w-20 opacity-20">
            <motion.line
              x1="20" y1="0" x2="20" y2="0"
              animate={{ y1: 0, y2: 40 }}
              stroke="#6366F1" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.5 }}
            />
            <motion.line
              x1="0" y1="20" x2="0" y2="20"
              animate={{ x1: 0, x2: 40 }}
              stroke="#6366F1" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </svg>
          <svg className="absolute right-0 top-0 h-20 w-20 opacity-20">
            <motion.line
              x1="60" y1="0" x2="60" y2="0"
              animate={{ y1: 0, y2: 40 }}
              stroke="#8B5CF6" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.6 }}
            />
            <motion.line
              x1="80" y1="20" x2="80" y2="20"
              animate={{ x1: 80, x2: 40 }}
              stroke="#8B5CF6" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.6 }}
            />
          </svg>
          <svg className="absolute bottom-0 left-0 h-20 w-20 opacity-20">
            <motion.line
              x1="20" y1="80" x2="20" y2="80"
              animate={{ y1: 80, y2: 40 }}
              stroke="#06B6D4" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.7 }}
            />
            <motion.line
              x1="0" y1="60" x2="0" y2="60"
              animate={{ x1: 0, x2: 40 }}
              stroke="#06B6D4" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </svg>
          <svg className="absolute bottom-0 right-0 h-20 w-20 opacity-20">
            <motion.line
              x1="60" y1="80" x2="60" y2="80"
              animate={{ y1: 80, y2: 40 }}
              stroke="#6366F1" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.8 }}
            />
            <motion.line
              x1="80" y1="60" x2="80" y2="60"
              animate={{ x1: 80, x2: 40 }}
              stroke="#6366F1" strokeWidth="1"
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </svg>
        </motion.div>
      ) : (
        <motion.div
          className="fixed inset-0 z-[9999]"
          style={{
            background: 'radial-gradient(ellipse at center, #0E1425 0%, #080C18 50%, #020408 100%)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onAnimationComplete={() => onFinish()}
        />
      )}
    </AnimatePresence>
  )
}