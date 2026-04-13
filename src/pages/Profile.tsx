import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const PHONE_MASK = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const CEP_MASK = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

interface ProfileData {
  full_name: string;
  phone: string;
  address_zip: string;
  address_street: string;
  address_number: string;
  address_complement: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
}

const EMPTY_PROFILE: ProfileData = {
  full_name: '',
  phone: '',
  address_zip: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_neighborhood: '',
  address_city: '',
  address_state: '',
};

const INPUT_CLASS =
  'w-full rounded-none border border-gray-200 bg-white px-4 py-3 text-sm text-[#1A2F23] placeholder:text-[#aaaaaa] focus:border-[#1A2F23] focus:outline-none transition-colors';

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileData>(EMPTY_PROFILE);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/', { replace: true });
  }, [user, navigate]);

  // Load profile on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          full_name: data.full_name || user.user_metadata?.full_name || '',
          phone: data.phone || '',
          address_zip: data.address_zip || '',
          address_street: data.address_street || '',
          address_number: data.address_number || '',
          address_complement: data.address_complement || '',
          address_neighborhood: data.address_neighborhood || '',
          address_city: data.address_city || '',
          address_state: data.address_state || '',
        });
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      } else {
        setForm((f) => ({
          ...f,
          full_name: user.user_metadata?.full_name || '',
        }));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleChange = (field: keyof ProfileData, raw: string) => {
    let value = raw;
    if (field === 'phone') value = PHONE_MASK(raw);
    if (field === 'address_zip') value = CEP_MASK(raw);
    setForm((f) => ({ ...f, [field]: value }));
  };

  const lookupCep = async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          address_street: data.logradouro || f.address_street,
          address_neighborhood: data.bairro || f.address_neighborhood,
          address_city: data.localidade || f.address_city,
          address_state: data.uf || f.address_state,
        }));
      }
    } catch {
      // silently fail
    } finally {
      setFetchingCep(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        address_zip: form.address_zip,
        address_street: form.address_street,
        address_number: form.address_number,
        address_complement: form.address_complement,
        address_neighborhood: form.address_neighborhood,
        address_city: form.address_city,
        address_state: form.address_state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    setSaving(false);
    if (error) {
      console.error('Profile save error:', error);
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success('Perfil atualizado com sucesso!');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato invalido. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Imagem muito grande. Maximo 2MB.');
      return;
    }

    setUploadingAvatar(true);
    const path = `${user.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      toast.error(`Erro no upload: ${uploadError.message}`);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, avatar_url: publicUrl, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    setUploadingAvatar(false);

    if (updateError) {
      console.error('Avatar URL save error:', updateError);
      toast.error(`Erro ao salvar foto: ${updateError.message}`);
    } else {
      setAvatarUrl(publicUrl);
      toast.success('Foto atualizada com sucesso!');
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  const initials = (form.full_name || user.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <div className="mx-auto max-w-[800px] px-4 pt-16 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-[#7BAF8E]" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <h1 className="text-[10px] font-extrabold text-[#1A2F23] uppercase tracking-[5px] mb-2">
              Meu Perfil
            </h1>
            <div className="w-9 h-[1.5px] bg-[#7BAF8E] mb-4" />
            <p className="text-xs text-[#aaaaaa] mb-12">{user.email}</p>

            {/* Avatar */}
            <div className="flex flex-col items-center mb-12">
              <div className="relative h-[100px] w-[100px] rounded-full bg-[#1A2F23] flex items-center justify-center mb-4 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[#E8E3DA]">{initials}</span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-1.5 text-[10px] text-[#7BAF8E] uppercase tracking-[2px] font-medium hover:text-[#1A2F23] transition-colors disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" strokeWidth={1.5} />
                Alterar foto
              </button>
            </div>

            {/* Personal Info */}
            <section className="mb-10">
              <h2 className="text-[10px] font-bold text-[#1A2F23] uppercase tracking-[3px] mb-6">
                Informacoes Pessoais
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email || ''}
                    disabled
                    className={`${INPUT_CLASS} bg-gray-50 text-[#aaaaaa] cursor-not-allowed`}
                  />
                </div>
              </div>
            </section>

            {/* Address */}
            <section className="mb-10">
              <h2 className="text-[10px] font-bold text-[#1A2F23] uppercase tracking-[3px] mb-6">
                Endereco de Entrega
              </h2>
              <div className="grid gap-4">
                <div className="relative">
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={form.address_zip}
                    onChange={(e) => handleChange('address_zip', e.target.value)}
                    onBlur={() => lookupCep(form.address_zip)}
                    placeholder="00000-000"
                    className={INPUT_CLASS}
                  />
                  {fetchingCep && (
                    <Loader2 className="absolute right-3 top-[34px] h-4 w-4 animate-spin text-[#7BAF8E]" />
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    Rua / Logradouro
                  </label>
                  <input
                    type="text"
                    value={form.address_street}
                    onChange={(e) => handleChange('address_street', e.target.value)}
                    placeholder="Rua, Avenida..."
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                      Numero
                    </label>
                    <input
                      type="text"
                      value={form.address_number}
                      onChange={(e) => handleChange('address_number', e.target.value)}
                      placeholder="123"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={form.address_complement}
                      onChange={(e) => handleChange('address_complement', e.target.value)}
                      placeholder="Apto, bloco..."
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={form.address_neighborhood}
                    onChange={(e) => handleChange('address_neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className={INPUT_CLASS}
                  />
                </div>
                <div className="grid grid-cols-[1fr_100px] gap-4">
                  <div>
                    <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={form.address_city}
                      onChange={(e) => handleChange('address_city', e.target.value)}
                      placeholder="Cidade"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#aaaaaa] uppercase tracking-[2px] mb-1.5">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={form.address_state}
                      onChange={(e) =>
                        handleChange('address_state', e.target.value.toUpperCase().slice(0, 2))
                      }
                      placeholder="UF"
                      maxLength={2}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#1A2F23] text-[#E8E3DA] rounded-none text-[10px] uppercase tracking-[4px] font-medium py-4 hover:bg-[#243b2e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Alteracoes
            </button>

            {/* Danger zone */}
            <div className="mt-16 pt-8 border-t border-[#eae7e0]">
              <button
                onClick={handleSignOut}
                className="w-full border border-red-300 text-red-500 rounded-none text-[10px] uppercase tracking-[4px] font-medium py-3 hover:bg-red-50 transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
