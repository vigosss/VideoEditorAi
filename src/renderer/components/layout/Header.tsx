import { useState, useEffect } from 'react'
import { Sun, Moon, Minus, Square, X } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'

/** 判断是否为 macOS */
const isMac = window.electronAPI?.platform === 'darwin'

export function Header() {
  const { theme, setTheme } = useAppStore()
  const [isMaximized, setIsMaximized] = useState(false)

  // 监听窗口最大化状态
  useEffect(() => {
    const checkMaximized = async () => {
      const maximized = await window.electronAPI?.windowIsMaximized()
      setIsMaximized(!!maximized)
    }
    checkMaximized()
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleMinimize = () => {
    window.electronAPI?.windowMinimize()
  }

  const handleMaximize = async () => {
    await window.electronAPI?.windowMaximize()
    const maximized = await window.electronAPI?.windowIsMaximized()
    setIsMaximized(!!maximized)
  }

  const handleClose = () => {
    window.electronAPI?.windowClose()
  }

  return (
    <header
      className="flex h-9 shrink-0 items-center justify-between border-b border-dark-700/50 bg-dark-900/60 backdrop-blur-md"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* 左侧：macOS 红绿灯按钮留白 */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        {isMac ? (
          <div className="w-20" /> /* 为 macOS traffic lights 预留空间 */
        ) : (
          <div className="flex items-center px-3">
            {/* 主题切换按钮 */}
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="h-6 w-6 rounded-md p-0 text-dark-400 hover:text-white"
              title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 中间拖拽区域（自动填充） */}
      <div className="flex-1" />

      {/* 右侧按钮区域 */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* macOS：主题切换 */}
        {isMac && (
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="mr-2 h-6 w-6 rounded-md p-0 text-dark-400 hover:text-white"
            title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        {/* Windows/Linux：窗口控制按钮 */}
        {!isMac && (
          <div className="flex items-center">
            <button
              onClick={handleMinimize}
              className="inline-flex h-9 w-11 items-center justify-center text-dark-400 transition-colors hover:bg-dark-700/50 hover:text-white"
              title="最小化"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              onClick={handleMaximize}
              className="inline-flex h-9 w-11 items-center justify-center text-dark-400 transition-colors hover:bg-dark-700/50 hover:text-white"
              title={isMaximized ? '还原' : '最大化'}
            >
              {isMaximized ? (
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="5" width="8" height="8" rx="1" />
                  <path d="M5 5V3.5A1.5 1.5 0 0 1 6.5 2H12.5A1.5 1.5 0 0 1 14 3.5V9.5A1.5 1.5 0 0 1 12.5 11H11" />
                </svg>
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="inline-flex h-9 w-11 items-center justify-center text-dark-400 transition-colors hover:bg-red-500 hover:text-white"
              title="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}