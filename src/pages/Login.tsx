import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen pt-16 flex items-center justify-center bg-secondary">
      <div className="w-full max-w-md bg-background rounded-lg p-8 shadow-sm mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-black tracking-wider text-foreground">NOVANT</Link>
          <h2 className="text-xl font-bold text-foreground mt-4">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isRegister ? 'Preencha os dados para se cadastrar' : 'Acesse sua conta Novant'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Nome completo</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-1" required />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" required minLength={6} />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold" disabled={loading}>
            {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-primary hover:text-accent transition-colors font-medium">
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
