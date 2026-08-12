import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './app/routes'
import { AuthProvider } from './features/auth/AuthProvider'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
