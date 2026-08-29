import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CallScannerPage } from './pages/CallScannerPage';
import { CheckPage } from './pages/CheckPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { LearnPage } from './pages/LearnPage';
import { LoginPage } from './pages/LoginPage';
import { NoticeVerifierPage } from './pages/NoticeVerifierPage';
import { ReportPage } from './pages/ReportPage';
import { TrackPage } from './pages/TrackPage';
import { VolunteersPage } from './pages/VolunteersPage';
export default function App() {
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "report", element: _jsx(ReportPage, {}) }), _jsx(Route, { path: "check", element: _jsx(CheckPage, {}) }), _jsx(Route, { path: "call-scanner", element: _jsx(CallScannerPage, {}) }), _jsx(Route, { path: "notice-verifier", element: _jsx(NoticeVerifierPage, {}) }), _jsx(Route, { path: "track", element: _jsx(TrackPage, {}) }), _jsx(Route, { path: "learn", element: _jsx(LearnPage, {}) }), _jsx(Route, { path: "login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "volunteers", element: _jsx(VolunteersPage, {}) }), _jsx(Route, { path: "contact", element: _jsx(ContactPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }));
}
