import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '../../stores/appStore'

export function MainLayout() {
  const { theme } = useAppStore()

  return (
    <div className={`${theme} flex h-screen flex-col overflow-hidden`}>
      {/* 顶部标题栏（横跨全宽） */}
      <Header />

      {/* 下方：侧边栏 + 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar />

        {/* 页面内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}