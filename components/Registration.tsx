
import React, { useState, useMemo } from 'react';
import { Users, Briefcase, Smartphone, Monitor, Shield, Plus, Search, Filter, X, Save, Trash2, Edit2, Mail, Phone, MapPin, Calendar, CreditCard, Hash, Clock, ShieldCheck, AlertCircle, Key, Lock, Unlock, CheckSquare, Square, User, Wallet, Percent, BarChart3, TrendingUp, UserPlus, Grid } from 'lucide-react';
import { Client, Technician, Service, UserAccount, Module, PaymentMethod, Combo, Offer, Product } from '../types';
import { MENU_ITEMS } from '../constants';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import { StatCard } from './StatCard';

interface RegistrationProps {
  clients: Client[];
  technicians: Technician[];
  services: Service[];
  users: UserAccount[];
  paymentMethods: PaymentMethod[];
  onAddClient: (c: Client) => void;
  onAddTech: (t: Technician) => void;
  onAddService: (s: Service) => void;
  onAddUser: (u: UserAccount) => void;
  onAddPaymentMethod: (pm: PaymentMethod) => void;
  onDeleteClient: (id: string) => void;
  onDeleteTech: (id: string) => void;
  onDeleteService: (id: string) => void;
  onDeleteUser: (id: string) => void;
  onDeletePaymentMethod: (id: string) => void;
  combos: Combo[];
  offers: Offer[];
  products: Product[];
  onAddCombo: (c: Combo) => void;
  onUpdateCombo: (c: Combo) => void;
  onDeleteCombo: (id: string) => void;
  onAddOffer: (o: Offer) => void;
  onUpdateOffer: (o: Offer) => void;
  onDeleteOffer: (id: string) => void;
}

