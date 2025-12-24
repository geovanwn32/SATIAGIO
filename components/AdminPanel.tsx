
import React, { useState, useEffect } from 'react';
import {
    Users,
    ShieldCheck,
    Search,
    Filter,
    MoreVertical,
    Lock,
    Unlock,
    Trash2,
    AlertTriangle,
    Calendar,
    DollarSign,
    TrendingUp,
    CreditCard,
    LogOut,
    Building,
    Key,
    Eye,
    CheckCircle,
    XCircle,
    RefreshCw
} from 'lucide-react';
import { Company as CompanyType, UserAccount } from '../types';
import { database } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';

interface AdminPanelProps {
    onLogout: () => void;
    currentUser: any; // Firebase User
}

interface AdminStats {
    totalCompanies: number;
    totalUsers: number;
    activeLicenses: number;
    blockedLicenses: number;
    revenue: number; // Placeholder
}

interface CompanyWithMetadata extends Omit<CompanyType, 'createdAt'> {
    id: string;
    userCount?: number;
    ownerEmail?: string;
    adminNotes?: string;
    status: 'active' | 'blocked' | 'pending';
    lastLogin?: number;
    createdAt?: number | string;
    providers?: string[];
    paymentStatus?: 'em_dia' | 'pendente' | 'atrasado';
    permissions?: string[];
}

