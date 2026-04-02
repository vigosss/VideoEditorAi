import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'

/** 路由标题映射 */
const routeTitles: Record<string, string> = {
  '/': '首页',
  '/projects': '项目列表',
  '/settings': '设置',
  '/about': '关于',
}

export function Header() {
  const location = useLocation()
  const { theme, setTheme } = useAppStore()

  // 匹配项目详情页
  const title =
    routeTitles[location.pathname] ??
    (location.pathname.startsWith('/projects/') ? '项目详情' : '老兵AI智剪')

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark-700/50 bg-dark-900/60 px-6 backdrop-blur-md">
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-lg font-semibold text-white"
      >
        {title}
      </motion.h1>

      <div className="flex items-center gap-3">
        {/* 主题切换 */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg p-0 text-dark-400"
          title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}