export const Registration: React.FC<RegistrationProps> = ({
  clients, technicians, services, users, paymentMethods, combos = [], offers = [], products = [],
  onAddClient, onAddTech, onAddService, onAddUser, onAddPaymentMethod,
  onDeleteClient, onDeleteTech, onDeleteService, onDeleteUser, onDeletePaymentMethod,
  onAddCombo, onUpdateCombo, onDeleteCombo, onAddOffer, onUpdateOffer, onDeleteOffer
}) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'techs' | 'services' | 'users' | 'paymentMethods' | 'combos' | 'offers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCharts, setShowCharts] = useState(true);

  // Form States
  const [clientForm, setClientForm] = useState<Partial<Client>>({ address: { zip: '', street: '', number: '', neighborhood: '', city: '', state: '' } });
  const [techForm, setTechForm] = useState<Partial<Technician>>({ commissionRate: 0, active: true });
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({ price: 0, warranty: 30 });
  const [userForm, setUserForm] = useState<Partial<UserAccount>>({ role: 'Tecnico', active: true, permissions: ['dashboard', 'help'] });
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentMethod>>({ active: true });
  const [comboForm, setComboForm] = useState<Partial<Combo>>({ items: [], price: 0 });
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({ price: 0, originalPrice: 0 });

  // Stats
  const stats = useMemo(() => {
    return {
      clients: clients.length,
      techs: technicians.filter(t => t.active).length,
      services: services.length,
      users: users.length
    };
  }, [clients, technicians, services, users]);

  // Client Growth Data (Mock logic if createdAt is missing or inconsistent, but using available data)
  const clientGrowthData = useMemo(() => {
    // Group clients by month (last 6 months)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const data = [];

    // Generate last 6 months placeholders
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const monthIdx = d.getMonth();
      const monthName = months[monthIdx];

      // Count clients created in this month
      // Assuming client.createdAt exists. If not, this flatlines.
      const count = clients.filter(c => {
        if (!c.createdAt) return false;
        const cDate = new Date(c.createdAt);
        return cDate.getMonth() === monthIdx && cDate.getFullYear() === d.getFullYear();
      }).length;

      data.push({ name: monthName, value: count });
    }
    return data;
  }, [clients]);

  const resetForms = () => {
    setEditingId(null);
    setErrors({});
    setClientForm({ address: { zip: '', street: '', number: '', neighborhood: '', city: '', state: '' } });
    setTechForm({ commissionRate: 0, active: true });
    setServiceForm({ price: 0, warranty: 30 });
    setUserForm({ role: 'Tecnico', active: true, permissions: ['dashboard', 'help'] });
    setPaymentForm({ active: true });
    setComboForm({ items: [], price: 0 });
    setOfferForm({ price: 0, originalPrice: 0 });
  };

  const handleOpenEdit = (tab: typeof activeTab, item: any) => {
    setEditingId(item.id);
    if (tab === 'clients') setClientForm(item);
    if (tab === 'techs') setTechForm(item);
    if (tab === 'services') setServiceForm(item);
    if (tab === 'users') setUserForm(item);
    if (tab === 'paymentMethods') setPaymentForm(item);
    if (tab === 'combos') setComboForm(item);
    if (tab === 'offers') setOfferForm(item);
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || Date.now().toString();

    switch (activeTab) {
      case 'clients':
        onAddClient({ ...clientForm, id, createdAt: editingId ? (clientForm.createdAt || new Date().toISOString()) : new Date().toISOString() } as Client);
        break;
      case 'techs':
        onAddTech({ ...techForm, id, admissionDate: editingId ? (techForm.admissionDate || new Date().toISOString()) : new Date().toISOString() } as Technician);
        break;
      case 'services':
        onAddService({ ...serviceForm, id } as Service);
        break;
      case 'users':
        onAddUser({ ...userForm, id } as UserAccount);
        break;
      case 'paymentMethods':
        onAddPaymentMethod({ ...paymentForm, id } as PaymentMethod);
        break;
      case 'combos':
        editingId ? onUpdateCombo({ ...comboForm, id } as Combo) : onAddCombo({ ...comboForm, id } as Combo);
        break;
      case 'offers':
        editingId ? onUpdateOffer({ ...offerForm, id } as Offer) : onAddOffer({ ...offerForm, id } as Offer);
        break;
    }

    setShowModal(false);
    resetForms();
  };

  const renderFormContent = () => {
    // ... [Content identical to original, can rely on replace if diff is smart, but write_to_file needs full content]
    // Copying form content
    switch (activeTab) {
      case 'clients':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo / Razão Social *</label>
              <input required value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Ex: João da Silva" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CPF / CNPJ *</label>
              <input required value={clientForm.cpfCnpj} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                const formatted = val.length > 11
                  ? val.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5') // CNPJ
                  : val.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4'); // CPF
                setClientForm({ ...clientForm, cpfCnpj: formatted });
              }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <input type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="joao@email.com" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp *</label>
              <input required value={clientForm.phone} onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                const formatted = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                setClientForm({ ...clientForm, phone: formatted, whatsapp: formatted });
              }} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cidade / UF</label>
              <input value={clientForm.address?.city} onChange={e => setClientForm({ ...clientForm, address: { ...clientForm.address!, city: e.target.value } })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: Goiânia - GO" />
            </div>
          </div>
        );
      case 'techs':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Técnico *</label>
              <input required value={techForm.name} onChange={e => setTechForm({ ...techForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Especialidade</label>
              <input value={techForm.specialty} onChange={e => setTechForm({ ...techForm, specialty: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: Smartphones, Notebooks" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comissão (%)</label>
              <input type="number" value={techForm.commissionRate} onChange={e => setTechForm({ ...techForm, commissionRate: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
            </div>
            <div className="col-span-2 flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="checkbox" checked={techForm.active} onChange={e => setTechForm({ ...techForm, active: e.target.checked })} className="w-5 h-5 text-blue-600 rounded-lg" />
              <span className="text-xs font-bold text-slate-600 uppercase">Técnico Ativo na Operação</span>
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição do Serviço *</label>
              <input required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Ex: Troca de Tela iPhone 11" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço de Mão de Obra (R$)</label>
              <input type="number" value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold text-blue-700" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Garantia (Dias)</label>
              <input type="number" value={serviceForm.warranty} onChange={e => setServiceForm({ ...serviceForm, warranty: parseInt(e.target.value) || 30 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tempo Estimado</label>
              <input value={serviceForm.estimatedTime} onChange={e => setServiceForm({ ...serviceForm, estimatedTime: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="Ex: 40 minutos" />
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Acesso e Identificação</h4>
              <input required placeholder="Username" value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              <input placeholder="Nome Completo" value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              <input required type="email" placeholder="E-mail" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
              <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value as any })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold">
                <option value="Admin">Administrador</option>
                <option value="Tecnico">Técnico</option>
                <option value="Vendedor">Vendedor</option>
                <option value="Master">Master</option>
              </select>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Permissões</h4>
              <div className="space-y-2">
                {MENU_ITEMS.map(item => (
                  <button key={item.id} type="button" onClick={() => {
                    const current = userForm.permissions || [];
                    setUserForm({ ...userForm, permissions: current.includes(item.id) ? current.filter(p => p !== item.id) : [...current, item.id] });
                  }} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${userForm.permissions?.includes(item.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}>
                    <span className="text-[10px] font-black uppercase">{item.label}</span>
                    {userForm.permissions?.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'paymentMethods':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Modalidade *</label>
              <input required value={paymentForm.name} onChange={e => setPaymentForm({ ...paymentForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" placeholder="Ex: Link de Pagamento" />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input type="checkbox" checked={paymentForm.active} onChange={e => setPaymentForm({ ...paymentForm, active: e.target.checked })} className="w-5 h-5 text-blue-600 rounded-lg" />
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Habilitar no sistema</label>
            </div>
          </div>
        );
      case 'combos':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome do Combo *</label>
              <input required value={comboForm.name} onChange={e => setComboForm({ ...comboForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço Sugerido (R$)</label>
              <input type="number" value={comboForm.price} onChange={e => setComboForm({ ...comboForm, price: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-blue-50 border border-blue-100 rounded-2xl outline-none font-bold text-blue-700" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Itens do Combo</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <select className="w-full p-2 text-xs border rounded-lg" onChange={(e) => {
                  if (!e.target.value) return;
                  const [type, pid] = e.target.value.split(':');
                  const newItem = type === 'product' ? { productId: pid, quantity: 1 } : { serviceId: pid, quantity: 1 };
                  setComboForm({ ...comboForm, items: [...(comboForm.items || []), newItem] });
                }}>
                  <option value="">+ Adicionar Item</option>
                  <optgroup label="Produtos">
                    {products.map(p => <option key={p.id} value={`product:${p.id}`}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Serviços">
                    {services.map(s => <option key={s.id} value={`service:${s.id}`}>{s.name}</option>)}
                  </optgroup>
                </select>
                <div className="space-y-1">
                  {comboForm.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border">
                      <span>{item.productId ? products.find(p => p.id === item.productId)?.name : services.find(s => s.id === item.serviceId)?.name}</span>
                      <button type="button" onClick={() => setComboForm({ ...comboForm, items: comboForm.items?.filter((_, i) => i !== idx) })} className="text-red-400 p-1"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'offers':
        return (
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Oferta *</label>
              <input required value={offerForm.name} onChange={e => setOfferForm({ ...offerForm, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço Promocional (R$)</label>
              <input type="number" value={offerForm.price} onChange={e => setOfferForm({ ...offerForm, price: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-orange-50 border border-orange-100 rounded-2xl outline-none font-bold text-orange-700" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço Original (R$)</label>
              <input type="number" value={offerForm.originalPrice} onChange={e => setOfferForm({ ...offerForm, originalPrice: parseFloat(e.target.value) || 0 })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-400" />
            </div>
          </div>
        );
    }
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'clients': return clients.filter(c => c.name.toLowerCase().includes(term) || c.cpfCnpj.includes(term));
      case 'techs': return technicians.filter(t => t.name.toLowerCase().includes(term));
      case 'services': return services.filter(s => s.name.toLowerCase().includes(term));
      case 'users': return users.filter(u => u.username.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
      case 'paymentMethods': return paymentMethods.filter(p => p.name.toLowerCase().includes(term));
      case 'combos': return combos.filter(c => c.name.toLowerCase().includes(term));
      case 'offers': return offers.filter(o => o.name.toLowerCase().includes(term));
      default: return [];
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">

      {/* KPI Cards */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <StatCard title="Total de Clientes" value={stats.clients} icon={<Users className="text-blue-500" />} color="bg-blue-50" />
          <StatCard title="Técnicos Ativos" value={stats.techs} icon={<Briefcase className="text-emerald-500" />} color="bg-emerald-50" />
          <StatCard title="Catálogo de Serviços" value={stats.services} icon={<Monitor className="text-purple-500" />} color="bg-purple-50" />
          <StatCard title="Usuários do Sistema" value={stats.users} icon={<Shield className="text-orange-500" />} color="bg-orange-50" />

          <div className="hidden lg:block bg-slate-900 rounded-2xl p-6 text-white text-center flex flex-col justify-center items-center shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={() => setActiveTab('users')}>
            <ShieldCheck size={32} className="mb-2 text-emerald-400" />
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Segurança</p>
            <p className="font-bold">Gerenciar Acessos</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 flex-1 flex flex-col relative overflow-hidden">
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="px-12 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editingId ? 'Editar Registro' : 'Novo Cadastro'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gestão de {activeTab}</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForms(); }} className="p-3 hover:bg-white rounded-full text-slate-400 shadow-sm transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="p-12 space-y-8 overflow-y-auto">
                {renderFormContent()}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => { setShowModal(false); resetForms(); }} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all uppercase text-xs tracking-widest">Cancelar</button>
                  <button type="submit" className="px-12 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center space-x-2">
                    <Save size={18} />
                    <span>{editingId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 border-b border-slate-100 space-x-1 overflow-x-auto">
          {[
            { id: 'clients', label: 'Clientes', icon: <Users size={16} /> },
            { id: 'techs', label: 'Técnicos', icon: <Briefcase size={16} /> },
            { id: 'services', label: 'Serviços', icon: <Monitor size={16} /> },
            { id: 'users', label: 'Usuários', icon: <Shield size={16} /> },
            { id: 'paymentMethods', label: 'Recebimento', icon: <Wallet size={16} /> },
            { id: 'combos', label: 'Combos', icon: <Grid size={16} /> },
            { id: 'offers', label: 'Ofertas', icon: <Percent size={16} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }} className={`flex items-center space-x-2 px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105 z-10' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center space-x-2 flex-1 w-full max-w-xl">
              <button onClick={() => setShowCharts(!showCharts)} className={`p-4 rounded-[2rem] transition-all shadow-sm ${showCharts ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white border border-slate-100 text-slate-400 hover:text-blue-500'}`}>
                <BarChart3 size={20} />
              </button>
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input placeholder="Filtrar registros..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900 transition-all" />
              </div>
            </div>
            <button onClick={() => { resetForms(); setShowModal(true); }} className="flex items-center space-x-3 px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95">
              <Plus size={20} />
              <span>Novo Registro</span>
            </button>
          </div>

          <div className="overflow-auto flex-1 rounded-3xl border border-slate-50 bg-slate-50/20">
            <table className="w-full text-left">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Detalhes</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData().length === 0 && (
                  <tr><td colSpan={4} className="p-20 text-center text-slate-400 italic">Nenhum registro localizado.</td></tr>
                )}
                {filteredData().map((item: any) => (
                  <tr key={item.id} className="hover:bg-white transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                          {activeTab === 'clients' && <Users size={20} />}
                          {activeTab === 'techs' && <Briefcase size={20} />}
                          {activeTab === 'services' && <Monitor size={20} />}
                          {activeTab === 'users' && <User size={20} />}
                          {activeTab === 'paymentMethods' && <Wallet size={20} />}
                          {activeTab === 'combos' && <Grid size={20} />}
                          {activeTab === 'offers' && <Percent size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{item.name || item.username}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{item.cpfCnpj || item.role || (item.id && item.id.length > 8 ? '#' + item.id.slice(-6) : item.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {activeTab === 'clients' && <div className="text-xs text-slate-500 font-medium"><p className="flex items-center"><Phone size={12} className="mr-1 opacity-50" />{item.phone}</p><p className="opacity-60 flex items-center mt-1"><Mail size={12} className="mr-1 opacity-50" />{item.email}</p></div>}
                      {activeTab === 'techs' && <div className="text-xs text-slate-500"><p className="font-bold">{item.specialty}</p><p className="font-black text-blue-600 bg-blue-50 inline-block px-1.5 py-0.5 rounded mt-1">Comissão: {item.commissionRate}%</p></div>}
                      {activeTab === 'services' && <div className="text-xs text-slate-500"><p className="font-black text-slate-800 text-sm">R$ {item.price.toFixed(2)}</p><p className="mt-1 flex items-center"><Clock size={12} className="mr-1 opacity-50" />{item.estimatedTime || 'N/A'}</p></div>}
                      {activeTab === 'users' && <div className="flex flex-wrap gap-1">{item.permissions?.slice(0, 3).map((p: string) => <span key={p} className="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase">{p}</span>)}</div>}
                      {activeTab === 'paymentMethods' && <p className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 inline-block px-2 py-1 rounded-lg">Sistema</p>}
                      {activeTab === 'combos' && <div className="text-xs text-slate-500"><p className="font-bold text-blue-600">R$ {item.price.toFixed(2)}</p><p className="opacity-60">{item.items?.length || 0} itens vinculados</p></div>}
                      {activeTab === 'offers' && <div className="text-xs text-slate-500"><p className="font-bold text-orange-600">R$ {item.price.toFixed(2)}</p><p className="line-through opacity-40">De: R$ {item.originalPrice.toFixed(2)}</p></div>}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide ${item.active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {item.active !== false ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center space-x-2">
                        <button onClick={() => handleOpenEdit(activeTab, item)} className="p-3 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 rounded-2xl shadow-sm transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => {
                          const handlers: Record<string, (id: string) => void> = {
                            clients: onDeleteClient, techs: onDeleteTech, services: onDeleteService, users: onDeleteUser, paymentMethods: onDeletePaymentMethod,
                            combos: onDeleteCombo, offers: onDeleteOffer
                          };
                          if (confirm("Deseja realmente excluir este registro?")) handlers[activeTab](item.id);
                        }} className="p-3 bg-white text-red-400 hover:bg-red-50 border border-slate-100 rounded-2xl shadow-sm transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
