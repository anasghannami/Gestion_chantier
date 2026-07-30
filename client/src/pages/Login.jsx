import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HardHat, Mail, Lock, Loader2, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden theme-transition" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Theme toggle on login page */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 theme-toggle-btn p-2.5 rounded-full transition-colors z-20 w-10 h-10 flex items-center justify-center"
        style={{ 
          color: 'var(--text-tertiary)',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}
        title={theme === 'dark' ? 'Mode Jour' : 'Mode Nuit'}
      >
        <span className="icon-sun flex items-center justify-center">
          <Sun className="h-5 w-5" />
        </span>
        <span className="icon-moon">
          <Moon className="h-5 w-5" />
        </span>
      </button>

      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0284C7] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EA580C] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-[#16A34A] rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-[#0284C7]/20 rounded-2xl flex items-center justify-center border border-[#0284C7]/30 shadow-[0_0_15px_rgba(2,132,199,0.5)]">
            <HardHat className="h-10 w-10 text-[#0284C7]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Gestion de Chantier BTP
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] px-4 py-3 rounded-lg text-sm flex items-center">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Adresse Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all sm:text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="admin@btp.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Mot de Passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all sm:text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded text-[#0284C7] focus:ring-[#0284C7]"
                  style={{ 
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-primary)'
                  }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[#0284C7] hover:text-[#0369A1] transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0284C7] hover:bg-[#0369A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                    Connexion...
                  </>
                ) : (
                  'Se Connecter'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
