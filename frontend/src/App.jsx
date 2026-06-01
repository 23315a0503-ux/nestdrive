import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { FolderProvider } from './context/FolderContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Drive from './pages/Drive.jsx';

export default function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AuthProvider>
        <FolderProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '8px',
                background: '#1E293B',
                color: '#F8FAFC',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/drive"
              element={
                <ProtectedRoute>
                  <Drive />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/drive" replace />} />
            <Route path="*" element={<Navigate to="/drive" replace />} />
          </Routes>
        </FolderProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
