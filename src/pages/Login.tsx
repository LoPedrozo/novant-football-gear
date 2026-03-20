import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen flex items-center justify-center bg-[#f2efea]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white border border-[#eae7e0] p-10 mx-4"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-lg font-bold tracking-[8px] text-[#1A2F23] uppercase">NOVANT</Link>
          <h2 className="text-[10px] font-extrabold text-[#1A2F23] mt-8 uppercase tracking-[5px]">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>
          <p className="text-xs text-[#aaaaaa] mt-2 tracking-wider font-light">
            {isRegister ? 'Preencha os dados para se cadastrar' : 'Acesse sua conta Novant'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <Label htmlFor="name" className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">Nome completo</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-2 rounded-none border-[#eae7e0] focus:border-[#7BAF8E] focus-visible:ring-[#7BAF8E]" required />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="mt-2 rounded-none border-[#eae7e0] focus:border-[#7BAF8E] focus-visible:ring-[#7BAF8E]" required />
          </div>
          <div>
            <Label htmlFor="password" className="text-[10px] font-medium text-[#1A2F23] uppercase tracking-[2.5px]">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-2 rounded-none border-[#eae7e0] focus:border-[#7BAF8E] focus-visible:ring-[#7BAF8E]" required minLength={6} />
          </div>
          <button
            type="submit"
            className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#1A2F23]/90 transition-colors duration-300 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Carregando...' : isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setIsRegister(!isRegister)} className="text-[10px] text-[#7BAF8E] hover:text-[#1A2F23] font-medium uppercase tracking-[2.5px] transition-colors duration-300">
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
