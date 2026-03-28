import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GenrePage from './pages/GenrePage'
import CyclePage from './pages/CyclePage'
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/DashboardPage'
import WeeklyDiaryPage from './pages/WeeklyDiaryPage'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/genres/:id" element={<GenrePage />} />
          <Route path="/cycles/:id" element={<CyclePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/weekly" element={<WeeklyDiaryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <InstallPrompt />
      </div>
    </BrowserRouter>
  )
}