const ALL_MODULES = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'sales', label: 'Vendas (PDV)', icon: DollarSign },
    { id: 'inventory', label: 'Estoque', icon: Users }, // Reuse generic icon or match App.tsx
    { id: 'purchases', label: 'Compras', icon: Building },
    { id: 'finance', label: 'Financeiro', icon: CreditCard },
    { id: 'quotes', label: 'Orçamentos', icon: TrendingUp },
    { id: 'registration', label: 'Cadastros', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: Calendar },
    { id: 'ai-assistant', label: 'IA Assistente', icon: AlertTriangle },
    { id: 'settings', label: 'Configurações', icon: Key },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, currentUser }) => {
    // ... existing state ...
    const [companies, setCompanies] = useState<CompanyWithMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'companies' | 'finance' | 'logs'>('companies');

    // Modal State
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [editingUser, setEditingUser] = useState<CompanyWithMetadata | null>(null);
    const [tempPermissions, setTempPermissions] = useState<string[]>([]);

    // Stats
    const [stats, setStats] = useState<AdminStats>({
        totalCompanies: 0,
        totalUsers: 0,
        activeLicenses: 0,
        blockedLicenses: 0,
        revenue: 0
    });

    const [fetchError, setFetchError] = useState<string | null>(null);

    // Generic Update Handler
    const handleUpdateField = async (userId: string, path: string, value: any) => {
        try {
            const updates: any = {};
            updates[`usuarios/${userId}/${path}`] = value;
            // Auto-update timestamp
            updates[`usuarios/${userId}/perfil/updatedAt`] = Date.now();

            // Auto rules: if payment is 'em_dia' and license is active -> status = approved? 
            // Keep it simple: just update the field requested.

            await update(ref(database), updates);
        } catch (e: any) {
            alert("Erro ao atualizar: " + e.message);
        }
    };

    // Permission Handlers
    const handleOpenPermissions = (user: CompanyWithMetadata) => {
        setEditingUser(user);
        setTempPermissions(user.permissions || []);
        setShowPermissionsModal(true);
    };

    const handleTogglePermission = (moduleId: string) => {
        setTempPermissions(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSavePermissions = async () => {
        if (!editingUser) return;
        try {
            // Update permissions in DB
            const updates: any = {};
            updates[`usuarios/${editingUser.id}/perfil/permissoes`] = tempPermissions;
            await update(ref(database), updates);

            // Close Modal
            setShowPermissionsModal(false);
            setEditingUser(null);
            // Alert or Toast could go here
        } catch (e: any) {
            alert("Erro ao salvar permissões: " + e.message);
        }
    };

    useEffect(() => {
        const usersRef = ref(database, 'usuarios');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            setFetchError(null);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const companiesList: CompanyWithMetadata[] = [];
                let totalUsers = 0;
                let activeCounts = 0;
                let blockedCounts = 0;

                Object.keys(data).forEach(key => {
                    const userData = data[key];
                    const perfil = userData.perfil || {};
                    const licenca = userData.licenca || {};
                    const pagamento = userData.pagamento || {};

                    const name = userData.nome || perfil.nome || perfil.name || 'Sem Nome';
                    const email = userData.email || perfil.email || 'N/A';
                    const rawStatus = userData.status || 'pendente';
                    const subUsers = userData.sub_usuarios ? Object.keys(userData.sub_usuarios).length : 0;

                    let status: 'active' | 'blocked' | 'pending' = 'pending';

                    if (rawStatus === 'pendente' || rawStatus === 'Aguardando Liberação') {
                        status = 'pending';
                    } else if ((rawStatus === 'aprovado' || rawStatus === 'active') && licenca.ativa) {
                        status = 'active';
                        activeCounts++;
                    } else {
                        status = 'blocked';
                        blockedCounts++;
                    }

                    companiesList.push({
                        ...perfil,
                        id: key,
                        name: name,
                        email: email,
                        licenseStatus: status === 'active' ? 'Ativo' : (status === 'pending' ? 'Pendente' : 'Bloqueado'),
                        licenseType: licenca.tipo || 'Gratuito',
                        licenseExpiresAt: licenca.validade || '',
                        paymentStatus: pagamento.status || 'pendente',
                        permissions: perfil.permissoes || [], // Fetch permissions
                        userCount: subUsers,
                        status: status,
                        ownerEmail: email,
                        lastLogin: userData.ultimoLogin || perfil.ultimoLogin,
                        createdAt: userData.criadoEm || perfil.criadoEm,
                        providers: userData.provedores || perfil.provedores || [],
                        _rawData: userData
                    });
                });

                // ... sorting ...
                companiesList.sort((a, b) => {
                    // ... same sort ...
                    const getPriority = (s: string) => {
                        if (s === 'Pendente') return 0;
                        if (s === 'Ativo') return 1;
                        return 2;
                    };
                    const pA = getPriority(a.licenseStatus);
                    const pB = getPriority(b.licenseStatus);
                    if (pA !== pB) return pA - pB;
                    return (a.name || '').localeCompare(b.name || '');
                });

                setCompanies(companiesList);
                setStats({
                    totalCompanies: companiesList.length,
                    totalUsers: companiesList.reduce((acc, curr) => acc + (curr.userCount || 0), 0),
                    activeLicenses: activeCounts,
                    blockedLicenses: blockedCounts,
                    revenue: companiesList.length * 97.00
                });
            } else {
                setCompanies([]);
                // ... reset stats ...
                setStats({
                    totalCompanies: 0,
                    totalUsers: 0,
                    activeLicenses: 0,
                    blockedLicenses: 0,
                    revenue: 0
                });
            }
            setIsLoading(false);
        }, (error) => {
            console.error(error);
            setFetchError(error.message);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // ... handleUpdateStatus ...
    const handleUpdateStatus = async (companyId: string, status: 'Ativo' | 'Bloqueado') => {
        try {
            const updates: any = {};
            if (status === 'Ativo') {
                updates[`usuarios/${companyId}/status`] = 'aprovado';
                updates[`usuarios/${companyId}/licenca/ativa`] = true;
            } else {
                updates[`usuarios/${companyId}/status`] = 'bloqueado';
                updates[`usuarios/${companyId}/licenca/ativa`] = false;
            }
            updates[`usuarios/${companyId}/perfil/updatedAt`] = Date.now();
            await update(ref(database), updates);
        } catch (e: any) { alert(e.message); }
    };

    // ... handleUpdateLicense (KEEP for the generic button, but we also have inline now) ...
    const handleUpdateLicense = async (companyId: string, type: 'Gratuito' | 'Bronze' | 'Prata' | 'Ouro', monthsToAdd: number) => {
        // ... exisitng logic ...
        try {
            const currentExp = new Date();
            currentExp.setMonth(currentExp.getMonth() + monthsToAdd);

            const updates: any = {};
            updates[`usuarios/${companyId}/licenca/tipo`] = type;
            updates[`usuarios/${companyId}/licenca/validade`] = currentExp.toISOString().split('T')[0];
            updates[`usuarios/${companyId}/licenca/ativa`] = true;
            updates[`usuarios/${companyId}/status`] = 'aprovado';

            await update(ref(database), updates);
            alert("Licença renovada com sucesso!");
        } catch (e: any) {
            alert("Erro: " + e.message);
        }
    };

    // ... currentTab ...
    const [currentTab, setCurrentTab] = useState<'todos' | 'pendentes' | 'ativos' | 'bloqueados'>('pendentes');

    const filteredCompanies = companies.filter(c =>
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.cnpj && c.cnpj.includes(searchTerm))) &&
        (currentTab === 'todos' ? true :
            currentTab === 'pendentes' ? c.licenseStatus === 'Pendente' :
                currentTab === 'ativos' ? c.licenseStatus === 'Ativo' :
                    c.licenseStatus === 'Bloqueado')
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* ... Stats Grid ... (Kept same) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(filteredCompanies.length === 0 && !isLoading) || fetchError ? (
                    <div className="col-span-full text-center p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                        <p className="font-bold mb-1">Diagnóstico de Erro</p>
                        {fetchError ? (
                            <>
                                <p>Erro do Firebase: <b>{fetchError}</b></p>
                                <p className="text-xs mt-1">Verifique as Regras de Segurança no Firebase Console.</p>
                            </>
                        ) : (
                            <p>Nenhuma empresa encontrada no nó 'usuarios'. Verifique se existem dados gravados.</p>
                        )}
                        <p className="text-xs mt-2 text-slate-500">Usuário Logado: <b>{currentUser?.email}</b></p>

                        {!fetchError && (
                            <button
                                onClick={async () => {
                                    if (!currentUser) return;
                                    try {
                                        const updates: any = {};
                                        const uid = currentUser.id || currentUser.uid;
                                        updates[`usuarios/${uid}/nome`] = currentUser.name || 'Admin Master';
                                        updates[`usuarios/${uid}/email`] = currentUser.email;
                                        updates[`usuarios/${uid}/status`] = 'aprovado';
                                        updates[`usuarios/${uid}/licenca/ativa`] = true;
                                        updates[`usuarios/${uid}/licenca/tipo`] = 'Vitalício';
                                        updates[`usuarios/${uid}/perfil/criadoEm`] = Date.now();

                                        await update(ref(database), updates);
                                        alert("Seu cadastro de Admin foi recriado com sucesso! A lista deve atualizar.");
                                    } catch (e: any) {
                                        alert("Erro ao criar cadastro: " + e.message);
                                    }
                                }}
                                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                            >
                                Forçar Criação do Meu Usuário
                            </button>
                        )}
                    </div>
                ) : null}
                <div onClick={() => setCurrentTab('todos')} className={`cursor-pointer bg-white p-6 rounded-3xl border transition-all ${currentTab === 'todos' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Building size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.totalCompanies}</p>
                    <p className="text-sm text-slate-500 font-medium">Cadastros</p>
                </div>
                {/* ... Other stats ... */}
                <div onClick={() => setCurrentTab('ativos')} className={`cursor-pointer bg-white p-6 rounded-3xl border transition-all ${currentTab === 'ativos' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><CheckCircle size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ativas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.activeLicenses}</p>
                    <p className="text-sm text-slate-500 font-medium">Licenças Válidas</p>
                </div>

                <div onClick={() => setCurrentTab('bloqueados')} className={`cursor-pointer bg-white p-6 rounded-3xl border transition-all ${currentTab === 'bloqueados' ? 'border-red-500 ring-2 ring-red-100' : 'border-slate-100 hover:shadow-md'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center"><XCircle size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bloqueadas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.blockedLicenses}</p>
                    <p className="text-sm text-slate-500 font-medium">Acessos Restritos</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub-Usuários</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800">{stats.totalUsers}</p>
                    <p className="text-sm text-slate-500 font-medium">Total de Operadores</p>
                </div>
            </div>

            {/* Toolbar & Tabs */}
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-fit">
                    {[
                        { id: 'pendentes', label: 'Pendentes' },
                        { id: 'ativos', label: 'Ativos' },
                        { id: 'bloqueados', label: 'Bloqueados' },
                        { id: 'todos', label: 'Todos' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id as any)}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${currentTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por Usuário ou Email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => setIsLoading(false), 800);
                            }}>
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} /> Atualizar Lista
                        </button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                        {currentTab === 'pendentes' && <AlertTriangle className="text-amber-500" />}
                        {currentTab === 'ativos' && <CheckCircle className="text-emerald-500" />}
                        {currentTab === 'bloqueados' && <Lock className="text-red-500" />}
                        {currentTab === 'todos' && <Users className="text-blue-500" />}
                        Gestão de Usuários ({currentTab.charAt(0).toUpperCase() + currentTab.slice(1)})
                    </h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{filteredCompanies.length} Registros</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider pl-8">Usuário / Identidade</th>
                                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Plano & Licença</th>
                                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Pagamento</th>
                                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider">Validade</th>
                                <th className="p-5 font-bold text-slate-400 text-xs uppercase tracking-wider text-right pr-8">Ações Rápidas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCompanies.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : user.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{user.name || 'Usuário sem Nome'}</p>
                                                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                                <div className="flex gap-2 mt-1">
                                                    {user.providers?.map(p => (
                                                        <span key={p} className="text-[9px] uppercase tracking-widest text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                            {p.includes('google') ? 'Google' : 'Login'}
                                                        </span>
                                                    ))}
                                                    {user.tradeName && <span className="text-[9px] uppercase tracking-widest text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[100px]">{user.tradeName}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-2">
                                            <select
                                                value={user.licenseType}
                                                onChange={(e) => handleUpdateField(user.id, 'licenca/tipo', e.target.value)}
                                                className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg p-1.5 font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-32"
                                            >
                                                <option value="Gratuito">Gratuito</option>
                                                <option value="Bronze">Bronze</option>
                                                <option value="Prata">Prata</option>
                                                <option value="Ouro">Ouro</option>
                                                <option value="Vitalício">Vitalício</option>
                                            </select>
                                            <button
                                                onClick={() => handleOpenPermissions(user)}
                                                className="flex items-center text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase tracking-widest gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md w-fit transition-colors"
                                            >
                                                <Key size={10} /> Módulos ({user.permissions?.length || 0})
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <select
                                            value={user.paymentStatus || 'pendente'}
                                            onChange={(e) => handleUpdateField(user.id, 'pagamento/status', e.target.value)}
                                            className={`border text-xs rounded-lg p-1.5 font-bold focus:ring-2 focus:ring-blue-500 outline-none w-32 ${user.paymentStatus === 'em_dia' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                user.paymentStatus === 'atrasado' ? 'bg-red-50 border-red-200 text-red-700' :
                                                    'bg-amber-50 border-amber-200 text-amber-700'
                                                }`}
                                        >
                                            <option value="em_dia">Em Dia (Pago)</option>
                                            <option value="pendente">Pendente</option>
                                            <option value="atrasado">Atrasado / Inativo</option>
                                        </select>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={user.licenseExpiresAt ? new Date(user.licenseExpiresAt).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleUpdateField(user.id, 'licenca/validade', e.target.value)}
                                                className="bg-white border border-slate-200 text-slate-500 text-xs rounded-lg p-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-5 pr-8 text-right">
                                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {user.licenseStatus === 'Ativo' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'Bloqueado')}
                                                    className="p-2 bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition-all shadow-sm"
                                                    title="Bloquear Acesso"
                                                >
                                                    <Lock size={18} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUpdateStatus(user.id, 'Ativo')}
                                                    className={`p-2 rounded-xl transition-all shadow-sm flex items-center gap-2 ${user.licenseStatus === 'Pendente'
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 px-3'
                                                        : 'bg-white border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                                                        }`}
                                                    title="Liberar Acesso / Aprovar"
                                                >
                                                    {user.licenseStatus === 'Pendente' ? <><CheckCircle size={18} /> Aprovar</> : <Unlock size={18} />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCompanies.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium text-sm">Nenhum usuário encontrado com este filtro.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PERMISSIONS MODAL */}
            {showPermissionsModal && editingUser && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Módulos de Acesso</h3>
                                <p className="text-sm text-slate-500">Editando: <span className="font-bold text-blue-600">{editingUser.name}</span></p>
                            </div>
                            <button onClick={() => setShowPermissionsModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 font-bold">FECHAR</button>
                        </div>

                        <div className="p-8 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                            {ALL_MODULES.map(module => {
                                const isSelected = tempPermissions.includes(module.id);
                                return (
                                    <div
                                        key={module.id}
                                        onClick={() => handleTogglePermission(module.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                            <module.icon size={20} />
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-600'}`}>{module.label}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">{isSelected ? 'Acesso Permitido' : 'Acesso Negado'}</p>
                                        </div>
                                        {isSelected && <CheckCircle size={16} className="ml-auto text-blue-500" />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                            <button
                                onClick={() => setShowPermissionsModal(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-700 text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSavePermissions}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                            >
                                <CheckCircle size={18} /> Salvar Permissões
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
