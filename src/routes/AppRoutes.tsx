import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Dashboard } from '@/pages/Dashboard';
import { Categories } from '@/pages/Categories';
import { PaymentModes, Expenses } from '@/pages/Placeholders';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';

const DashboardLayout: React.FC = () => (
  <div className="flex min-h-screen bg-background">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-y-auto">
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="payment-modes" element={<PaymentModes />} />
        <Route path="expenses" element={<Expenses />} />
      </Routes>
    </main>
  </div>
);

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<DashboardLayout />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);
