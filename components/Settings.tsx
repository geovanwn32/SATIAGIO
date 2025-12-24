
import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Save,
  CheckCircle, Lock, Monitor,
  Globe, Share2, CreditCard, Key, AlertCircle, Clock, Award, Zap, Calendar, CreditCard as CardIcon, Eye, EyeOff, ShieldCheck, History, Laptop, Info
} from 'lucide-react';
import { Session, UserAccount, Company as CompanyType } from '../types';
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase';


interface SettingsProps {
  sessions: Session[];
  user: UserAccount | null;
  company: CompanyType;
  onUpdateUser: (user: UserAccount) => void;
  onSaveCompany: (company: CompanyType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ sessions, user, company, onUpdateUser, onSaveCompany }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'license'>('general');
  const [showPass, setShowPass] = useState(false);

  // Local state for editing, initialized with props
  const [localCompany, setLocalCompany] = useState<CompanyType>(company);
  const [localUser, setLocalUser] = useState<UserAccount | null>(user);

  // Initialize preferences if missing
  const [preferences, setPreferences] = useState(user?.preferences || {
    notifications: { email_sales: true, email_quotes: true, push_stock: true, push_system: true }
  });

  const [passForm, setPassForm] = useState({ current: '', new: '' });

  const handleTogglePreference = (key: keyof typeof preferences.notifications) => {
    if (!localUser) return;
    const newPrefs = {
      ...preferences,
      notifications: { ...preferences.notifications, [key]: !preferences.notifications[key] }
    };
    setPreferences(newPrefs);
    onUpdateUser({ ...localUser, preferences: newPrefs });
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser || !passForm.new) return;
    try {
      await updatePassword(auth.currentUser, passForm.new);
      alert("Senha alterada com sucesso!");
      setPassForm({ current: '', new: '' });
    } catch (error: any) {
      alert("Erro ao alterar senha. Requer login recente.");
      console.error(error);
    }
  };

  const handleSaveGeneral = () => {
    onSaveCompany(localCompany);
    alert("Preferências salvas com sucesso!");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Sistema (Cabeçalho/Aba de Navegador)</label>
                <input
                  value={localCompany.systemName || ''}
                  onChange={e => setLocalCompany({ ...localCompany, systemName: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  placeholder="Ex: SATI Gestão"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fuso Horário Padrão</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-slate-600 font-medium">
                  <option>Brasília (GMT-3)</option>
                  <option>Manaus (GMT-4)</option>
                </select>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={handleSaveGeneral} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"><Save size={16} /><span>Salvar Preferências</span></button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 flex items-center"><Key size={20} className="mr-2 text-blue-500" /> Alteração de Senha Mestra</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type={showPass ? "text" : "password"} placeholder="Nova Senha" value={passForm.new} onChange={e => setPassForm({ ...passForm, new: e.target.value })} className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <button onClick={handleChangePassword} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800">Atualizar Senha</button>
            </div>

            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 flex items-center"><History size={20} className="mr-2 text-blue-500" /> Histórico de Sessões Recentes</h4>
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                    <History size={32} className="mb-2 opacity-20" />
                    <p className="italic text-xs">Nenhum registro de sessão localizado.</p>
                  </div>
                ) : sessions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Laptop size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.device}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.ip} • {new Date(s.time).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${s.status === 'Ativa' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (

          <div className="space-y-4">
            {[
              { id: 'email_sales', label: 'E-mail: Novas Vendas', desc: 'Receber e-mail quando uma venda for concluída' },
              { id: 'email_quotes', label: 'E-mail: Novos Orçamentos', desc: 'Receber e-mail quando um orçamento for criado' },
              { id: 'push_stock', label: 'Push: Estoque Baixo', desc: 'Notificação no navegador quando produto atingir estoque mínimo' },
              { id: 'push_system', label: 'Push: Avisos do Sistema', desc: 'Manutenções programadas e avisos importantes' }
            ].map((opt, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-exrabold text-slate-800 text-sm">{opt.label}</p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>
                </div>
                <div onClick={() => handleTogglePreference(opt.id as any)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${preferences.notifications[opt.id as keyof typeof preferences.notifications] ? 'bg-blue-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${preferences.notifications[opt.id as keyof typeof preferences.notifications] ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'license':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Plano Atual</span>
                    <h3 className="text-3xl font-black">SATI Àgio {company.licenseType || 'Master'}</h3>
                    <p className="text-slate-400 mt-2 text-sm max-w-md">Sua licença garante acesso completo a todos os módulos de gestão, emissão de laudos e controle financeiro.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status da Assinatura</p>
                    <p className={`text-xl font-black ${company.licenseStatus === 'Ativo' ? 'text-emerald-400' : 'text-amber-400'}`}>{company.licenseStatus}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Validade</p>
                    <p className="font-bold">{new Date(company.licenseExpiresAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Usuários</p>
                    <p className="font-bold">{company.maxUsers} Acessos</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Armazenamento</p>
                    <p className="font-bold">Ilimitado</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Suporte</p>
                    <p className="font-bold">Prioritário</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4 hover:border-blue-300 transition-colors cursor-pointer group">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-full group-hover:scale-110 transition-transform">
                  <Award size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Fazer Upgrade de Plano</h5>
                  <p className="text-xs text-slate-500 mt-1">Desbloqueie mais usuários e recursos exclusivos.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-300 transition-colors cursor-pointer group">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">Gerenciar Pagamento</h5>
                  <p className="text-xs text-slate-500 mt-1">Atualize seu cartão ou visualize faturas.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-1">
          {['general', 'license', 'security', 'notifications'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}>
              {tab === 'general' && 'Geral'}
              {tab === 'license' && 'Minha Assinatura'}
              {tab === 'security' && 'Segurança & Acesso'}
              {tab === 'notifications' && 'Notificações'}
            </button>
          ))}
        </div>
        <div className="lg:col-span-3 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
