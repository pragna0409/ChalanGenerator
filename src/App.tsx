import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { ClientManagement } from './components/ClientManagement';
import { InventoryManagement } from './components/InventoryManagement';
import { ChalanForm } from './components/ChalanForm';
import { History } from './components/History';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'clients':
        return <ClientManagement onNavigate={handleNavigate} />;
      case 'inventory':
        return <InventoryManagement onNavigate={handleNavigate} />;
      case 'create-chalan':
        return <ChalanForm onNavigate={handleNavigate} />;
      case 'history':
        return <History onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (!isAuthenticated) {
    return <><AuthForm /></>;
  }

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { isAuthenticated } = useAuth();

  return (
    <DataProvider isAuthenticated={isAuthenticated}>
      <AppContent />
    </DataProvider>
  );
}

export default App;