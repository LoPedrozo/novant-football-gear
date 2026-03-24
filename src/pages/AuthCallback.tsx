import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        toast.error('Erro ao autenticar. Tente novamente.');
        navigate('/');
        return;
      }
      toast.success('Bem-vindo à Novant!');
      navigate('/');
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7BAF8E] mx-auto mb-4" />
        <p className="text-[10px] uppercase tracking-[3px] text-[#aaaaaa]">Autenticando...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
