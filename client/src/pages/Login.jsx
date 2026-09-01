import { useState } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Loader2, Sun, Moon, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, Check } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow state
  // forgotStep: 1 = Enter Email, 2 = Enter & Verify Code, 3 = Set New Password
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { user, login, forgotPassword, verifyResetCode, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // If already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

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

  // Step 1: Request Code by Email
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!resetEmail) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(resetEmail);
    setIsSubmitting(false);

    if (result.success) {
      setInfoMsg(`Un e-mail contenant votre code de vérification à 6 chiffres a été envoyé à ${resetEmail}.`);
      setResetCode(''); // Clean empty field for professional entry
      setForgotStep(2);
    } else {
      setError(result.error);
    }
  };

  // Step 2: Verify 6-digit Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!resetCode || resetCode.length !== 6) {
      setError('Veuillez saisir le code à 6 chiffres reçu par e-mail');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyResetCode(resetEmail, resetCode);
    setIsSubmitting(false);

    if (result.success) {
      setInfoMsg('Code de vérification validé avec succès. Choisissez votre nouveau mot de passe.');
      setForgotStep(3);
    } else {
      setError(result.error);
    }
  };

  // Step 3: Set and Confirm New Password
  const handleFinalResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!newPassword || !confirmPassword) {
      setError('Veuillez remplir les deux champs de mot de passe');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(resetEmail, resetCode, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setInfoMsg(result.message || 'Votre mot de passe a été réinitialisé avec succès !');
      setEmail(resetEmail);
      setPassword('');
      setIsForgotMode(false);
      setForgotStep(1);
    } else {
      setError(result.error);
    }
  };

  const switchToForgot = () => {
    setIsForgotMode(true);
    setForgotStep(1);
    setResetEmail(email || 'anassghamam60@gmail.com');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setInfoMsg('');
  };

  const switchToLogin = () => {
    setIsForgotMode(false);
    setForgotStep(1);
    setError('');
    setInfoMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden theme-transition" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Theme toggle on login page */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 theme-toggle-btn p-2.5 rounded-full transition-colors z-20 w-10 h-10 flex items-center justify-center cursor-pointer"
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
          {isForgotMode ? (
            <div className="h-16 w-16 bg-[#0284C7]/20 rounded-2xl flex items-center justify-center border border-[#0284C7]/30 shadow-[0_0_15px_rgba(2,132,199,0.5)]">
              <KeyRound className="h-10 w-10 text-[#0284C7]" />
            </div>
          ) : (
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center border border-[#0284C7]/30 shadow-[0_0_15px_rgba(2,132,199,0.5)] p-1.5">
              <img src="/logo.png" alt="BTP Manager" className="h-full w-full object-contain" />
            </div>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {isForgotMode ? 'Mot de passe oublié' : 'Gestion de Chantier BTP'}
        </h2>
        <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {isForgotMode
            ? 'Réinitialisation sécurisée de votre compte'
            : 'Connectez-vous pour accéder à votre espace'}
        </p>

        {/* Step indicator for forgot password flow */}
        {isForgotMode && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${forgotStep >= 1 ? 'bg-[#0284C7] text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`h-0.5 w-8 transition-all ${forgotStep >= 2 ? 'bg-[#0284C7]' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${forgotStep >= 2 ? 'bg-[#0284C7] text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <div className={`h-0.5 w-8 transition-all ${forgotStep >= 3 ? 'bg-[#0284C7]' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold transition-all ${forgotStep >= 3 ? 'bg-[#0284C7] text-white' : 'bg-gray-200 text-gray-500'}`}>
              3
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-card py-8 px-4 sm:px-10">

          {/* Alert messages */}
          {error && (
            <div className="mb-6 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] px-4 py-3 rounded-lg text-sm flex items-center">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-6 bg-[#16A34A]/10 border border-[#16A34A]/30 text-[#16A34A] px-4 py-3 rounded-lg text-sm flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-[#16A34A]" />
              <span className="block sm:inline">{infoMsg}</span>
            </div>
          )}

          {!isForgotMode ? (
            /* --- LOGIN FORM --- */
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
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
                    placeholder="anassghamam60@gmail.com"
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
                  <label htmlFor="remember-me" className="ml-2 block text-sm cursor-pointer" style={{ color: 'var(--text-tertiary)' }}>
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={switchToForgot}
                    className="font-medium text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0284C7] hover:bg-[#0369A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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
          ) : (
            /* --- FORGOT PASSWORD MULTI-STEP FLOW --- */
            <div>
              {forgotStep === 1 && (
                /* STEP 1: Enter email */
                <form className="space-y-6" onSubmit={handleRequestCode}>
                  <div>
                    <label htmlFor="resetEmail" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Adresse Email du compte
                    </label>
                    <p className="text-xs mb-2 mt-1" style={{ color: 'var(--text-muted)' }}>
                      Saisissez votre e-mail pour recevoir votre code de vérification à 6 chiffres.
                    </p>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <input
                        id="resetEmail"
                        name="resetEmail"
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full pl-10 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all sm:text-sm"
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="anassghamam60@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0284C7] hover:bg-[#0369A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                          Envoi en cours...
                        </>
                      ) : (
                        'Envoyer le code par e-mail'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                /* STEP 2: Enter & Verify Code */
                <form className="space-y-6" onSubmit={handleVerifyCode}>
                  <div>
                    <label htmlFor="resetCode" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Code de Vérification (6 chiffres)
                    </label>
                    <p className="text-xs mb-2 mt-1" style={{ color: 'var(--text-muted)' }}>
                      Entrez le code à 6 chiffres reçu dans votre boîte Gmail.
                    </p>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <input
                        id="resetCode"
                        name="resetCode"
                        type="text"
                        maxLength={6}
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.trim())}
                        className="block w-full pl-10 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all sm:text-sm font-mono tracking-widest text-center text-lg"
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="123456"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting || resetCode.length !== 6}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0284C7] hover:bg-[#0369A1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284C7] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                          Vérification...
                        </>
                      ) : (
                        'Vérifier le code'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                /* STEP 3: Enter New Password & Confirm */
                <form className="space-y-6" onSubmit={handleFinalResetPassword}>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Nouveau Mot de Passe
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0284C7] focus:border-transparent transition-all sm:text-sm"
                        style={{
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-primary)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="••••••••"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Confirmer le Nouveau Mot de Passe
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#16A34A] hover:bg-[#15803D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                          Validation...
                        </>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Check className="h-5 w-5" />
                          Valider le nouveau mot de passe
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Login Button */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
