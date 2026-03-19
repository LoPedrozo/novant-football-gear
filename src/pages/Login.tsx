import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-[70px] flex items-center justify-center bg-muted">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-card p-10 shadow-sm mx-4"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-xl font-black tracking-[0.2em] text-primary uppercase">NOVANT</Link>
          <h2 className="text-lg font-extrabold text-foreground mt-6 uppercase tracking-[0.1em]">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-xs text-muted-foreground mt-2 tracking-wider">
            {isRegister ? 'Preencha os dados para se cadastrar' : 'Acesse sua conta Novant'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <Label htmlFor="name" className="text-[11px] font-medium text-foreground uppercase tracking-wider">Nome completo</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-2 rounded-none" required />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-[11px] font-medium text-foreground uppercase tracking-wider">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="mt-2 rounded-none" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-[11px] font-medium text-foreground uppercase tracking-wider">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-2 rounded-none" required minLength={6} />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-semibold rounded-none text-xs uppercase tracking-[0.15em] py-6" disabled={loading}>
            {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-[11px] text-primary hover:text-primary-hover font-medium uppercase tracking-wider">
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
