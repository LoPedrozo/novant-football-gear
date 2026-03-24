import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError('');
  };

  const switchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Bem-vindo à Novant!');
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      toast.success('Bem-vindo à Novant!');
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar com Google');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-[#f8f7f4] border border-[#eae7e0] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#1A2F23] opacity-55 hover:opacity-100 transition-opacity z-10"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Header */}
          <div className="text-center pt-10 pb-2 px-8">
            <p className="text-lg font-bold tracking-[8px] text-[#1A2F23] uppercase">NOVANT</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#eae7e0] mx-8 mt-6">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 pb-3 text-[10px] uppercase tracking-[3px] font-medium transition-all duration-300 ${
                tab === 'login'
                  ? 'text-[#1A2F23] border-b-2 border-[#1A2F23]'
                  : 'text-[#aaaaaa] border-b-2 border-transparent'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 pb-3 text-[10px] uppercase tracking-[3px] font-medium transition-all duration-300 ${
                tab === 'register'
                  ? 'text-[#1A2F23] border-b-2 border-[#1A2F23]'
                  : 'text-[#aaaaaa] border-b-2 border-transparent'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="mt-2 w-full h-11 px-3 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Senha
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full h-11 px-3 pr-10 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#1A2F23]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => toast('Em breve!')}
                  className="w-full text-[10px] text-[#7BAF8E] hover:text-[#1A2F23] uppercase tracking-[2.5px] font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#eae7e0]" />
                  <span className="text-[10px] text-[#aaaaaa] uppercase tracking-wider">ou</span>
                  <div className="flex-1 h-px bg-[#eae7e0]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[3px] font-medium py-4 hover:border-[#7BAF8E] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Entrar com Google
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="mt-2 w-full h-11 px-3 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="mt-2 w-full h-11 px-3 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Senha
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full h-11 px-3 pr-10 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#1A2F23]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">
                    Confirmar senha
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full h-11 px-3 pr-10 text-sm bg-white border border-[#eae7e0] rounded-none outline-none focus:border-[#7BAF8E] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#aaaaaa] hover:text-[#1A2F23]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Conta'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-[#eae7e0]" />
                  <span className="text-[10px] text-[#aaaaaa] uppercase tracking-wider">ou</span>
                  <div className="flex-1 h-px bg-[#eae7e0]" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full border border-[#eae7e0] text-[#1A2F23] rounded-none text-[10px] uppercase tracking-[3px] font-medium py-4 hover:border-[#7BAF8E] transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Cadastrar com Google
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
