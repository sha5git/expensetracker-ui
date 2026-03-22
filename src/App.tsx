import React from 'react';
import { AuthProvider } from '@/auth/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppRoutes } from '@/routes/AppRoutes';

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
