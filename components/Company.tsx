
import React, { useState, useEffect } from 'react';
import { Building2, Save, Mail, Phone, MapPin, FileText, Globe, Upload, CheckCircle, Instagram, Facebook, Search, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Company as CompanyType } from '../types';

interface CompanyProps {
  company: CompanyType;
  onSave: (company: CompanyType) => void;
}

export const Company: React.FC<CompanyProps> = ({ company, onSave }) => {
  const [formData, setFormData] = useState<CompanyType>(company);
  const [isSaved, setIsSaved] = useState(false);
  const [isSearchingCnpj, setIsSearchingCnpj] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setFormData(company);
  }, [company]);

  const fetchCnpjData = async (cnpj: string) => {
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) return;

    setIsSearchingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanedCnpj}`);
      if (!response.ok) throw new Error('CNPJ não encontrado');

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        name: data.razao_social || prev.name,
        tradeName: data.nome_fantasia || prev.tradeName,
        address: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''}, ${data.bairro}, ${data.municipio} - ${data.uf}`,
        email: data.email || prev.email,
        phone: data.ddd_telefone_1 || prev.phone,
        cnpj: cnpj // Mantém o formatado pelo usuário se desejar
      }));
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      alert("Não foi possível localizar os dados deste CNPJ automaticamente.");
    } finally {
      setIsSearchingCnpj(false);
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj.replace(/\D/g, '').length === 14) {
      fetchCnpjData(formData.cnpj);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cnpj || !formData.email) {
      alert("Por favor, preencha todos os campos obrigatórios (*)");
      return;
    }
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...((prev as any)[parent]), [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Perfil da Empresa</h3>
          <p className="text-slate-500">Configure os dados institucionais e identidade visual do sistema.</p>
        </div>
        {isSaved && (
          <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg font-bold animate-bounce">
            <CheckCircle size={18} />
            <span>Dados salvos com sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 mb-6 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer group relative overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <>
                  <Upload size={40} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase mt-3 tracking-widest">Enviar Logotipo</span>
                </>
              )}
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setFormData({ ...formData, logo: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            <h4 className="font-extrabold text-slate-900 text-lg">{formData.name || 'Nome da Empresa'}</h4>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{formData.cnpj || 'CNPJ não informado'}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200 text-white">
            <h4 className="font-bold mb-3 flex items-center text-blue-400"><Globe size={18} className="mr-2" /> Presença Digital</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input name="website" value={formData.website || ''} onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 text-white" placeholder="www.exemplo.com.br" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input name="socialMedia.instagram" value={formData.socialMedia?.instagram || ''} onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 text-white" placeholder="@suaempresa" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input name="socialMedia.facebook" value={formData.socialMedia?.facebook || ''} onChange={handleChange} className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs outline-none focus:border-blue-500 text-white" placeholder="/suaempresa" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>CNPJ (Apenas Números) *</span>
                  {isSearchingCnpj && <span className="flex items-center text-blue-600 animate-pulse lowercase font-normal"><Loader2 size={10} className="animate-spin mr-1" /> buscando...</span>}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    onBlur={handleCnpjBlur}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-mono"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => fetchCnpjData(formData.cnpj)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                    title="Buscar dados automaticamente"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Inscrição Estadual</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="stateRegistration" value={formData.stateRegistration || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Razão Social *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome Fantasia</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="tradeName" value={formData.tradeName || ''} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900" required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900" required />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Endereço Fiscal e Operacional</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-4 text-slate-400" size={18} />
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900" placeholder="Rua, Número, Bairro, Cidade - UF" />
              </div>
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-100">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                <Lock size={12} className="mr-1" /> Senha de Fechamento de Caixa
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-bold tracking-widest"
                  placeholder="****"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 ml-1">Esta senha será solicitada para realizar operações sensíveis no caixa.</p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
              >
                <Save size={18} />
                <span>Salvar Configuração</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
