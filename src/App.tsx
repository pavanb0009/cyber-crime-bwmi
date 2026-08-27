import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CallScannerPage } from './pages/CallScannerPage'
import { CheckPage } from './pages/CheckPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { ReportPage } from './pages/ReportPage'
import { TrackPage } from './pages/TrackPage'
import { VolunteersPage } from './pages/VolunteersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="check" element={<CheckPage />} />
        <Route path="call-scanner" element={<CallScannerPage />} />
        <Route path="track" element={<TrackPage />} />
        <Route path="learn" element={<LearnPage />} />
        <Route path="volunteers" element={<VolunteersPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
