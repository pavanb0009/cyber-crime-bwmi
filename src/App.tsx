import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CheckPage } from './pages/CheckPage'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { ReportPage } from './pages/ReportPage'
import { TrackPage } from './pages/TrackPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="check" element={<CheckPage />} />
        <Route path="track" element={<TrackPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
