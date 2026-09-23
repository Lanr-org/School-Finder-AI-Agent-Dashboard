import AppRoutes from './routes/index.js'
import AuthBoot from './routes/AuthBoot.js'

const App = () => {
  return (
    <AuthBoot>
      <AppRoutes />
    </AuthBoot>
  )
}

export default App