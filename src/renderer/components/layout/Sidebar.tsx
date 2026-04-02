import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import clsx from 'clsx'
import {
  Home,
  FolderOpen,
  Settings,
  Info,
  Scissors,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/Button'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/projects', icon: FolderOpen, label: '项目列表' },
  { to: '/settings', icon: Settings, label: '设置' },
  { to: '/about', icon: Info, label: '关于' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex h-full flex-col border-r border-dark-700/50 bg-dark-900/80 backdrop-blur-md"
    >
      {/* Logo 区域 */}
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
          <Scissors className="h-5 w-5 text-white" />
        </div>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-lg font-bold text-transparent"
          >
            老兵AI智剪
          </motion.span>
        )}
      </div>

      {/* 导航列表 */}
      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-white shadow-glow-sm'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={clsx(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-300',
                  )}
                />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 折叠按钮 */}
      <Button
        variant="ghost"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-dark-700 bg-dark-800 p-0 text-dark-400 hover:bg-dark-700 hover:text-white"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </motion.aside>
  )
}