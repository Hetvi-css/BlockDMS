import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyDocuments from './pages/MyDocuments';
import UploadDocument from './pages/UploadDocument';
import DocumentDetail from './pages/DocumentDetail';
import PendingApprovals from './pages/PendingApprovals';
import AuditLogs from './pages/AuditLogs';
import BlockchainExplorer from './pages/BlockchainExplorer';
import VerifyDocument from './pages/VerifyDocument';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<MyDocuments />} />
        <Route path="documents/upload" element={<UploadDocument />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="approvals" element={<ProtectedRoute roles={['hod','admin']}><PendingApprovals /></ProtectedRoute>} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="blockchain" element={<ProtectedRoute roles={['admin','hod']}><BlockchainExplorer /></ProtectedRoute>} />
        <Route path="verify" element={<VerifyDocument />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['admin','hod']}><Reports /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '8px' }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
