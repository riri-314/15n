import './App.css'
import { AuthProvider } from './providers/AuthProvider'
import { DataProvider } from './providers/DataProvider'
import Router from './routes/Sections'

function App() {

  return (
    <AuthProvider>
      <DataProvider>
        <Router />
      </DataProvider>
    </AuthProvider>
  )
}

export default App
