import { useRoutes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useAppStore } from './stores/appStore'
import { routes } from './router'

function App() {
  const element = useRoutes(routes)
  const { theme } = useAppStore()

  return (
    <>
      {element}
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
    </>
  )
}

export default App
