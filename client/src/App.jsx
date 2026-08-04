import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chantiers from './pages/Chantiers';
import ChantierDetail from './pages/ChantierDetail';
import Fournisseurs from './pages/Fournisseurs';
import FournisseurDetail from './pages/FournisseurDetail';
import Commandes from './pages/Commandes';
import Factures from './pages/Factures';
import Planning from './pages/Planning';
import Ouvriers from './pages/Ouvriers';
import Devis from './pages/Devis';
import Stocks from './pages/Stocks';
import SousTraitants from './pages/SousTraitants';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#0284C7]"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chantiers" element={<Chantiers />} />
          <Route path="/chantiers/:id" element={<ChantierDetail />} />
          <Route path="/devis" element={<Devis />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/ouvriers" element={<Ouvriers />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/fournisseurs" element={<Fournisseurs />} />
          <Route path="/fournisseurs/:id" element={<FournisseurDetail />} />
          <Route path="/sous-traitants" element={<Navigate to="/ouvriers" replace />} />
          <Route path="/commandes" element={<Commandes />} />
          <Route path="/factures" element={<Factures />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}



export default App;
