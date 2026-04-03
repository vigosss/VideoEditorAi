import { useState, useCallback } from 'react'
import { useRoutes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from './stores/appStore'
import { routes } from './router'
import { ForceUpdateModal } from './components/ForceUpdateModal'
import { SplashScreen } from './components/SplashScreen'

function App() {
  const element = useRoutes(routes)
  const { theme } = useAppStore()
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onFinish={handleSplashFinish} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {element}
            <ForceUpdateModal />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme={theme === 'dark' ? 'dark' : 'light'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App
