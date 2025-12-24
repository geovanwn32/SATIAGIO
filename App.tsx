
import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Quotes } from './components/Quotes';
import { Registration } from './components/Registration';
import { Sales } from './components/Sales';
import { Purchases } from './components/Purchases';
import { Reports } from './components/Reports';
import { Company } from './components/Company';
import { Settings } from './components/Settings';
import { Finance } from './components/Finance';
import { Help } from './components/Help';
import { AIAssistant } from './components/AIAssistant';
import { AdminPanel } from './components/AdminPanel';
import { Portfolio } from './components/Portfolio';
import { Module, Product, Quote, Client, Sale, Purchase, Company as CompanyType, Technician, Notification, Service, UserAccount, PaymentMethod, Session, Category, Closure, Combo, Offer } from './types';
import { MOCK_COMPANY } from './constants';
import { Lock, Clock } from 'lucide-react';
import { auth, database } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue, set, remove, push, get, child, update } from 'firebase/database'; // Added update

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeModule, setActiveModule] = useState<Module>('dashboard');
  const [triggerNewOS, setTriggerNewOS] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);

  const [closures, setClosures] = useState<Closure[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  // System Status State (New Architecture)
  const [accountStatus, setAccountStatus] = useState<'pendente' | 'aprovado' | 'negado' | 'inativo'>('pendente');
  const [licenseActive, setLicenseActive] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pendente' | 'em_dia' | 'atrasado'>('pendente');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [company, setCompany] = useState<CompanyType>({
    ...MOCK_COMPANY,
    licenseType: 'Gratuito',
    licenseStatus: 'Ativo',
    licenseExpiresAt: '2026-01-01',
    maxUsers: 5
  });

  // Listener de Autenticação Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);

        const normalizedEmail = firebaseUser.email?.toLowerCase().trim() || '';
        const isMasterAdmin = normalizedEmail === 'geovaniwn@gmail.com';

        // 1. Setup User Object
        const user: UserAccount = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || normalizedEmail.split('@')[0],
          fullName: firebaseUser.displayName || (isMasterAdmin ? 'Administrador' : 'Usuário SATI'),
          email: normalizedEmail,
          role: isMasterAdmin ? 'Master' : 'Admin', // Default role for account owner
          active: true,
          permissions: isMasterAdmin
            ? ['dashboard', 'sales', 'inventory', 'quotes', 'registration', 'finance', 'reports', 'company', 'settings', 'help', 'purchases', 'ai-assistant', 'marketing', 'management']
            : ['dashboard', 'sales', 'inventory', 'quotes', 'registration', 'finance', 'reports', 'company', 'settings', 'help', 'purchases', 'ai-assistant'] // marketing removed for non-admin
        };

        setCurrentUser(user);

        // 2. Check/Create User Data in DB (Strict Isolation)
        const userRootRef = ref(database, `usuarios/${firebaseUser.uid}`);
        get(userRootRef).then((snapshot) => {
          const now = Date.now();
          let dbPermissions: string[] | null = null;
          let dbName = user.fullName;

          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.perfil?.permissoes) {
              dbPermissions = data.perfil.permissoes;
            }
            if (data.nome) dbName = data.nome;
          }

          // Final permissions logic
          const finalPermissions = dbPermissions || (isMasterAdmin
            ? ['dashboard', 'sales', 'inventory', 'quotes', 'registration', 'finance', 'reports', 'company', 'settings', 'help', 'purchases', 'ai-assistant', 'marketing', 'management']
            : ['dashboard', 'sales', 'inventory', 'quotes', 'registration', 'finance', 'reports', 'company', 'settings', 'help', 'purchases', 'ai-assistant']); // marketing removed for non-admin

          // Update user object with DB data
          const updatedUser = {
            ...user,
            permissions: finalPermissions,
            fullName: dbName
          };
          setCurrentUser(updatedUser);

          if (!snapshot.exists()) {
            // New User Creation Logic
            const initialData = {
              email: normalizedEmail,
              nome: user.fullName || 'Sem Nome',
              perfil: {
                email: normalizedEmail,
                nome: user.fullName,
                criadoEm: now,
                ultimoLogin: now,
                provedores: firebaseUser.providerData.map(p => p.providerId),
                uid: firebaseUser.uid,
                permissoes: finalPermissions
              },
              status: isMasterAdmin ? 'aprovado' : 'pendente',
              licenca: {
                ativa: isMasterAdmin ? true : false,
                tipo: isMasterAdmin ? 'Vitalício' : 'Gratuito',
                validade: isMasterAdmin ? '2099-12-31' : null
              },
              pagamento: {
                status: isMasterAdmin ? 'em_dia' : 'pendente'
              },
              criadoEm: now
            };
            set(userRootRef, initialData);

            setAccountStatus(isMasterAdmin ? 'aprovado' : 'pendente');
            setLicenseActive(isMasterAdmin ? true : false);
            setPaymentStatus(isMasterAdmin ? 'em_dia' : 'pendente');
          } else {
            // Update metadata
            const currentData = snapshot.val();
            const updates: any = {};

            updates['perfil/ultimoLogin'] = now;
            updates['perfil/provedores'] = firebaseUser.providerData.map(p => p.providerId);
            updates['perfil/email'] = normalizedEmail;

            // Sync Root Fields
            if (!currentData.nome || !currentData.email || !currentData.status) {
              updates['nome'] = currentData.nome || user.fullName || 'Sem Nome';
              updates['email'] = currentData.email || normalizedEmail;
              updates['status'] = currentData.status || (isMasterAdmin ? 'aprovado' : 'pendente');
            }

            update(userRootRef, updates);

            // Set local state from DB
            setAccountStatus(currentData.status || 'pendente');
            setLicenseActive(currentData.licenca?.ativa || false);
            setPaymentStatus(currentData.pagamento?.status || 'pendente');
          }
        });

      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincronização em tempo real com Realtime Database (Strict User Path)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const userId = currentUser.id;
    const dbRef = ref(database, `usuarios/${userId}`);

    const toArray = (data: any) => data ? Object.values(data) : [];

    const unsubs = [
      onValue(child(dbRef, "clientes"), (snap) => setClients(toArray(snap.val()) as Client[])),
      onValue(child(dbRef, "estoque"), (snap) => setProducts(toArray(snap.val()) as Product[])),
      onValue(child(dbRef, "servicos"), (snap) => setServices(toArray(snap.val()) as Service[])),
      onValue(child(dbRef, "orcamentos"), (snap) => setQuotes(toArray(snap.val()) as Quote[])),
      onValue(child(dbRef, "vendas"), (snap) => setSales(toArray(snap.val()) as Sale[])),
      onValue(child(dbRef, "compras"), (snap) => setPurchases(toArray(snap.val()) as Purchase[])),
      onValue(child(dbRef, "tecnicos"), (snap) => setTechnicians(toArray(snap.val()) as Technician[])),

      // "usuarios" here refers to SUB-users (employees) of the main account
      onValue(child(dbRef, "sub_usuarios"), (snap) => setUsers(toArray(snap.val()) as UserAccount[])),

      onValue(child(dbRef, "categorias"), (snap) => setCategories(toArray(snap.val()) as Category[])),
      onValue(child(dbRef, "formasPagamento"), (snap) => setPaymentMethods(toArray(snap.val()) as PaymentMethod[])),
      onValue(child(dbRef, "notificacoes"), (snap) => setNotifications(toArray(snap.val()) as Notification[])),
      onValue(child(dbRef, "fechamentos"), (snap) => setClosures(toArray(snap.val()) as Closure[])),
      onValue(child(dbRef, "combos"), (snap) => setCombos(toArray(snap.val()) as Combo[])),
      onValue(child(dbRef, "ofertas"), (snap) => setOffers(toArray(snap.val()) as Offer[])),

      // Status & License Monitoring
      onValue(dbRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setAccountStatus(data.status || 'pendente');
          setLicenseActive(data.licenca?.ativa || false);
          setPaymentStatus(data.pagamento?.status || 'pendente');

          // Map 'empresa/perfil' (Standard) or 'perfil' (Legacy) to Company object
          const companyData = data.empresa?.perfil || data.perfil;
          if (companyData) {
            setCompany(prev => ({
              ...prev,
              ...companyData,
              licenseStatus: data.status === 'aprovado' ? 'Ativo' : 'Pendente',
              licenseType: data.licenca?.tipo || 'Gratuito',
              licenseExpiresAt: data.licenca?.validade || prev.licenseExpiresAt
            }));
          }
        }
      })
    ];

    return () => unsubs.forEach(u => u());
  }, [isAuthenticated, currentUser]);

  // Handlers Genéricos para CRUD (Realtime Database)
  const handleSaveDoc = async (collectionName: string, data: any) => {
    if (!currentUser) {
      alert("Erro de segurança: Usuário não autenticado.");
      return;
    }

    try {
      const now = Date.now();
      const userId = currentUser.id;

      // Mapeamento de nomes de coleção (Inglês cÃ³digo -> Português DB)
      const dbPathMap: Record<string, string> = {
        "products": "estoque",
        "clients": "clientes",
        "services": "servicos",
        "quotes": "orcamentos",
        "sales": "vendas",
        "purchases": "compras",
        "technicians": "tecnicos",
        "users": "sub_usuarios", // Changed from 'usuarios' to 'sub_usuarios' to avoid conflict with root
        "categories": "categorias",
        "paymentMethods": "formasPagamento",
        "notifications": "notificacoes",

        "companies": "empresa/perfil", // Changed to strict 'empresa/perfil'
        "closures": "fechamentos",
        "combos": "combos",
        "offers": "ofertas"
      };

      const pathSegment = dbPathMap[collectionName] || collectionName;

      // Preparar dados com metadados de auditoria
      const docData = {
        ...data,
        criadoPor: currentUser.id,
        criadoEm: data.createdAt ? data.createdAt : now, // Mantem original ou novo
        atualizadoEm: now
      };

      // Remove undefined fields which Firebase doesn't support
      const sanitizedData = JSON.parse(JSON.stringify(docData));

      // Se for settings da empresa
      if (collectionName === "companies") {
        // Create a multi-path update to keep root and perfil in sync
        const updates: any = {};
        const basePath = `usuarios/${userId}`;

        // Update the full perfil object to NEW STANDARD path
        updates[`${basePath}/empresa/perfil`] = sanitizedData;

        // SYNC Root fields for Admin visibility (Management Module compliance)
        if (sanitizedData.name) updates[`${basePath}/nome`] = sanitizedData.name;
        if (sanitizedData.email) updates[`${basePath}/email`] = sanitizedData.email;
        // Keep status if exists, or don't touch it

        await update(ref(database), updates);
        return;
      }

      // Para coleções normais
      await set(ref(database, `usuarios/${userId}/${pathSegment}/${data.id}`), sanitizedData);

    } catch (error) {
      console.error(`Erro ao salvar em ${collectionName}:`, error);
      alert(`Erro ao salvar dados: ${(error as any).message}`);
    }
  };

  const handleDeleteDoc = async (collectionName: string, id: string) => {
    if (!currentUser) return;

    // Don't show confirmation for notifications or if explicit bypass
    const skipConfirm = collectionName === "notifications";

    if (skipConfirm || confirm("Tem certeza que deseja excluir permanentemente este registro?")) {
      try {
        const userId = currentUser.id;
        const dbPathMap: Record<string, string> = {
          "products": "estoque",
          "clients": "clientes",
          "services": "servicos",
          "quotes": "orcamentos",
          "sales": "vendas",
          "purchases": "compras",
          "technicians": "tecnicos",
          "users": "sub_usuarios",
          "categories": "categorias",
          "paymentMethods": "formasPagamento",
          "notifications": "notificacoes",
          "closures": "fechamentos",
          "combos": "combos",
          "offers": "ofertas"
        };
        const pathSegment = dbPathMap[collectionName] || collectionName;

        await remove(ref(database, `usuarios/${userId}/${pathSegment}/${id}`));
      } catch (error) {
        console.error(`Erro ao excluir de ${collectionName}:`, error);
        alert("Erro ao excluir registro. Verifique suas permissões.");
      }
    }
  };

  // Specific Handlers Wrappers - Mapeando permissões
  // Apenas usuários com permissão explícita no módulo podem salvar/deletar
  const checkPermission = (module: Module) => {
    return currentUser?.permissions.includes(module) || currentUser?.role === 'Master';
  };

  const handlers = {
    // Inventory
    onAddProduct: (p: Product) => checkPermission('inventory') && handleSaveDoc("products", p),
    onUpdateProduct: (p: Product) => checkPermission('inventory') && handleSaveDoc("products", p),
    onDeleteProduct: (id: string) => checkPermission('inventory') && handleDeleteDoc("products", id),

    // Registration (Cadastro)
    onAddClient: (c: Client) => checkPermission('registration') && handleSaveDoc("clients", c),
    onDeleteClient: (id: string) => checkPermission('registration') && handleDeleteDoc("clients", id),
    onAddTech: (t: Technician) => checkPermission('registration') && handleSaveDoc("technicians", t),
    onDeleteTech: (id: string) => checkPermission('registration') && handleDeleteDoc("technicians", id),
    onAddService: (s: Service) => checkPermission('registration') && handleSaveDoc("services", s),
    onDeleteService: (id: string) => checkPermission('registration') && handleDeleteDoc("services", id),
    onAddUser: (u: UserAccount) => checkPermission('registration') && handleSaveDoc("users", u),
    onDeleteUser: (id: string) => checkPermission('registration') && handleDeleteDoc("users", id),
    onAddPaymentMethod: (pm: PaymentMethod) => checkPermission('registration') && handleSaveDoc("paymentMethods", pm),
    onDeletePaymentMethod: (id: string) => checkPermission('registration') && handleDeleteDoc("paymentMethods", id),
    onAddCategory: (c: Category) => checkPermission('registration') && handleSaveDoc("categories", c),
    onDeleteCategory: (id: string) => checkPermission('registration') && handleDeleteDoc("categories", id),

    // Quotes
    onAddQuote: (q: Quote) => checkPermission('quotes') && handleSaveDoc("quotes", q),
    onUpdateQuote: (q: Quote) => checkPermission('quotes') && handleSaveDoc("quotes", q),
    onDeleteQuote: (id: string) => checkPermission('quotes') && handleDeleteDoc("quotes", id),
    onConvertToSale: (q: Quote) => { /* TODO: Implementar conversão */ },

    // Sales
    onSaveSale: async (s: Sale) => {
      if (!checkPermission('sales')) return;

      // Save Sale
      await handleSaveDoc("sales", s);

      // Update Inventory
      s.items.forEach(item => {
        if (item.type === 'product' && item.productId) {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newStock = product.stock - item.quantity;
            // Prevent negative stock ? Or allow it? Allowing for now but maybe warn.
            const updatedProduct = { ...product, stock: newStock };
            handleSaveDoc("products", updatedProduct);
          }
        }
      });
    },
    onUpdateSale: async (s: Sale) => {
      if (!checkPermission('sales')) return;

      // 1. Revert Old Stock
      const oldSale = sales.find(os => os.id === s.id);
      if (oldSale) {
        oldSale.items.forEach(item => {
          if (item.type === 'product' && item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              handleSaveDoc("products", { ...product, stock: product.stock + item.quantity });
            }
          }
        });
      }

      // 2. Deduct New Stock (Note: In a real app, this should wait for state update or use a Map to avoid race conditions if same product)
      // For simplicity here, we assume sequential DB updates are fast enough or user interactions are slow enough.
      // A better way is to calculate net difference first.

      const distinctProducts = new Set([...(oldSale?.items || []), ...s.items].map(i => i.productId).filter(id => id));
      const stockMap: Record<string, number> = {};

      // Initialize map with current known stock
      distinctProducts.forEach(pid => {
        const p = products.find(prod => prod.id === pid);
        if (p && pid) stockMap[pid] = p.stock;
      });

      // Add back old
      oldSale?.items.forEach(item => {
        if (item.type === 'product' && item.productId) {
          if (stockMap[item.productId] !== undefined) stockMap[item.productId] += item.quantity;
        }
      });

      // Subtract new
      s.items.forEach(item => {
        if (item.type === 'product' && item.productId) {
          if (stockMap[item.productId] !== undefined) stockMap[item.productId] -= item.quantity;
        }
      });

      // Commit Updates
      for (const pid of distinctProducts) {
        if (!pid) continue;
        const p = products.find(prod => prod.id === pid);
        if (p && stockMap[pid] !== undefined && stockMap[pid] !== p.stock) {
          await handleSaveDoc("products", { ...p, stock: stockMap[pid] });
        }
      }

      await handleSaveDoc("sales", s);
    },
    onDeleteSale: (id: string) => checkPermission('sales') && handleDeleteDoc("sales", id),

    // Company
    onSaveCompany: async (c: CompanyType) => {
      if (checkPermission('company')) {
        await handleSaveDoc("companies", c);
      } else {
        alert("Você não tem permissão para editar os dados da empresa.");
      }
    },

    // Purchases
    onSavePurchase: (p: Purchase) => checkPermission('purchases') && handleSaveDoc("purchases", p),
    onDeletePurchase: (id: string) => checkPermission('purchases') && handleDeleteDoc("purchases", id),
    onUpdatePurchase: (p: Purchase) => checkPermission('purchases') && handleSaveDoc("purchases", p),
    onUpdateUser: async (u: UserAccount) => {
      if (!currentUser) return;
      if (u.id === currentUser.id) {
        // Update current user (Owner) preferences
        try {
          await update(ref(database, `usuarios/${currentUser.id}/preferencias`), u.preferences || {});
          // Manually update local state to reflect changes immediately
          setCurrentUser(prev => prev ? ({ ...prev, preferences: u.preferences }) : null);
        } catch (e: any) {
          alert("Erro ao salvar preferências: " + e.message);
        }
      } else {
        // Update sub-user
        checkPermission('settings') && handleSaveDoc("users", u);
      }
    },

    // Closures
    onSaveClosure: (c: Closure) => checkPermission('finance') && handleSaveDoc("closures", c),
    onDeleteClosure: (id: string) => checkPermission('finance') && handleDeleteDoc("closures", id),

    // Combos
    onAddCombo: (combo: Combo) => checkPermission('inventory') && handleSaveDoc("combos", combo),
    onUpdateCombo: (combo: Combo) => checkPermission('inventory') && handleSaveDoc("combos", combo),
    onDeleteCombo: (id: string) => checkPermission('inventory') && handleDeleteDoc("combos", id),

    // Offers
    onAddOffer: (offer: Offer) => checkPermission('marketing') && handleSaveDoc("offers", offer),
    onUpdateOffer: (offer: Offer) => checkPermission('marketing') && handleSaveDoc("offers", offer),
    onDeleteOffer: (id: string) => checkPermission('marketing') && handleDeleteDoc("offers", id),
  };

  const addNotification = useCallback(async (title: string, message: string, type: Notification['type'] = 'info') => {
    // 1. Create unique ID and Notification object
    const id = Date.now().toString();
    const newNote: Notification = {
      id,
      title,
      message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };

    // 2. Persist to Firebase IF authenticated
    if (currentUser) {
      await handleSaveDoc("notifications", newNote);
    } else {
      // Fallback to local state if not logged in (rare)
      setNotifications(prev => [newNote, ...prev.slice(0, 9)]);
    }
  }, [currentUser]);

  // Check for missing closures
  useEffect(() => {
    if (!isAuthenticated || sales.length === 0 || closures.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const transactionDates = new Set<string>();

    // Collect dates with activity
    sales.forEach(s => transactionDates.add(s.date));
    purchases.forEach(p => transactionDates.add(p.date));

    // Remove dates that have a closed register
    closures.forEach(c => {
      if (c.status === 'closed') {
        // Ensure we match date format (YYYY-MM-DD)
        const closureDate = c.date.split('T')[0];
        transactionDates.delete(closureDate);
      }
    });

    // Remove today and future dates from check
    transactionDates.delete(today);

    // Convert to array and filter
    const missingClosureDates = Array.from(transactionDates).filter(date => date < today);

    // Notify for each missing date
    if (missingClosureDates.length > 0) {
      // Avoid spamming: Check if we already notified about this session? 
      // Simplified: Just add one summary notification if many, or individual if few.
      // For now, let's just show one alert for the most recent missing day to avoid popup storm.
      const newestMissing = missingClosureDates.sort().pop();
      if (newestMissing) {
        // Use a timeout to not conflict with initial render/login
        setTimeout(() => {
          addNotification(
            "Caixa Pendente",
            `O caixa do dia ${new Date(newestMissing).toLocaleDateString('pt-BR')} tem movimentações mas não consta como fechado.`,
            "warning"
          );
        }, 3000);
      }
    }
  }, [sales, purchases, closures, isAuthenticated, addNotification]);


  const handleLogout = async () => {
    await signOut(auth);
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Screen for Loading
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Screen for Login
  if (!isAuthenticated) {
    return <Login onLogin={() => { }} users={users} />;
  }

  // Access Control Logic - Strict as requested
  const isMaster = currentUser?.email === 'geovaniwn@gmail.com';

  // Rule 5.1 and 5.2
  const isBlocked = !isMaster && (
    accountStatus !== 'aprovado' ||
    !licenseActive ||
    paymentStatus !== 'em_dia'
  );

  // Determine specific block message
  let blockTitle = "Acesso Negado";
  let blockMessage = "Entre em contato com o suporte.";

  if (accountStatus === 'pendente') {
    blockTitle = "Cadastro em Análise";
    blockMessage = "Sua conta foi criada e está aguardando aprovação administrativa.";
  } else if (accountStatus === 'negado') {
    blockTitle = "Cadastro Negado";
    blockMessage = "Sua solicitação de acesso foi recusada.";
  } else if (accountStatus === 'inativo') {
    blockTitle = "Conta Inativa";
    blockMessage = "Sua conta foi desativada.";
  } else if (!licenseActive) {
    blockTitle = "Licença Inativa";
    blockMessage = "Sua licença expirou ou não está ativa.";
  } else if (paymentStatus !== 'em_dia') {
    blockTitle = "Pagamento Pendente";
    blockMessage = "Identificamos pendências financeiras em sua conta.";
  }

  // Reuse logic for screens but adapted
  if (isBlocked) {
    if (accountStatus === 'pendente') {
      // Pending Screen
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center animate-in fade-in duration-700">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-slate-100 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Clock size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{blockTitle}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{blockMessage}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status Atual</h4>
              <div className="flex items-center space-x-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <span className="text-sm font-bold text-slate-700">Aguardando Liberação</span>
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl">Verificar Novamente</button>
            <button onClick={handleLogout} className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Sair</button>
          </div>
        </div>
      );
    } else {
      // Generic Blocked Screen
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
          <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 relative">
            <div className="absolute inset-0 bg-red-500/5 rounded-[3rem] pointer-events-none"></div>
            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50"><Lock size={48} /></div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{blockTitle}</h2>
              <p className="text-slate-500 font-medium mt-2">{blockMessage}</p>
            </div>
            <button onClick={() => window.open('https://wa.me/5562998554529')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
              Regularizar Agora
            </button>
            <button onClick={handleLogout} className="text-slate-400 font-bold text-xs uppercase hover:underline hover:text-slate-600 transition-colors">Encerrar Sessão</button>
          </div>
        </div>
      );
    }
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard sales={sales} quotes={quotes} products={products} clients={clients} company={company} purchases={purchases} user={currentUser} />;
      case 'inventory':
        return <Inventory products={products} onAddProduct={handlers.onAddProduct} onUpdateProduct={handlers.onUpdateProduct} onDeleteProduct={handlers.onDeleteProduct} />;
      case 'quotes':
        return <Quotes
          quotes={quotes}
          clients={clients}
          products={products}
          services={services}
          technicians={technicians}
          company={company}
          triggerNewOS={triggerNewOS}
          onModalClose={() => setTriggerNewOS(false)}
          onAddQuote={handlers.onAddQuote}
          onUpdateQuote={handlers.onUpdateQuote}
          onDeleteQuote={handlers.onDeleteQuote}
          onConvertToSale={handlers.onConvertToSale}
        />;
      case 'registration':
        return <Registration
          clients={clients}
          technicians={technicians}
          services={services}
          users={users}
          paymentMethods={paymentMethods}
          onAddClient={handlers.onAddClient}
          onAddTech={handlers.onAddTech}
          onAddService={handlers.onAddService}
          onAddUser={handlers.onAddUser}
          onAddPaymentMethod={handlers.onAddPaymentMethod}
          onDeleteClient={handlers.onDeleteClient}
          onDeleteTech={handlers.onDeleteTech}
          onDeleteService={handlers.onDeleteService}
          onDeleteUser={handlers.onDeleteUser}
          onDeletePaymentMethod={handlers.onDeletePaymentMethod}
          combos={combos}
          offers={offers}
          onAddCombo={handlers.onAddCombo}
          onUpdateCombo={handlers.onUpdateCombo}
          onDeleteCombo={handlers.onDeleteCombo}
          onAddOffer={handlers.onAddOffer}
          onUpdateOffer={handlers.onUpdateOffer}
          onDeleteOffer={handlers.onDeleteOffer}
        />;
      case 'sales':
        return <Sales
          sales={sales}
          products={products}
          services={services}
          clients={clients}
          paymentMethods={paymentMethods}
          company={company}
          user={currentUser}
          onNewOS={() => { setActiveModule('quotes'); setTriggerNewOS(true); }}
          onSaveSale={handlers.onSaveSale}
          onUpdateSale={handlers.onUpdateSale}
          onDeleteSale={handlers.onDeleteSale}
          combos={combos}
          offers={offers}
        />;
      case 'purchases':
        return <Purchases purchases={purchases} products={products} company={company} onSavePurchase={handlers.onSavePurchase} onDeletePurchase={handlers.onDeletePurchase} onUpdatePurchase={handlers.onUpdatePurchase} />;
      case 'reports':
        return <Reports sales={sales} purchases={purchases} quotes={quotes} products={products} clients={clients} company={company} />;
      case 'company':
        return <Company company={company} onSave={handlers.onSaveCompany} />;
      case 'settings':
        return <Settings user={currentUser} company={company} sessions={sessions} onUpdateUser={handlers.onUpdateUser} onSaveCompany={handlers.onSaveCompany} />;
      case 'finance':
        return <Finance sales={sales} purchases={purchases} company={company} closures={closures} onSaveClosure={handlers.onSaveClosure} onDeleteClosure={handlers.onDeleteClosure} />;
      case 'help':
        return <Help />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'management':
        return <AdminPanel onLogout={handleLogout} currentUser={currentUser} />;
      case 'marketing':
        return <Portfolio company={company} user={currentUser} />;
      default:
        return <Dashboard sales={sales} quotes={quotes} products={products} clients={clients} company={company} purchases={purchases} user={currentUser} />;
    }
  };

  return (
    <Layout
      activeModule={activeModule} onModuleChange={setActiveModule} onLogout={handleLogout}
      company={company} user={currentUser} notifications={notifications}
      onMarkRead={async (id: string) => {
        const note = notifications.find(n => n.id === id);
        if (note && !note.read) {
          await handleSaveDoc("notifications", { ...note, read: true });
        }
      }}
      onDeleteNotification={async (id: string) => {
        await handleDeleteDoc("notifications", id);
      }}
      onDeleteAllNotifications={async () => {
        if (notifications.length > 0 && confirm("Excluir todas as notificações?")) {
          const userId = currentUser?.id;
          if (userId) {
            await remove(ref(database, `usuarios/${userId}/notificacoes`));
          }
        }
      }}
      onClearAll={async () => {
        const unreadNotes = notifications.filter(n => !n.read);
        if (unreadNotes.length > 0) {
          // Update all unread in Firebase
          for (const note of unreadNotes) {
            await handleSaveDoc("notifications", { ...note, read: true });
          }
        }
      }}
      userPermissions={currentUser?.permissions || []}
    >
      {renderModule()}
    </Layout>
  );
};

export default App;
